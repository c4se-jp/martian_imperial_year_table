import { Timezone } from "./types";
export declare class GregorianDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  timezone: Timezone;
  constructor(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    timezone: Timezone,
  );
  private toParts;
  copy(): GregorianDateTime;
  static fromUtcNaive(naive: GregorianDateTime, timezone: string): GregorianDateTime;
  get isHoliday(): boolean;
  get weekday(): number;
  get offset(): number;
  toUtcNaive(): GregorianDateTime;
}
