import { StreamableHTTPTransport } from "@hono/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";
import { readFileSync } from "node:fs";
import { z } from "zod";
import {
  buildCurrentImperialDateTimeResponse,
  buildGregorianToImperialResponse,
  buildImperialToGregorianResponse,
  validateTimezone,
} from "./datetime-conversion.js";

const widgetUri = "ui://widget/martian-datetime.html";
const widgetJsUri = "ui://widget/chatgpt-widget.js";
const widgetCssUri = "ui://widget/chatgpt-widget.css";
const widgetHtmlPath = new URL("../../../dist/widget/src/widget/chatgpt-widget.html", import.meta.url);
const widgetJsPath = new URL("../../../dist/widget/chatgpt-widget.js", import.meta.url);
const widgetCssPath = new URL("../../../dist/widget/chatgpt-widget.css", import.meta.url);
const widgetSourceHtmlPath = new URL("../../martian_ui/src/widget/chatgpt-widget.html", import.meta.url);

type ToolMode = "convert_gregorian_to_imperial" | "get_current_imperial" | "convert_imperial_to_gregorian";

type ToolResult = {
  error?: string;
  mode: ToolMode;
  request: Record<string, unknown>;
  response?: Record<string, unknown>;
};

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

const timezoneSchema = z
  .string()
  .regex(/^[+-](?:[01]\d|2[0-3]):[0-5]\d$/, "Timezone must be in format ±HH:MM")
  .describe("Timezone offset from UTC in ±HH:MM format (example: +09:00)");

const gregorianDateTimeSchema = z
  .string()
  .regex(
    /^\d{4,}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/,
    "DateTime must be ISO 8601 with timezone (e.g. 2026-02-16T00:00:00+00:00)",
  )
  .describe("Gregorian datetime in ISO 8601 format with timezone");

const imperialDateTimeFormattedSchema = z
  .string()
  .regex(
    /^\d{4,}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/,
    "DateTime must be YYYY-MM-DDTHH:mm:ss±HH:MM (e.g. 1220-01-01T00:00:00+00:00)",
  )
  .describe("Imperial datetime formatted as YYYY-MM-DDTHH:mm:ss±HH:MM");

