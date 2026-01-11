import { describe, it, expect } from "vitest";
import { GregorianDateTime } from "../../../GregorianDateTime";
import { grdtToJuld } from "../../../transform/grdtToJuld";
import type { Timezone } from "../../../types";

type GregorianDateTimeInit = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  ms: number;
  timezone: Timezone;
};

const buildGregorian = (data: GregorianDateTimeInit) =>
  new GregorianDateTime(data.year, data.month, data.day, data.hour, data.minute, data.second, data.ms, data.timezone);

describe("grdtToJuld", () => {
  it("GregorianDateTimeをJulianDayに変換する", () => {
    const testCases = [
      {
        grdt: { year: 1582, month: 10, day: 15, hour: 12, minute: 0, second: 0, ms: 0, timezone: null },
        expected: 2299161.0,
      },
      {
        grdt: { year: 1710, month: 2, day: 23, hour: 12, minute: 0, second: 0, ms: 0, timezone: null },
        expected: 2345678.0,
      },
      {
        grdt: { year: 1858, month: 11, day: 17, hour: 0, minute: 0, second: 0, ms: 0, timezone: null },
        expected: 2400000.5,
      },
      {
        grdt: { year: 2000, month: 1, day: 1, hour: 12, minute: 0, second: 0, ms: 0, timezone: null },
        expected: 2451545.0,
      },
      {
        grdt: { year: 2014, month: 5, day: 11, hour: 12, minute: 0, second: 0, ms: 0, timezone: null },
        expected: 2456789.0,
      },
      {
        grdt: { year: 2318, month: 7, day: 18, hour: 12, minute: 0, second: 0, ms: 0, timezone: null },
        expected: 2567890.0,
      },
      {
        grdt: { year: 3501, month: 8, day: 15, hour: 12, minute: 0, second: 0, ms: 0, timezone: null },
        expected: 3000000.0,
      },
      {
        grdt: { year: 4752, month: 4, day: 7, hour: 12, minute: 0, second: 0, ms: 0, timezone: null },
        expected: 3456789.0,
      },
      {
        grdt: { year: 6239, month: 7, day: 12, hour: 12, minute: 0, second: 0, ms: 0, timezone: null },
        expected: 4000000.0,
      },
    ];

    testCases.forEach(({ grdt, expected }) => {
      const result = grdtToJuld(buildGregorian(grdt)).value;
      expect(result).toBe(expected);
    });
  });

  it("時刻を変換する", () => {
    const testCases = [
      {
        grdt: { year: 1970, month: 1, day: 1, hour: 21, minute: 5, second: 22, ms: 0, timezone: null },
        expected: 2440588.37873,
      },
      {
        grdt: { year: 1970, month: 1, day: 1, hour: 21, minute: 5, second: 23, ms: 0, timezone: null },
        expected: 2440588.37874,
      },
    ];

    testCases.forEach(({ grdt, expected }) => {
      const result = grdtToJuld(buildGregorian(grdt)).value;
      expect(result).toBe(expected);
    });
  });
});
