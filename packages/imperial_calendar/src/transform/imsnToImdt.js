import { ImperialDateTime } from "../ImperialDateTime";
import { deriveImperialDateTimeFields } from "./imperialHelpers";
export function imsnToImdt(imsn) {
    const { year, month, day, hour, minute, second } = deriveImperialDateTimeFields(imsn);
    return new ImperialDateTime(year, month, day, hour, minute, second, null);
}
export { deriveImperialDateTimeFields };
