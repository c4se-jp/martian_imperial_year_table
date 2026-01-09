import { TerrestrialTime } from "../TerrestrialTime";
import { SECONDS_PER_DAY } from "../utils";
export function juldToTert(juld) {
    return new TerrestrialTime(juld.julianDay + juld.deltaT / SECONDS_PER_DAY);
}
