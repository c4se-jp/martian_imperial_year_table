export type Timezone = string | null;

export function isNaive(timezone: Timezone): timezone is null {
  return timezone === null;
}
