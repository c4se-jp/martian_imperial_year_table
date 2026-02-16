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

export type ImperialDateTimeBody = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  timezone: string;
};

export type CurrentImperialDateTimeResponse = {
  gregorianDateTime: string;
  imperialDateTime: ImperialDateTimeBody;
  imperialDateTimeFormatted: string;
};

export type GregorianDateTimeConversionResponse = {
  gregorianDateTime: string;
};

export type ImperialDateTimeConversionResponse = {
  imperialDateTime: ImperialDateTimeBody;
  imperialDateTimeFormatted: string;
};

const TIMEZONE_PATTERN = /^([+-])(\d{2}):(\d{2})$/;
export function validateTimezone(timezone: string): string | null {
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

export function buildImperialToGregorianResponse(
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

export function buildCurrentImperialDateTimeResponse(now: Date, timezone: string): CurrentImperialDateTimeResponse {
  const imperialDateTime = toImperialDateTimeBody(toImperialDateTime(now, timezone));
  return {
    gregorianDateTime: now.toISOString(),
    imperialDateTime,
    imperialDateTimeFormatted: formatImperial(imperialDateTime),
  };
}

const GREGORIAN_DATETIME_WITH_TIMEZONE_PATTERN = /^\d{4,}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
export function buildGregorianToImperialResponse(
  gregorianDateTime: string,
  imperialTimezone: string,
): ImperialDateTimeConversionResponse {
  if (!GREGORIAN_DATETIME_WITH_TIMEZONE_PATTERN.test(gregorianDateTime)) {
    throw new Error("Invalid gregorianDateTime format");
  }
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
