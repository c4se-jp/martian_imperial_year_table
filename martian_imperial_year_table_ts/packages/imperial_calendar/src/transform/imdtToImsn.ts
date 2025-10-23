import type { ImperialDateTime } from "../ImperialDateTime";
import type { ImperialSolNumber } from "../ImperialSolNumber";
import { fromImperialDateTime } from "./imperialHelpers";

export function imdtToImsn(imdt: ImperialDateTime): ImperialSolNumber {
  return fromImperialDateTime(imdt);
}
