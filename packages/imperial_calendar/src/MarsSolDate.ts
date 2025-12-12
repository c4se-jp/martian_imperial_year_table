import { isClose } from "./utils";

export class MarsSolDate {
  marsSolDate: number;

  constructor(marsSolDate: number) {
    this.marsSolDate = marsSolDate;
  }

  equals(other: unknown): boolean {
    if (!(other instanceof MarsSolDate)) {
      return false;
    }
    return (
      Math.floor(this.marsSolDate) === Math.floor(other.marsSolDate) &&
      isClose(this.marsSolDate % 1, other.marsSolDate % 1, 0.000005)
    );
  }

  toString(): string {
    return `MarsSolDate(${this.marsSolDate})`;
  }
}
