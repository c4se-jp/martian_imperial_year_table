export class ImperialYear {
    year;
    constructor(year) {
        this.year = year;
    }
    isLeapYear() {
        const year = this.year;
        return year % 2 !== 0 || (year % 10 === 0 && year % 250 !== 0);
    }
    days() {
        return this.isLeapYear() ? 669 : 668;
    }
}
