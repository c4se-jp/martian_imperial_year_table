export declare class JulianDay {
  static calendarReform: number;
  day: number;
  second: number;
  constructor(day: number, second?: number);
  private exactValue;
  get value(): number;
  get julianDay(): number;
  get deltaT(): number;
}
