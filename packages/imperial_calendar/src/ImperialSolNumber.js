import { SECONDS_PER_DAY, isClose } from "./utils";
export class ImperialSolNumber {
    day;
    second;
    constructor(day, second = 0.0) {
        if (!Number.isInteger(day)) {
            if (!isClose(second, 0.0, 0.0000001)) {
                throw new Error("When you give the imperial_sol_number directly you cannot give second.");
            }
            let integer = Math.floor(day);
            let secondValue = Math.round((day - integer) * SECONDS_PER_DAY);
            if (secondValue < 0) {
                secondValue += SECONDS_PER_DAY;
                integer -= 1;
            }
            if (secondValue >= SECONDS_PER_DAY) {
                secondValue -= SECONDS_PER_DAY;
                integer += 1;
            }
            this.day = integer;
            this.second = secondValue;
        }
        else {
            const secondValue = Math.round(second);
            if (secondValue < 0 || secondValue >= SECONDS_PER_DAY) {
                throw new Error(`second is out of range: ${second}`);
            }
            this.day = day;
            this.second = secondValue;
        }
    }
    get imperialSolNumber() {
        return this.day + this.second / SECONDS_PER_DAY;
    }
}
