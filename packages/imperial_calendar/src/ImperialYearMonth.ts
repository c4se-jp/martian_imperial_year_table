import { ImperialYear } from "./internal/ImperialYear";
import { ImperialMonth } from "./internal/ImperialMonth";

export class ImperialYearMonth {
  year: number;
  month: number;

  constructor(year: number, month: number) {
    this.year = year;
    this.month = month;
  }

  days(): number {
    let days = new ImperialMonth(this.month).days();
    if (this.month === 24 && new ImperialYear(this.year).isLeapYear()) {
      days += 1;
    }
    return days;
  }

  nextMonth(): ImperialYearMonth {
    if (this.month === 24) {
      return new ImperialYearMonth(this.year + 1, 1);
    }
    return new ImperialYearMonth(this.year, this.month + 1);
  }

  prevMonth(): ImperialYearMonth {
    if (this.month === 1) {
      return new ImperialYearMonth(this.year - 1, 24);
    }
    return new ImperialYearMonth(this.year, this.month - 1);
  }
}
