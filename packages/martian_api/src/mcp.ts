import { StreamableHTTPTransport } from "@hono/mcp";
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { URL } from "node:url";
import { z } from "zod";
import mcpManifest from "./mcp-manifest.json" with { type: "json" };
import {
  buildCurrentImperialDateTimeResponse,
  buildGregorianToImperialResponse,
  buildImperialToGregorianResponse,
  validateTimezone,
} from "./datetime-conversion.js";

type ToolMode = "convert_gregorian_to_imperial" | "get_current_imperial" | "convert_imperial_to_gregorian";

type ManifestField = {
  type: "string";
  pattern?: string;
  patternMessage?: string;
  description?: string;
  default?: string;
};

type ManifestTool = {
  name: string;
  mode: ToolMode;
  title: string;
  description: string;
  readOnlyHint?: boolean;
  inputSchema: Record<string, ManifestField>;
  meta?: {
    resourceUri?: string;
    invoking?: string;
    invoked?: string;
  };
};

type ManifestResource = {
  id: string;
  uri: string;
  title: string;
  description: string;
  mimeType?: string;
  meta: {
    widgetDescription: string;
    widgetPrefersBorder: boolean;
    connectDomains: string[];
    resourceDomains: string[];
    domain?: string;
  };
};

type ToolResult = {
  error?: string;
  mode: ToolMode;
  request: Record<string, unknown>;
  response?: Record<string, unknown>;
};

type WidgetAsset = {
  distHtmlPathCandidates: string[];
  sourceHtmlPathCandidates: string[];
};

const imperialDateTimeBodySchema = {
  year: z.number(),
  month: z.number(),
  day: z.number(),
  hour: z.number(),
  minute: z.number(),
  second: z.number(),
  timezone: z.string(),
};

function buildResponseSchema(mode: ToolMode) {
  if (mode === "convert_gregorian_to_imperial") {
    return z.object({
      imperialDateTime: z.object(imperialDateTimeBodySchema),
      imperialDateTimeFormatted: z.string(),
    });
  }

  if (mode === "get_current_imperial") {
    return z.object({
      gregorianDateTime: z.string(),
      imperialDateTime: z.object(imperialDateTimeBodySchema),
      imperialDateTimeFormatted: z.string(),
    });
  }

  return z.object({
    gregorianDateTime: z.string(),
  });
}

function buildOutputSchema(mode: ToolMode) {
  return {
    mode: z.literal(mode),
    request: z.record(z.string(), z.unknown()),
    response: buildResponseSchema(mode).optional(),
    error: z.string().optional(),
  };
}

function buildCandidatePaths(relativePath: string): string[] {
  return Array.from(
    new Set([
      path.resolve(process.cwd(), relativePath),
      path.resolve(process.cwd(), "..", relativePath),
      path.resolve(process.cwd(), "../..", relativePath),
      path.resolve(process.cwd(), "packages/martian_api", relativePath),
    ]),
  );
}

function buildSourceHtmlPathCandidates(...relativePaths: string[]): string[] {
  return Array.from(new Set(relativePaths.flatMap((relativePath) => buildCandidatePaths(relativePath))));
}

function resolveExistingPath(candidates: string[]): string | undefined {
  return candidates.find((candidate) => existsSync(candidate));
}

const widgetAssets: Record<string, WidgetAsset> = {
  "ui://widget/datetime-conversion.html": {
    distHtmlPathCandidates: buildCandidatePaths("dist/widget/datetime-conversion-widget.html"),
    sourceHtmlPathCandidates: buildSourceHtmlPathCandidates(
      "packages/martian_widget_ui/src/widget/datetime-conversion-widget.html",
    ),
  },
  "ui://widget/current-imperial-datetime.html": {
    distHtmlPathCandidates: buildCandidatePaths("dist/widget/current-imperial-datetime-widget.html"),
    sourceHtmlPathCandidates: buildSourceHtmlPathCandidates(
      "packages/martian_widget_ui/src/widget/current-imperial-datetime-widget.html",
    ),
  },
};

