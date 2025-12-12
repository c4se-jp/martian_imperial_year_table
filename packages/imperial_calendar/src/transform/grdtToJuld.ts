import { GregorianDateTime } from "../GregorianDateTime";
import { JulianDay } from "../JulianDay";
import { computeJulianComponents } from "./julianHelpers";

export function grdtToJuld(grdt: GregorianDateTime): JulianDay {
  const { day, second } = computeJulianComponents(grdt);
  return new JulianDay(day, second);
}
