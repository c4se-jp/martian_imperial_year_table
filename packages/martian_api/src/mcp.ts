import { StreamableHTTPTransport } from "@hono/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";
import { z } from "zod";
import {
  buildCurrentImperialDateTimeResponse,
  buildGregorianToImperialResponse,
  buildImperialToGregorianResponse,
  validateTimezone,
} from "./datetime-conversion.js";

function errorResult(message: string) {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}

function textResult(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value) }],
  };
}

function createMcpServer(): McpServer {
  const server = new McpServer({ name: "martian_api", version: "0.1.0" });

  server.tool(
    "convert_gregorian_to_imperial_datetime",
    {
      gregorianDateTime: z.string(),
      imperialTimezone: z.string(),
    },
    async ({ gregorianDateTime, imperialTimezone }: { gregorianDateTime: string; imperialTimezone: string }) => {
      const validationError = validateTimezone(imperialTimezone);
      if (validationError) {
        return errorResult(validationError);
      }

      try {
        return textResult(buildGregorianToImperialResponse(gregorianDateTime, imperialTimezone));
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message === "Invalid gregorianDateTime" || error.message === "Invalid gregorianDateTime format")
        ) {
          return errorResult(error.message);
        }
        return errorResult("Internal server error");
      }
    },
  );

  server.tool(
    "get_current_imperial_datetime",
    { timezone: z.string().default("+00:00") },
    async ({ timezone }: { timezone: string }) => {
      const validationError = validateTimezone(timezone);
      if (validationError) {
        return errorResult(validationError);
      }

      try {
        return textResult(buildCurrentImperialDateTimeResponse(new Date(), timezone));
      } catch {
        return errorResult("Internal server error");
      }
    },
  );

  server.tool(
    "convert_imperial_to_gregorian_datetime",
    {
      imperialDateTimeFormatted: z.string(),
      gregorianTimezone: z.string(),
    },
    async ({
      imperialDateTimeFormatted,
      gregorianTimezone,
    }: {
      imperialDateTimeFormatted: string;
      gregorianTimezone: string;
    }) => {
      const validationError = validateTimezone(gregorianTimezone);
      if (validationError) {
        return errorResult(validationError);
      }

      try {
        return textResult(buildImperialToGregorianResponse(imperialDateTimeFormatted, gregorianTimezone));
      } catch (error) {
        if (error instanceof Error && error.message === "Invalid imperialDateTimeFormatted") {
          return errorResult(error.message);
        }
        return errorResult("Internal server error");
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
