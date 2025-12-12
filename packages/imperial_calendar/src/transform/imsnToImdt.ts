import { ImperialDateTime } from "../ImperialDateTime";
import { ImperialSolNumber } from "../ImperialSolNumber";
import { deriveImperialDateTimeFields } from "./imperialHelpers";

export function imsnToImdt(imsn: ImperialSolNumber): ImperialDateTime {
  const { year, month, day, hour, minute, second } = deriveImperialDateTimeFields(imsn);
  return new ImperialDateTime(year, month, day, hour, minute, second, null);
}

export { deriveImperialDateTimeFields };
