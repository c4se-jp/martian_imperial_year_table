declare class Internal {
  name: string;
  constructor(name: string);
}
type HolidaysRecord = Record<number, Record<number, Record<number, Internal | Internal[]>>>;
type HolidaysInput = HolidaysRecord;
declare const DEFAULT_HOLIDAYS: HolidaysRecord;
declare class Holidays {
  static holidays: HolidaysRecord;
  static setUpForTest(holidays: HolidaysInput): void;
  static tearDownForTest(): void;
}
declare class HolidayMars {
  year: number;
  month: number;
  day: number;
  internals: Internal[];
  constructor(year: number, month: number, day: number);
  static between(lhs: HolidayMars, rhs: HolidayMars): HolidayMars[];
  valueOf(): number;
  get isHoliday(): boolean;
  get names(): string[];
}
export { Internal, Holidays, HolidayMars, DEFAULT_HOLIDAYS, HolidaysRecord };
