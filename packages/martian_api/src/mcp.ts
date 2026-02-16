import { StreamableHTTPTransport } from "@hono/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";
import {
  GregorianDateTime,
  ImperialDateTime,
  ImperialYearMonth,
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
import { z } from "zod";

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
const GREGORIAN_DATETIME_WITH_TIMEZONE_PATTERN =
  /^\d{4,}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const IMPERIAL_DATETIME_FORMAT_PATTERN = /^(\d{4,})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-])(\d{2}):(\d{2})$/;

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

function pad(num: number, length: number): string {
  return num.toString().padStart(length, "0");
}

function formatImperial(imdt: ImperialDateTimeBody): string {
  return `${pad(imdt.year, 4)}-${pad(imdt.month, 2)}-${pad(imdt.day, 2)}T${pad(imdt.hour, 2)}:${pad(imdt.minute, 2)}:${pad(imdt.second, 2)}${imdt.timezone}`;
}

function formatGregorian(grdt: GregorianDateTime): string {
  return `${pad(grdt.year, 4)}-${pad(grdt.month, 2)}-${pad(grdt.day, 2)}T${pad(grdt.hour, 2)}:${pad(grdt.minute, 2)}:${pad(grdt.second, 2)}${grdt.timezone ?? "+00:00"}`;
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

  if (month < 1 || month > 24 || day < 1) {
    return null;
  }
  if (hour > 23 || minute > 59 || second > 59) {
    return null;
  }
  const maxDay = new ImperialYearMonth(year, month).days();
  if (day > maxDay) {
    return null;
  }

  return new ImperialDateTime(year, month, day, hour, minute, second, timezone);
}

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
      if (!GREGORIAN_DATETIME_WITH_TIMEZONE_PATTERN.test(gregorianDateTime)) {
        return errorResult("Invalid gregorianDateTime format");
      }

      const date = new Date(gregorianDateTime);
      if (Number.isNaN(date.getTime())) {
        return errorResult("Invalid gregorianDateTime");
      }

      const imperialDateTime = toImperialDateTimeBody(toImperialDateTime(date, imperialTimezone));
      return textResult({
        imperialDateTime,
        imperialDateTimeFormatted: formatImperial(imperialDateTime),
      });
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

      const now = new Date();
      const imperialDateTime = toImperialDateTimeBody(toImperialDateTime(now, timezone));
      return textResult({
        gregorianDateTime: now.toISOString(),
        imperialDateTime,
        imperialDateTimeFormatted: formatImperial(imperialDateTime),
      });
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

      const imdt = parseImperialDateTimeFormatted(imperialDateTimeFormatted);
      if (imdt === null) {
        return errorResult("Invalid imperialDateTimeFormatted");
      }

      const standardNaiveImdt = imdt.toStandardNaive();
      const imsn = imdtToImsn(standardNaiveImdt);
      const mrsd = imsnToMrsd(imsn);
      const tert = mrsdToTert(mrsd);
      const juld = tertToJuld(tert);
      const utcNaiveGrdt = juldToGrdt(juld);
      const localGrdt = GregorianDateTime.fromUtcNaive(utcNaiveGrdt, gregorianTimezone);

      return textResult({ gregorianDateTime: formatGregorian(localGrdt) });
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