function createMcpServer(): McpServer {
  const server = new McpServer({ name: "martian_api", version: "0.1.0" });

  server.registerResource(
    "martian_datetime_widget",
    widgetUri,
    {
      title: "帝國火星曆 Widget",
      description: "火星曆と地球曆を相互に變換する單一 widget UI",
      mimeType: "text/html",
      _meta: {
        "openai/widgetCSP": {
          connect_domains: [],
          resource_domains: [],
        },
        "openai/widgetDescription": "火星曆と地球曆の日時を相互に變換できます。",
        "openai/widgetPrefersBorder": true,
      },
    },
    () => {
      let widgetHtml = "";
      let widgetJs = "";
      let widgetCss = "";

      try {
        widgetHtml = readFileSync(widgetHtmlPath, "utf8");
        widgetJs = readFileSync(widgetJsPath, "utf8");
        widgetCss = readFileSync(widgetCssPath, "utf8");
        widgetHtml = widgetHtml
          .replaceAll("../../chatgpt-widget.js", "./chatgpt-widget.js")
          .replaceAll("../../chatgpt-widget.css", "./chatgpt-widget.css");
      } catch {
        widgetHtml = readFileSync(widgetSourceHtmlPath, "utf8");
      }

      return {
        contents: [
          {
            mimeType: "text/html",
            text: widgetHtml,
            uri: widgetUri,
          },
          ...(widgetJs.length > 0
            ? [
                {
                  mimeType: "application/javascript",
                  text: widgetJs,
                  uri: widgetJsUri,
                },
              ]
            : []),
          ...(widgetCss.length > 0
            ? [
                {
                  mimeType: "text/css",
                  text: widgetCss,
                  uri: widgetCssUri,
                },
              ]
            : []),
        ],
      };
    },
  );

  server.registerTool(
    "convert_gregorian_to_imperial_datetime",
    {
      title: "Gregorian日時から帝國火星曆へ變換",
      description: "グレゴリオ曆の日時を帝國火星曆の日時へ變換します。",
      annotations: { readOnlyHint: true },
      inputSchema: {
        gregorianDateTime: gregorianDateTimeSchema,
        imperialTimezone: timezoneSchema,
      },
      _meta: {
        "openai/outputTemplate": widgetUri,
        "openai/toolInvocation/invoked": "變換が完了しました",
        "openai/toolInvocation/invoking": "變換中です",
      },
    },
    async ({ gregorianDateTime, imperialTimezone }: { gregorianDateTime: string; imperialTimezone: string }) => {
      const request = { gregorianDateTime, imperialTimezone };
      const validationError = validateTimezone(imperialTimezone);
      if (validationError) {
        return errorResult(validationError, "convert_gregorian_to_imperial", request);
      }

      try {
        const response = buildGregorianToImperialResponse(gregorianDateTime, imperialTimezone) as Record<
          string,
          unknown
        >;
        return successResult("convert_gregorian_to_imperial", request, response);
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message === "Invalid gregorianDateTime" || error.message === "Invalid gregorianDateTime format")
        ) {
          return errorResult(error.message, "convert_gregorian_to_imperial", request);
        }
        return errorResult("Internal server error", "convert_gregorian_to_imperial", request);
      }
    },
  );

  server.registerTool(
    "get_current_imperial_datetime",
    {
      title: "現在の帝國火星曆日時を取得",
      description: "指定タイムゾーンで現在の帝國火星曆日時を返します。",
      annotations: { readOnlyHint: true },
      inputSchema: { timezone: timezoneSchema.default("+00:00") },
      _meta: {
        "openai/outputTemplate": widgetUri,
        "openai/toolInvocation/invoked": "取得が完了しました",
        "openai/toolInvocation/invoking": "取得中です",
      },
    },
    async ({ timezone }: { timezone: string }) => {
      const request = { timezone };
      const validationError = validateTimezone(timezone);
      if (validationError) {
        return errorResult(validationError, "get_current_imperial", request);
      }

      try {
        const response = buildCurrentImperialDateTimeResponse(new Date(), timezone) as Record<string, unknown>;
        return successResult("get_current_imperial", request, response);
      } catch {
        return errorResult("Internal server error", "get_current_imperial", request);
      }
    },
  );

  server.registerTool(
    "convert_imperial_to_gregorian_datetime",
    {
      title: "帝國火星曆日時からGregorianへ變換",
      description: "帝國火星曆の日時をグレゴリオ曆の日時へ變換します。",
      annotations: { readOnlyHint: true },
      inputSchema: {
        imperialDateTimeFormatted: imperialDateTimeFormattedSchema,
        gregorianTimezone: timezoneSchema,
      },
      _meta: {
        "openai/outputTemplate": widgetUri,
        "openai/toolInvocation/invoked": "變換が完了しました",
        "openai/toolInvocation/invoking": "變換中です",
      },
    },
    async ({
      imperialDateTimeFormatted,
      gregorianTimezone,
    }: {
      imperialDateTimeFormatted: string;
      gregorianTimezone: string;
    }) => {
      const request = { imperialDateTimeFormatted, gregorianTimezone };
      const validationError = validateTimezone(gregorianTimezone);
      if (validationError) {
        return errorResult(validationError, "convert_imperial_to_gregorian", request);
      }

      try {
        const response = buildImperialToGregorianResponse(imperialDateTimeFormatted, gregorianTimezone) as Record<
          string,
          unknown
        >;
        return successResult("convert_imperial_to_gregorian", request, response);
      } catch (error) {
        if (error instanceof Error && error.message === "Invalid imperialDateTimeFormatted") {
          return errorResult(error.message, "convert_imperial_to_gregorian", request);
        }
        return errorResult("Internal server error", "convert_imperial_to_gregorian", request);
      }
    },
  );

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
