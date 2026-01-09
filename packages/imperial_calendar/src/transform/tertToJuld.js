import { JulianDay } from "../JulianDay";
import { juldToTert } from "./juldToTert";
/**
 * Convert TerrestrialTime to JulianDay.
 */
export function tertToJuld(tert) {
    const deltaT = new JulianDay(tert.terrestrialTime).deltaT;
    const juldPrime = new JulianDay(tert.terrestrialTime - deltaT / (24 * 60 * 60));
    const tertPrime = juldToTert(juldPrime);
    return new JulianDay(juldPrime.julianDay + tert.terrestrialTime - tertPrime.terrestrialTime);
}
