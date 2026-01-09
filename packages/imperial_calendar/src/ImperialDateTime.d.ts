import { Timezone } from "./types";
import { HolidayMars } from "./internal/HolidayMars";
export declare class ImperialDateTime {
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
  copy(): ImperialDateTime;
  valueOf(): number;
  static fromStandardNaive(imdt: ImperialDateTime, timezone: string): ImperialDateTime;
  get holiday(): HolidayMars | null;
  get japaneseMonthName(): string;
  get offset(): number;
  toStandardNaive(): ImperialDateTime;
}
