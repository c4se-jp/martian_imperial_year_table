import { JulianDay } from "../JulianDay";
import { computeJulianComponents } from "./julianHelpers";
export function grdtToJuld(grdt) {
    const { day, second } = computeJulianComponents(grdt);
    return new JulianDay(day, second);
}
