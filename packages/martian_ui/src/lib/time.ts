export function formatTimezone(offsetMinutes: number): string {
  const sign = offsetMinutes <= 0 ? "+" : "-";
  const absMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (absMinutes % 60).toString().padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

export function normalizeTimezone(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^([+-])(?:(\d{1,2}):?(\d{2}))$/);
  if (!match) {
    throw new Error("タイムゾーンは ±HH:MM 形式で指定してください");
  }
  const sign = match[1];
  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  if (hours > 23 || minutes > 59) {
    throw new Error("タイムゾーンの範囲が不正です");
  }
  const hh = hours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");
  return `${sign}${hh}:${mm}`;
}
