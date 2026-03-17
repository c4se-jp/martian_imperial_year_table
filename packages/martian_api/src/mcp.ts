import { StreamableHTTPTransport } from "@hono/mcp";
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";
import { readFileSync } from "node:fs";
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
    outputTemplate?: string;
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
  distHtmlPath: URL;
  sourceHtmlPath: URL;
};

const widgetAssets: Record<string, WidgetAsset> = {
  "ui://widget/datetime-conversion.html": {
    distHtmlPath: new URL("../../../dist/widget/datetime-conversion-widget.html", import.meta.url),
    sourceHtmlPath: new URL("../../martian_ui/src/widget/datetime-conversion-widget.html", import.meta.url),
  },
  "ui://widget/current-imperial-datetime.html": {
    distHtmlPath: new URL("../../../dist/widget/current-imperial-datetime-widget.html", import.meta.url),
    sourceHtmlPath: new URL("../../martian_ui/src/widget/current-imperial-datetime-widget.html", import.meta.url),
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
    ...(tool.meta?.outputTemplate ? { ui: { resourceUri: tool.meta.outputTemplate } } : {}),
    ...(tool.meta?.outputTemplate ? { "openai/outputTemplate": tool.meta.outputTemplate } : {}),
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
  const server = new McpServer({ name: mcpManifest.server.name, version: mcpManifest.server.version });
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

        try {
          widgetHtml = rewriteWidgetAssetUrls(readFileSync(asset.distHtmlPath, "utf8"), widgetResource);
        } catch {
          widgetHtml = readFileSync(asset.sourceHtmlPath, "utf8");
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
