import { ImperialSolNumber } from "../ImperialSolNumber";
/**
 * Convert MarsSolDate to ImperialSolNumber.
 */
export function mrsdToImsn(mrsd) {
    return new ImperialSolNumber(mrsd.marsSolDate - 0.375 + 901195);
}
