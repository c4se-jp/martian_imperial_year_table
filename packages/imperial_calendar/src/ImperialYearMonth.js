import { ImperialYear } from "./internal/ImperialYear";
import { ImperialMonth } from "./internal/ImperialMonth";
export class ImperialYearMonth {
    year;
    month;
    constructor(year, month) {
        this.year = year;
        this.month = month;
    }
    days() {
        let days = new ImperialMonth(this.month).days();
        if (this.month === 24 && new ImperialYear(this.year).isLeapYear()) {
            days += 1;
        }
        return days;
    }
    nextMonth() {
        if (this.month === 24) {
            return new ImperialYearMonth(this.year + 1, 1);
        }
        return new ImperialYearMonth(this.year, this.month + 1);
    }
    prevMonth() {
        if (this.month === 1) {
            return new ImperialYearMonth(this.year - 1, 24);
        }
        return new ImperialYearMonth(this.year, this.month - 1);
    }
}
