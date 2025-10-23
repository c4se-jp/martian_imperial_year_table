import { GregorianDateTime } from "../GregorianDateTime";
import type { JulianDay } from "../JulianDay";
import { pyDivmod } from "../utils";

export function juldToGrdt(juld: JulianDay): GregorianDateTime {
  const value = juld.julianDay;
  const A = Math.floor(value + 68569.5);
  const B = value + 0.5;
  const a = Math.floor(A / 36524.25);
  const b = A - Math.floor(36524.25 * a + 0.75);
  const c = Math.floor((b + 1) / 365.25025);
  const d = b - Math.floor(365.25 * c) + 31;
  const e = Math.floor(d / 30.59);
  const f = Math.floor(e / 11.0);
  const u = 100 * (a - 49) + c + f;
  const v = e - 12 * f + 2;
  const w = d - Math.floor(30.59 * e) + (B % 1);
  const roundedSecond = Math.round(juld.second);
  const [hourRaw, remainder] = pyDivmod(roundedSecond, 3600);
  const hour = (hourRaw + 12) % 24;
  const [minute, second] = pyDivmod(remainder, 60);
  return new GregorianDateTime(u, v, Math.floor(w), hour, minute, second, null);
}
