import type { WidgetToolResult } from "../widgetTypes";
import { getBrowserTimezoneOffset, isTimezonePreset, validateTimezone } from "./timezone";
import { formatRelativeTimestamp } from "./relativeTime";

export type ImperialDateTime = {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  timezone?: string;
};

export type CurrentImperialDatetimeResponse = {
  gregorianDateTime?: string;
  imperialDateTime?: ImperialDateTime;
  imperialDateTimeFormatted?: string;
};

export type CurrentImperialDatetimeStatus = "idle" | "loading" | "success" | "error";

export type CurrentImperialDatetimeAppState = {
  selectedTimezone: string;
  timezoneSelection: "preset" | "custom";
  customTimezoneDraft: string;
  lastFetchedAt?: string;
  imperialNow?: CurrentImperialDatetimeResponse;
  status: CurrentImperialDatetimeStatus;
  autoRefresh: boolean;
  refreshIntervalSec: number;
  errorMessage?: string;
  displayMode: "clock";
};

export type CurrentImperialDatetimeDisplayModel = {
  imperialDateLine: string;
  imperialTimeLine?: string;
  timezoneLine?: string;
  gregorianLine?: string;
  relativeFetchedAt?: string;
  status: CurrentImperialDatetimeStatus;
  errorMessage?: string;
  canRefresh: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseFormattedImperialDateTime(formatted: string | undefined) {
  if (typeof formatted !== "string") {
    return undefined;
  }

  const match = /^(\d{4,}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})([+-]\d{2}:\d{2})$/.exec(formatted);
  if (match === null) {
    return undefined;
  }

  return {
    date: match[1],
    time: match[2],
    timezone: match[3],
  };
}

function formatDatePart(imperialDateTime: ImperialDateTime | undefined, formattedDate?: string) {
  if (formattedDate !== undefined) {
    return formattedDate;
  }
  if (imperialDateTime?.year === undefined) {
    return undefined;
  }

  const year = imperialDateTime.year.toString().padStart(4, "0");
  const month = imperialDateTime.month?.toString().padStart(2, "0");
  const day = imperialDateTime.day?.toString().padStart(2, "0");

  if (month === undefined) {
    return year;
  }
  if (day === undefined) {
    return `${year}-${month}`;
  }
  return `${year}-${month}-${day}`;
}

function formatTimePart(imperialDateTime: ImperialDateTime | undefined, formattedTime?: string) {
  if (formattedTime !== undefined) {
    return formattedTime;
  }
  if (imperialDateTime?.hour === undefined) {
    return undefined;
  }

  const hour = imperialDateTime.hour.toString().padStart(2, "0");
  const minute = imperialDateTime.minute?.toString().padStart(2, "0");
  const second = imperialDateTime.second?.toString().padStart(2, "0");

  if (minute === undefined) {
    return hour;
  }
  if (second === undefined) {
    return `${hour}:${minute}`;
  }
  return `${hour}:${minute}:${second}`;
}

function formatImperialDateTime(response: CurrentImperialDatetimeResponse | undefined) {
  if (response === undefined) {
    return undefined;
  }

  const parsed = parseFormattedImperialDateTime(response.imperialDateTimeFormatted);
  const datePart = formatDatePart(response.imperialDateTime, parsed?.date);
  const timePart = formatTimePart(response.imperialDateTime, parsed?.time);
  const timezone = response.imperialDateTime?.timezone ?? parsed?.timezone;

  if (datePart === undefined && timePart === undefined && timezone === undefined) {
    return undefined;
  }

  const parts = [datePart, timePart, timezone].filter((part): part is string => typeof part === "string");
  return parts.length > 0 ? parts.join(" ") : undefined;
}

function getRequestError(result: WidgetToolResult | undefined) {
  if (result === undefined) {
    return undefined;
  }

  const structuredError = result.structuredContent?.error;
  if (typeof structuredError === "string" && structuredError.length > 0) {
    return structuredError;
  }

  if (result.isError === true) {
    const text = result.content?.find((content) => typeof content.text === "string")?.text;
    if (typeof text === "string" && text.length > 0) {
      return text;
    }
    return "現在日時を取得できませんでした。再試行してください。";
  }

  return undefined;
}

export function extractCurrentImperialDatetimeResponse(result: WidgetToolResult | undefined) {
  const structuredResponse = result?.structuredContent?.response;
  if (isRecord(structuredResponse)) {
    return structuredResponse as CurrentImperialDatetimeResponse;
  }

  const text = result?.content?.find((content) => typeof content.text === "string")?.text;
  if (typeof text !== "string" || text.length === 0) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(text) as unknown;
    if (isRecord(parsed)) {
      return parsed as CurrentImperialDatetimeResponse;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export function createInitialState(result?: WidgetToolResult): CurrentImperialDatetimeAppState {
  const response = extractCurrentImperialDatetimeResponse(result);
  const selectedTimezone = response?.imperialDateTime?.timezone ?? getBrowserTimezoneOffset() ?? "+09:00";
  const isPreset = isTimezonePreset(selectedTimezone);

  return {
    selectedTimezone,
    timezoneSelection: isPreset ? "preset" : "custom",
    customTimezoneDraft: isPreset ? selectedTimezone : selectedTimezone,
    lastFetchedAt: response !== undefined ? new Date().toISOString() : undefined,
    imperialNow: response,
    status: response !== undefined ? "success" : "idle",
    autoRefresh: true,
    refreshIntervalSec: 10,
    errorMessage: getRequestError(result),
    displayMode: "clock",
  };
}

export function buildCurrentImperialDatetimeDisplayModel(
  state: CurrentImperialDatetimeAppState,
  now = Date.now(),
): CurrentImperialDatetimeDisplayModel {
  const response = state.imperialNow;
  const formatted = formatImperialDateTime(response);
  const imperialDateLine = formatted !== undefined ? `帝國火星曆: ${formatted}` : "帝國火星曆: 未取得";
  const imperialTimeLine =
    response?.imperialDateTime?.hour !== undefined || response?.imperialDateTimeFormatted !== undefined
      ? (() => {
          const parsed = parseFormattedImperialDateTime(response?.imperialDateTimeFormatted);
          const timePart = formatTimePart(response?.imperialDateTime, parsed?.time);
          return timePart !== undefined ? `時刻: ${timePart}` : undefined;
        })()
      : undefined;
  const timezone =
    response?.imperialDateTime?.timezone ??
    parseFormattedImperialDateTime(response?.imperialDateTimeFormatted)?.timezone;
  const gregorianLine =
    response?.gregorianDateTime !== undefined ? `Gregorian: ${response.gregorianDateTime}` : undefined;
  const relativeFetchedAt = formatRelativeTimestamp(state.lastFetchedAt, now);

  return {
    imperialDateLine,
    imperialTimeLine,
    timezoneLine: timezone !== undefined ? `タイムゾーン: ${timezone}` : undefined,
    gregorianLine,
    relativeFetchedAt:
      relativeFetchedAt !== undefined
        ? `最終取得: ${relativeFetchedAt}`
        : state.status === "idle"
          ? "最終取得: 未取得"
          : undefined,
    status: state.status,
    errorMessage: state.errorMessage,
    canRefresh: state.status !== "loading",
  };
}

export function getCurrentImperialDatetimeErrorMessage(result: WidgetToolResult | undefined) {
  return getRequestError(result);
}

export function normalizeTimezoneForDisplay(timezone: string) {
  const validationError = validateTimezone(timezone);
  return validationError === undefined ? timezone : undefined;
}
