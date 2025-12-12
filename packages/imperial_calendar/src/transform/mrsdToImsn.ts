import { ImperialSolNumber } from "../ImperialSolNumber";
import { MarsSolDate } from "../MarsSolDate";

/**
 * Convert MarsSolDate to ImperialSolNumber.
 */
export function mrsdToImsn(mrsd: MarsSolDate): ImperialSolNumber {
  return new ImperialSolNumber(mrsd.marsSolDate - 0.375 + 901195);
}
