export class ImperialMonth {
  month: number;

  constructor(month: number) {
    this.month = month;
  }

  days(): number {
    return this.month % 6 === 0 ? 27 : 28;
  }
}
