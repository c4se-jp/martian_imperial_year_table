import { TerrestrialTime } from "../TerrestrialTime";
/**
 * Convert MarsSolDate to TerrestrialTime.
 */
export function mrsdToTert(mrsd) {
    return new TerrestrialTime(1.0274912517 * (mrsd.marsSolDate - 44796 + 0.0009626) + 2451545 + 4.5);
}
