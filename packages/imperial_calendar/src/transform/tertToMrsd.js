import { MarsSolDate } from "../MarsSolDate";
/**
 * Convert TerrestrialTime to MarsSolDate.
 */
export function tertToMrsd(tert) {
    return new MarsSolDate((tert.terrestrialTime - 2451545 - 4.5) / 1.0274912517 + 44796 - 0.0009626);
}
