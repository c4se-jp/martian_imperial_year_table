import { isClose } from "./utils";
export class MarsSolDate {
    marsSolDate;
    constructor(marsSolDate) {
        this.marsSolDate = marsSolDate;
    }
    equals(other) {
        if (!(other instanceof MarsSolDate)) {
            return false;
        }
        return (Math.floor(this.marsSolDate) === Math.floor(other.marsSolDate) &&
            isClose(this.marsSolDate % 1, other.marsSolDate % 1, 0.000005));
    }
    toString() {
        return `MarsSolDate(${this.marsSolDate})`;
    }
}
