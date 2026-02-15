import { Hono } from "hono";
import {
  GregorianDateTime,
  ImperialDateTime,
  grdtToJuld,
  imdtToImsn,
  imsnToImdt,
  imsnToMrsd,
  juldToGrdt,
  juldToTert,
  mrsdToImsn,
  mrsdToTert,
  tertToJuld,
  tertToMrsd,
} from "imperial_calendar";

type ErrorResponse = {
  message: string;
};

type ImperialDateTimeBody = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  timezone: string;
};

const TIMEZONE_PATTERN = /^([+-])(\d{2}):(\d{2})$/;

function validateTimezone(timezone: string): string | null {
  const match = TIMEZONE_PATTERN.exec(timezone);
  if (!match) {
    return "Invalid timezone format";
  }

  const hour = Number(match[2]);
  const minute = Number(match[3]);
  if (hour > 23 || minute > 59) {
    return "Invalid timezone value";
  }

  return null;
}

function toUtcNaiveGregorianDateTime(date: Date): GregorianDateTime {
  return new GregorianDateTime(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
    null,
  );
}

function toImperialDateTime(date: Date, timezone: string): ImperialDateTime {
  const utcNaive = toUtcNaiveGregorianDateTime(date);
  const juld = grdtToJuld(utcNaive);
  const tert = juldToTert(juld);
  const mrsd = tertToMrsd(tert);
  const imsn = mrsdToImsn(mrsd);
  const standardNaiveImdt = imsnToImdt(imsn);
  return ImperialDateTime.fromStandardNaive(standardNaiveImdt, timezone);
}

function pad(num: number, length: number): string {
  return num.toString().padStart(length, "0");
}

function formatImperial(imdt: ImperialDateTimeBody): string {
  return `${pad(imdt.year, 4)}-${pad(imdt.month, 2)}-${pad(imdt.day, 2)}T${pad(imdt.hour, 2)}:${pad(imdt.minute, 2)}:${pad(imdt.second, 2)}${imdt.timezone}`;
}

function formatGregorian(grdt: GregorianDateTime): string {
  return `${pad(grdt.year, 4)}-${pad(grdt.month, 2)}-${pad(grdt.day, 2)}T${pad(grdt.hour, 2)}:${pad(grdt.minute, 2)}:${pad(grdt.second, 2)}${grdt.timezone ?? "+00:00"}`;
}

function toImperialDateTimeBody(imdt: ImperialDateTime): ImperialDateTimeBody {
  if (imdt.timezone === null) {
    throw new Error("ImperialDateTime timezone is required");
  }
  return {
    year: imdt.year,
    month: imdt.month,
    day: imdt.day,
    hour: imdt.hour,
    minute: imdt.minute,
    second: imdt.second,
    timezone: imdt.timezone,
  };
}

const IMPERIAL_DATETIME_FORMAT_PATTERN = /^(\d{4,})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-])(\d{2}):(\d{2})$/;

function parseImperialDateTimeFormatted(value: string): ImperialDateTime | null {
  const match = IMPERIAL_DATETIME_FORMAT_PATTERN.exec(value);
  if (!match) {
    return null;
  }
  const timezone = `${match[7]}${match[8]}:${match[9]}`;
  const validationError = validateTimezone(timezone);
  if (validationError) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);

  if (month < 1 || month > 24 || day < 1 || day > 28) {
    return null;
  }
  if (hour > 23 || minute > 59 || second > 59) {
    return null;
  }

  return new ImperialDateTime(year, month, day, hour, minute, second, timezone);
}

export const app = new Hono();

// {{{ POST /api/gregorian-datetime/from-imperial

type ImperialToGregorianRequest = {
  imperialDateTimeFormatted: string;
  gregorianTimezone: string;
};

type GregorianDateTimeConversionResponse = {
  gregorianDateTime: string;
};

function buildImperialToGregorianResponse(
  imperialDateTimeFormatted: string,
  gregorianTimezone: string,
): GregorianDateTimeConversionResponse {
  const imdt = parseImperialDateTimeFormatted(imperialDateTimeFormatted);
  if (imdt === null) {
    throw new Error("Invalid imperialDateTimeFormatted");
  }
  const standardNaiveImdt = imdt.toStandardNaive();
  const imsn = imdtToImsn(standardNaiveImdt);
  const mrsd = imsnToMrsd(imsn);
  const tert = mrsdToTert(mrsd);
  const juld = tertToJuld(tert);
  const utcNaiveGrdt = juldToGrdt(juld);
  const localGrdt = GregorianDateTime.fromUtcNaive(utcNaiveGrdt, gregorianTimezone);
  return { gregorianDateTime: formatGregorian(localGrdt) };
}

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

// }}} POST /api/gregorian-datetime/from-imperial

// {{{ GET /api/imperial-datetime/current

type CurrentImperialDateTimeResponse = {
  gregorianDateTime: string;
  imperialDateTime: ImperialDateTimeBody;
  imperialDateTimeFormatted: string;
};

function buildCurrentImperialDateTimeResponse(now: Date, timezone: string): CurrentImperialDateTimeResponse {
  const imperialDateTime = toImperialDateTimeBody(toImperialDateTime(now, timezone));
  return {
    gregorianDateTime: now.toISOString(),
    imperialDateTime,
    imperialDateTimeFormatted: formatImperial(imperialDateTime),
  };
}

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

// }}} GET /api/imperial-datetime/current

// {{{ POST /api/imperial-datetime/from-gregorian

type GregorianToImperialRequest = {
  gregorianDateTime: string;
  imperialTimezone: string;
};

type ImperialDateTimeConversionResponse = {
  imperialDateTime: ImperialDateTimeBody;
  imperialDateTimeFormatted: string;
};

function buildGregorianToImperialResponse(
  gregorianDateTime: string,
  imperialTimezone: string,
): ImperialDateTimeConversionResponse {
  const date = new Date(gregorianDateTime);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid gregorianDateTime");
  }
  const imperialDateTime = toImperialDateTimeBody(toImperialDateTime(date, imperialTimezone));
  return {
    imperialDateTime,
    imperialDateTimeFormatted: formatImperial(imperialDateTime),
  };
}

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
    if (error instanceof Error && error.message === "Invalid gregorianDateTime") {
      return c.json<ErrorResponse>({ message: error.message }, 400);
    }
    return c.json<ErrorResponse>({ message: "Internal server error" }, 500);
  }
});

// }}} POST /api/imperial-datetime/from-gregorian

app.notFound((c) => c.json<ErrorResponse>({ message: "Not Found" }, 404));
