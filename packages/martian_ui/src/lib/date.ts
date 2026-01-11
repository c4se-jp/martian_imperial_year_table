import { GregorianDateTime } from "imperial_calendar";
import { formatTimezone } from "./time";

export function getBrowserGregorian(): GregorianDateTime {
  const now = new Date();
  const offsetMinutes = now.getTimezoneOffset();
  const timezone = formatTimezone(offsetMinutes);
  return new GregorianDateTime(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds(),
    timezone,
  );
}
