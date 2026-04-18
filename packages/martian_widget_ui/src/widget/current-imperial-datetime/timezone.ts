const TIMEZONE_PATTERN = /^[+-](?:[01]\d|2[0-3]):[0-5]\d$/;

export const TIMEZONE_PRESETS = ["+00:00", "+09:00", "-05:00", "+01:00"] as const;

export type TimezonePreset = (typeof TIMEZONE_PRESETS)[number];

export function isTimezonePreset(value: string): value is TimezonePreset {
  return TIMEZONE_PRESETS.includes(value as TimezonePreset);
}

export function validateTimezone(timezone: string): string | undefined {
  if (TIMEZONE_PATTERN.test(timezone)) {
    return undefined;
  }

  return "タイムゾーンは ±HH:MM 形式で入力してください。";
}

export function formatTimezoneOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absoluteMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (absoluteMinutes % 60).toString().padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

export function getBrowserTimezoneOffset(referenceDate = new Date()): string {
  return formatTimezoneOffset(-referenceDate.getTimezoneOffset());
}
