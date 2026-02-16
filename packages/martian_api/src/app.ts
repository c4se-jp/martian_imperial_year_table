import { Hono } from "hono";
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

type ErrorResponse = {
  message: string;
};

export const app = new Hono();

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

  const validationError = validateTimezone(body.gregorianTimezone);
  if (validationError) {
    return c.json<ErrorResponse>({ message: validationError }, 400);
  }

  try {
    return c.json<GregorianDateTimeConversionResponse>(
      buildImperialToGregorianResponse(body.imperialDateTimeFormatted, body.gregorianTimezone),
      200,
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid imperialDateTimeFormatted") {
      return c.json<ErrorResponse>({ message: error.message }, 400);
    }
    return c.json<ErrorResponse>({ message: "Internal server error" }, 500);
  }
});

app.get("/api/imperial-datetime/current", (c) => {
  const timezone = c.req.query("timezone") ?? "+00:00";
  const validationError = validateTimezone(timezone);
  if (validationError) {
    return c.json<ErrorResponse>({ message: validationError }, 400);
  }

  try {
    return c.json<CurrentImperialDateTimeResponse>(buildCurrentImperialDateTimeResponse(new Date(), timezone), 200);
  } catch {
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

  const validationError = validateTimezone(body.imperialTimezone);
  if (validationError) {
    return c.json<ErrorResponse>({ message: validationError }, 400);
  }

  try {
    return c.json<ImperialDateTimeConversionResponse>(
      buildGregorianToImperialResponse(body.gregorianDateTime, body.imperialTimezone),
      200,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Invalid gregorianDateTime" || error.message === "Invalid gregorianDateTime format")
    ) {
      return c.json<ErrorResponse>({ message: error.message }, 400);
    }
    return c.json<ErrorResponse>({ message: "Internal server error" }, 500);
  }
});

registerMcpRoute(app);

app.notFound((c) => c.json<ErrorResponse>({ message: "Not Found" }, 404));
