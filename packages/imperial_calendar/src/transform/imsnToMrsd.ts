import { ImperialSolNumber } from "../ImperialSolNumber";
import { MarsSolDate } from "../MarsSolDate";

/**
 * Convert ImperialSolNumber to MarsSolDate.
 * Mirrors imperial_calendar.transform.imsn_to_mrsd in the Python implementation.
 */
export function imsnToMrsd(imsn: ImperialSolNumber): MarsSolDate {
  return new MarsSolDate(imsn.imperialSolNumber + 0.375 - 901195);
}
