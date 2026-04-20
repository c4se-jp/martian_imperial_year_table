import { SpanStatusCode, trace } from "@opentelemetry/api";
import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  buildCurrentImperialDateTimeResponse,
  buildGregorianToImperialResponse,
  buildImperialToGregorianResponse,
  type CurrentImperialDateTimeResponse,
  type GregorianDateTimeConversionResponse,
  type ImperialDateTimeConversionResponse,
  validateTimezone,
} from "./datetime-conversion.js";
import { registerMcpRoute } from "./mcp.js";
import { recordError, runWithSpan } from "./telemetry.js";

type ErrorResponse = {
  message: string;
};

export const app = new Hono();

app.use(
  "/mcp",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: ["Accept", "Content-Type", "Last-Event-ID", "Mcp-Protocol-Version", "Mcp-Session-Id"],
    exposeHeaders: ["Mcp-Protocol-Version", "Mcp-Session-Id"],
  }),
);

app.use("*", async (c, next) => {
  const tracer = trace.getTracer("martian_api");
  const url = new URL(c.req.url);

  return tracer.startActiveSpan(`${c.req.method} ${c.req.path}`, async (span) => {
    span.setAttributes({
      "http.request.method": c.req.method,
      "http.route": c.req.path,
      "server.address": url.hostname,
      "url.full": c.req.url,
      "url.path": c.req.path,
      "url.query": url.search,
    });

    try {
      await next();
      span.setAttribute("http.response.status_code", c.res.status);
      if (c.res.status >= 500) {
        span.setStatus({ code: SpanStatusCode.ERROR });
      } else {
        span.setStatus({ code: SpanStatusCode.OK });
      }
    } catch (error) {
      span.setAttribute("http.response.status_code", 500);
      recordError(error, span);
      throw error;
    } finally {
      span.end();
    }
  });
});

type ImperialToGregorianRequest = {
  imperialDateTimeFormatted: string;
  gregorianTimezone: string;
};

app.post("/api/gregorian-datetime/from-imperial", async (c) => {
  let body: Partial<ImperialToGregorianRequest>;
  try {
    body = await c.req.json<ImperialToGregorianRequest>();
  } catch {
    return c.json<ErrorResponse>({ message: "Invalid request body" }, 400);
  }

  if (typeof body.imperialDateTimeFormatted !== "string" || typeof body.gregorianTimezone !== "string") {
    return c.json<ErrorResponse>({ message: "Invalid request body" }, 400);
  }
  const imperialDateTimeFormatted = body.imperialDateTimeFormatted;
  const gregorianTimezone = body.gregorianTimezone;

  const validationError = validateTimezone(gregorianTimezone);
  if (validationError) {
    return c.json<ErrorResponse>({ message: validationError }, 400);
  }

  try {
    return c.json<GregorianDateTimeConversionResponse>(
      await runWithSpan("buildImperialToGregorianResponse", { "app.operation": "imperial_to_gregorian" }, () =>
        buildImperialToGregorianResponse(imperialDateTimeFormatted, gregorianTimezone),
      ),
      200,
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid imperialDateTimeFormatted") {
      return c.json<ErrorResponse>({ message: error.message }, 400);
    }
    recordError(error);
    return c.json<ErrorResponse>({ message: "Internal server error" }, 500);
  }
});

app.get("/api/imperial-datetime/current", async (c) => {
  const timezone = c.req.query("timezone") ?? "+00:00";
  const validationError = validateTimezone(timezone);
  if (validationError) {
    return c.json<ErrorResponse>({ message: validationError }, 400);
  }

  try {
    return c.json<CurrentImperialDateTimeResponse>(
      await runWithSpan("buildCurrentImperialDateTimeResponse", { "app.operation": "current_imperial_datetime" }, () =>
        buildCurrentImperialDateTimeResponse(new Date(), timezone),
      ),
      200,
    );
  } catch (error) {
    recordError(error);
    return c.json<ErrorResponse>({ message: "Internal server error" }, 500);
  }
});

type GregorianToImperialRequest = {
  gregorianDateTime: string;
  imperialTimezone: string;
};

app.post("/api/imperial-datetime/from-gregorian", async (c) => {
  let body: Partial<GregorianToImperialRequest>;
  try {
    body = await c.req.json<GregorianToImperialRequest>();
  } catch {
    return c.json<ErrorResponse>({ message: "Invalid request body" }, 400);
  }

  if (typeof body.gregorianDateTime !== "string" || typeof body.imperialTimezone !== "string") {
    return c.json<ErrorResponse>({ message: "Invalid request body" }, 400);
  }
  const gregorianDateTime = body.gregorianDateTime;
  const imperialTimezone = body.imperialTimezone;

  const validationError = validateTimezone(imperialTimezone);
  if (validationError) {
    return c.json<ErrorResponse>({ message: validationError }, 400);
  }

  try {
    return c.json<ImperialDateTimeConversionResponse>(
      await runWithSpan("buildGregorianToImperialResponse", { "app.operation": "gregorian_to_imperial" }, () =>
        buildGregorianToImperialResponse(gregorianDateTime, imperialTimezone),
      ),
      200,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Invalid gregorianDateTime" || error.message === "Invalid gregorianDateTime format")
    ) {
      return c.json<ErrorResponse>({ message: error.message }, 400);
    }
    recordError(error);
    return c.json<ErrorResponse>({ message: "Internal server error" }, 500);
  }
});

registerMcpRoute(app);

app.notFound((c) => c.json<ErrorResponse>({ message: "Not Found" }, 404));
