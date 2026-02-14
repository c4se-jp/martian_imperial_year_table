import { GregorianDateTime } from "./GregorianDateTime";
import { juldToGrdt } from "./transform/juldToGrdt";
import { computeJulianValue } from "./transform/julianHelpers";
import { SECONDS_PER_DAY, pyDivmod } from "./utils";

function julianDayToJulianYear(juld: JulianDay): number {
  const intercept = 1721117.5;
  const tweaked = juld.julianDay - intercept;
  const [quadrennium, remainder] = pyDivmod(tweaked, 365 * 4 + 1);
  let quadrennialYear: number;
  if (remainder < 365) {
    quadrennialYear = 0;
  } else if (remainder < 365 * 2) {
    quadrennialYear = 1;
  } else if (remainder < 365 * 3) {
    quadrennialYear = 2;
  } else {
    quadrennialYear = 3;
  }
  let julianYear = quadrennium * 4 + quadrennialYear;
  let annualDay = remainder - quadrennialYear * 365;
  if (annualDay >= 306) {
    julianYear += 1;
    annualDay -= 306;
  } else if (julianYear % 4 === 0) {
    annualDay += 31 + 29;
  } else {
    annualDay += 31 + 28;
  }
  if (julianYear % 4 === 0) {
    julianYear += annualDay / 366;
  } else {
    julianYear += annualDay / 365;
  }
  return julianYear;
}

function julianDayToGregorianYear(juld: JulianDay): number {
  const year = juldToGrdt(juld).year;
  const january1st = computeJulianValue(new GregorianDateTime(year, 1, 1, 0, 0, 0, 0, null));
  const nextJanuary1st = computeJulianValue(new GregorianDateTime(year + 1, 1, 1, 0, 0, 0, 0, null));
  const annualDay = (juld.julianDay - january1st) / (nextJanuary1st - january1st);
  return year + annualDay;
}

// ユリウス通日。略稱は "juld"。
export class JulianDay {
  static calendarReform = 2299160.5;

  day: number;
  second: number;

  constructor(day: number, second?: number) {
    if (second === undefined) {
      const integerPart = Math.floor(day);
      const fractional = day - integerPart;
      this.day = integerPart;
      this.second = fractional * SECONDS_PER_DAY;
    } else {
      if (second < 0 || second >= SECONDS_PER_DAY) {
        throw new Error(`second is out of range: ${second}`);
      }
      this.day = day;
      this.second = second;
    }
  }

  private exactValue(): number {
    return this.day + this.second / SECONDS_PER_DAY;
  }

  get value(): number {
    return Number(this.exactValue().toFixed(5));
  }

  get julianDay(): number {
    return this.exactValue();
  }

  get deltaT(): number {
    const yearNumber =
      this.julianDay < JulianDay.calendarReform ? julianDayToJulianYear(this) : julianDayToGregorianYear(this);
    if (yearNumber < -500) {
      const deltaU = (yearNumber - 1820) / 100;
      return -20 + 32 * deltaU ** 2;
    }
    if (yearNumber < 500) {
      const deltaU = yearNumber / 100;
      return (
        10583.6 -
        1014.41 * deltaU +
        33.78311 * deltaU ** 2 -
        5.952053 * deltaU ** 3 -
        0.1798452 * deltaU ** 4 +
        0.022174192 * deltaU ** 5 +
        0.0090316521 * deltaU ** 6
      );
    }
    if (yearNumber < 1600) {
      const deltaU = (yearNumber - 1000) / 100;
      return (
        1574.2 -
        556.01 * deltaU +
        71.23472 * deltaU ** 2 +
        0.319781 * deltaU ** 3 -
        0.8503463 * deltaU ** 4 -
        0.005050998 * deltaU ** 5 +
        0.0083572073 * deltaU ** 6
      );
    }
    if (yearNumber < 1700) {
      const deltaU = yearNumber - 1600;
      return 120 - 0.9808 * deltaU - 0.01532 * deltaU ** 2 + deltaU ** 3 / 7129;
    }
    if (yearNumber < 1800) {
      const deltaU = yearNumber - 1700;
      return 8.83 + 0.1603 * deltaU - 0.0059285 * deltaU ** 2 + 0.00013336 * deltaU ** 3 - deltaU ** 4 / 1174000;
    }
    if (yearNumber < 1860) {
      const deltaU = yearNumber - 1800;
      return (
        13.72 -
        0.332447 * deltaU +
        0.0068612 * deltaU ** 2 +
        0.0041116 * deltaU ** 3 -
        0.00037436 * deltaU ** 4 +
        0.0000121272 * deltaU ** 5 -
        0.0000001699 * deltaU ** 6 +
        0.000000000875 * deltaU ** 7
      );
    }
    if (yearNumber < 1900) {
      const deltaU = yearNumber - 1860;
      return (
        7.62 +
        0.5737 * deltaU -
        0.251754 * deltaU ** 2 +
        0.01680668 * deltaU ** 3 -
        0.0004473624 * deltaU ** 4 +
        deltaU ** 5 / 233174
      );
    }
    if (yearNumber < 1920) {
      const deltaU = yearNumber - 1900;
      return -2.79 + 1.494119 * deltaU - 0.0598939 * deltaU ** 2 + 0.0061966 * deltaU ** 3 - 0.000197 * deltaU ** 4;
    }
    if (yearNumber < 1941) {
      const deltaU = yearNumber - 1920;
      return 21.2 + 0.84493 * deltaU - 0.0761 * deltaU ** 2 + 0.0020936 * deltaU ** 3;
    }
    if (yearNumber < 1961) {
      const deltaU = yearNumber - 1950;
      return 29.07 + 0.407 * deltaU - deltaU ** 2 / 233 + deltaU ** 3 / 2547;
    }
    if (yearNumber < 1986) {
      const deltaU = yearNumber - 1975;
      return 45.45 + 1.067 * deltaU - deltaU ** 2 / 260 - deltaU ** 3 / 718;
    }
    if (yearNumber < 2005) {
      const deltaU = yearNumber - 2000;
      return (
        63.86 +
        0.3345 * deltaU -
        0.060734 * deltaU ** 2 +
        0.0017275 * deltaU ** 3 +
        0.000651814 * deltaU ** 4 +
        0.00002373599 * deltaU ** 5
      );
    }
    if (yearNumber < 2050) {
      const deltaU = yearNumber - 2000;
      return 63.795 + 0.1287 * deltaU + 0.0091 * deltaU ** 2;
    }
    const deltaU = (yearNumber - 1820) / 100;
    return -20 + 32 * deltaU ** 2;
  }
}
