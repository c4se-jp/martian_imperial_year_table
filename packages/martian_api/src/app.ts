import { Hono } from "hono";
import {
  GregorianDateTime,
  ImperialDateTime,
  grdtToJuld,
  imsnToImdt,
  juldToTert,
  mrsdToImsn,
  tertToMrsd,
} from "imperial_calendar";

type ErrorResponse = {
  message: string;
};

type CurrentImperialDateTimeResponse = {
  gregorianDateTime: string;
  imperialDateTime: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    timezone: string;
  };
  imperialDateTimeFormatted: string;
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

function formatImperial(imdt: CurrentImperialDateTimeResponse["imperialDateTime"]): string {
  return `${pad(imdt.year, 4)}-${pad(imdt.month, 2)}-${pad(imdt.day, 2)}T${pad(imdt.hour, 2)}:${pad(imdt.minute, 2)}:${pad(imdt.second, 2)}${imdt.timezone}`;
}

function buildCurrentImperialDateTimeResponse(now: Date, timezone: string): CurrentImperialDateTimeResponse {
  const imdt = toImperialDateTime(now, timezone);
  const imperialDateTime = {
    year: imdt.year,
    month: imdt.month,
    day: imdt.day,
    hour: imdt.hour,
    minute: imdt.minute,
    second: imdt.second,
    timezone,
  };
  return {
    gregorianDateTime: now.toISOString(),
    imperialDateTime,
    imperialDateTimeFormatted: formatImperial(imperialDateTime),
  };
}

export const app = new Hono();

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

app.notFound((c) => c.json<ErrorResponse>({ message: "Not Found" }, 404));