function resolveWidgetPublicBase(widgetResource: ManifestResource): string | undefined {
  const baseOrigin = widgetResource.meta.domain ?? widgetResource.meta.resourceDomains[0];
  if (baseOrigin === undefined) {
    return undefined;
  }

  try {
    return new URL("/widget/", baseOrigin).toString();
  } catch {
    return undefined;
  }
}

function rewriteWidgetAssetUrls(widgetHtml: string, widgetResource: ManifestResource): string {
  const widgetPublicBase = resolveWidgetPublicBase(widgetResource);
  if (widgetPublicBase === undefined) {
    return widgetHtml;
  }

  return widgetHtml
    .replaceAll(/(<script[^>]+src=")(\.\/[^"]+)"/gu, (_match, prefix: string, relativePath: string) => {
      return `${prefix}${new URL(relativePath.replace(/^\.\//u, ""), widgetPublicBase).toString()}"`;
    })
    .replaceAll(/(<link[^>]+href=")(\.\/[^"]+)"/gu, (_match, prefix: string, relativePath: string) => {
      return `${prefix}${new URL(relativePath.replace(/^\.\//u, ""), widgetPublicBase).toString()}"`;
    });
}

function errorResult(message: string, mode: ToolMode, request: Record<string, unknown>) {
  const structuredContent: ToolResult = {
    mode,
    request,
    error: message,
  };
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
    structuredContent,
  };
}

function successResult(mode: ToolMode, request: Record<string, unknown>, response: Record<string, unknown>) {
  const structuredContent: ToolResult = {
    mode,
    request,
    response,
  };
  return {
    content: [{ type: "text" as const, text: JSON.stringify(response) }],
    structuredContent,
  };
}

function createStringSchema(field: ManifestField) {
  let schema = z.string();
  if (field.pattern) {
    schema = schema.regex(new RegExp(field.pattern), field.patternMessage ?? "Invalid format");
  }
  if (field.description) {
    schema = schema.describe(field.description);
  }
  if (field.default !== undefined) {
    return schema.default(field.default);
  }
  return schema;
}

function buildInputSchema(shape: ManifestTool["inputSchema"]) {
  return Object.fromEntries(Object.entries(shape).map(([key, field]) => [key, createStringSchema(field)]));
}

function buildToolMeta(tool: ManifestTool) {
  return {
    ...(tool.meta?.resourceUri ? { ui: { resourceUri: tool.meta.resourceUri } } : {}),
    ...(tool.meta?.invoked ? { "openai/toolInvocation/invoked": tool.meta.invoked } : {}),
    ...(tool.meta?.invoking ? { "openai/toolInvocation/invoking": tool.meta.invoking } : {}),
  };
}

async function handleToolCall(
  mode: ToolMode,
  args: Record<string, string>,
): Promise<{
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
  structuredContent: ToolResult;
}> {
  if (mode === "convert_gregorian_to_imperial") {
    const request = {
      gregorianDateTime: args.gregorianDateTime,
      imperialTimezone: args.imperialTimezone,
    };
    const validationError = validateTimezone(args.imperialTimezone);
    if (validationError) {
      return errorResult(validationError, mode, request);
    }

    try {
      const response = buildGregorianToImperialResponse(args.gregorianDateTime, args.imperialTimezone) as Record<
        string,
        unknown
      >;
      return successResult(mode, request, response);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "Invalid gregorianDateTime" || error.message === "Invalid gregorianDateTime format")
      ) {
        return errorResult(error.message, mode, request);
      }
      return errorResult("Internal server error", mode, request);
    }
  }

  if (mode === "get_current_imperial") {
    const request = { timezone: args.timezone };
    const validationError = validateTimezone(args.timezone);
    if (validationError) {
      return errorResult(validationError, mode, request);
    }

    try {
      const response = buildCurrentImperialDateTimeResponse(new Date(), args.timezone) as Record<string, unknown>;
      return successResult(mode, request, response);
    } catch {
      return errorResult("Internal server error", mode, request);
    }
  }

  const request = {
    imperialDateTimeFormatted: args.imperialDateTimeFormatted,
    gregorianTimezone: args.gregorianTimezone,
  };
  const validationError = validateTimezone(args.gregorianTimezone);
  if (validationError) {
    return errorResult(validationError, mode, request);
  }

  try {
    const response = buildImperialToGregorianResponse(args.imperialDateTimeFormatted, args.gregorianTimezone) as Record<
      string,
      unknown
    >;
    return successResult(mode, request, response);
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid imperialDateTimeFormatted") {
      return errorResult(error.message, mode, request);
    }
    return errorResult("Internal server error", mode, request);
  }
}

