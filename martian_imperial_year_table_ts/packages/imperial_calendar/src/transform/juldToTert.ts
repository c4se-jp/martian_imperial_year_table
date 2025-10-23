import type { JulianDay } from "../JulianDay";
import { TerrestrialTime } from "../TerrestrialTime";
import { SECONDS_PER_DAY } from "../utils";

export function juldToTert(juld: JulianDay): TerrestrialTime {
  return new TerrestrialTime(juld.julianDay + juld.deltaT / SECONDS_PER_DAY);
}
