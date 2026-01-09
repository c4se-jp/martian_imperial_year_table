export declare class ImperialYearMonth {
  year: number;
  month: number;
  constructor(year: number, month: number);
  days(): number;
  nextMonth(): ImperialYearMonth;
  prevMonth(): ImperialYearMonth;
}