function createMcpServer(): McpServer {
  const primaryResource = mcpManifest.resources[0] as ManifestResource | undefined;
  const server = new McpServer({
    name: mcpManifest.server.name,
    title: mcpManifest.server.title,
    description: mcpManifest.server.description,
    version: mcpManifest.server.version,
    websiteUrl: primaryResource?.meta.resourceDomains[0],
  });
  for (const widgetResource of mcpManifest.resources as unknown as ManifestResource[]) {
    const asset = widgetAssets[widgetResource.uri];
    registerAppResource(
      server,
      widgetResource.title,
      widgetResource.uri,
      {
        description: widgetResource.description,
        mimeType: widgetResource.mimeType ?? RESOURCE_MIME_TYPE,
        _meta: {
          ui: {
            csp: {
              connectDomains: widgetResource.meta.connectDomains,
              resourceDomains: widgetResource.meta.resourceDomains,
            },
            domain: widgetResource.meta.domain,
            prefersBorder: widgetResource.meta.widgetPrefersBorder,
          },
        },
      },
      () => {
        let widgetHtml = "";
        const distHtmlPath = resolveExistingPath(asset.distHtmlPathCandidates);
        const sourceHtmlPath = resolveExistingPath(asset.sourceHtmlPathCandidates);

        try {
          if (distHtmlPath === undefined) {
            throw new Error("dist widget html not found");
          }
          widgetHtml = rewriteWidgetAssetUrls(readFileSync(distHtmlPath, "utf8"), widgetResource);
        } catch {
          if (sourceHtmlPath === undefined) {
            throw new Error(`widget html not found for ${widgetResource.uri}`);
          }
          widgetHtml = readFileSync(sourceHtmlPath, "utf8");
        }

        return {
          contents: [
            {
              mimeType: RESOURCE_MIME_TYPE,
              text: widgetHtml,
              uri: widgetResource.uri,
              _meta: {
                ui: {
                  csp: {
                    connectDomains: widgetResource.meta.connectDomains,
                    resourceDomains: widgetResource.meta.resourceDomains,
                  },
                  domain: widgetResource.meta.domain,
                  prefersBorder: widgetResource.meta.widgetPrefersBorder,
                },
              },
            },
          ],
        };
      },
    );
  }

  for (const tool of mcpManifest.tools as unknown as ManifestTool[]) {
    registerAppTool(
      server,
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        annotations: { readOnlyHint: tool.readOnlyHint === true },
        inputSchema: buildInputSchema(tool.inputSchema),
        outputSchema: buildOutputSchema(tool.mode),
        _meta: buildToolMeta(tool),
      },
      async (args: Record<string, string>) => handleToolCall(tool.mode, args),
    );
  }

  return server;
}

export function registerMcpRoute(app: Hono): void {
  app.all("/mcp", async (c) => {
    const server = createMcpServer();
    const transport = new StreamableHTTPTransport();
    await server.connect(transport);
    return transport.handleRequest(c);
  });
}
