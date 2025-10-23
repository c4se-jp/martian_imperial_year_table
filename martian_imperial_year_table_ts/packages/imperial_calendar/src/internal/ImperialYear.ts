export class ImperialYear {
  year: number;

  constructor(year: number) {
    this.year = year;
  }

  isLeapYear(): boolean {
    const year = this.year;
    return year % 2 !== 0 || (year % 10 === 0 && year % 250 !== 0);
  }

  days(): number {
    return this.isLeapYear() ? 669 : 668;
  }
}
