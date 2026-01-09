import { GregorianDateTime } from "../GregorianDateTime";
type JulianComponents = {
  day: number;
  second: number;
};
export declare function computeJulianComponents(grdt: GregorianDateTime): JulianComponents;
export declare function computeJulianValue(grdt: GregorianDateTime): number;
export {};
