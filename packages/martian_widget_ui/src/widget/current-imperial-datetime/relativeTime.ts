export function formatRelativeTimestamp(targetIso: string | undefined, now = Date.now()): string | undefined {
  if (typeof targetIso !== "string") {
    return undefined;
  }

  const targetTime = Date.parse(targetIso);
  if (Number.isNaN(targetTime)) {
    return undefined;
  }

  const diffSeconds = Math.round((now - targetTime) / 1000);
  const absoluteSeconds = Math.abs(diffSeconds);

  if (absoluteSeconds < 5) {
    return "たった今";
  }
  if (absoluteSeconds < 60) {
    return diffSeconds >= 0 ? `${absoluteSeconds}秒前` : `${absoluteSeconds}秒後`;
  }

  const absoluteMinutes = Math.round(absoluteSeconds / 60);
  if (absoluteMinutes < 60) {
    return diffSeconds >= 0 ? `${absoluteMinutes}分前` : `${absoluteMinutes}分後`;
  }

  const absoluteHours = Math.round(absoluteMinutes / 60);
  if (absoluteHours < 24) {
    return diffSeconds >= 0 ? `${absoluteHours}時間前` : `${absoluteHours}時間後`;
  }

  const absoluteDays = Math.round(absoluteHours / 24);
  return diffSeconds >= 0 ? `${absoluteDays}日前` : `${absoluteDays}日後`;
}
