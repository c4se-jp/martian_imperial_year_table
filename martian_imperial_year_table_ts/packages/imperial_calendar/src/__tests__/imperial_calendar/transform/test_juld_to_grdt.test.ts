import { describe, it, expect } from "vitest";
import { GregorianDateTime } from "../../../GregorianDateTime";
import { JulianDay } from "../../../JulianDay";
import { juldToGrdt } from "../../../transform/juldToGrdt";
import type { Timezone } from "../../../types";

type GregorianDateTimeInit = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  timezone: Timezone;
};

const buildGregorian = (data: GregorianDateTimeInit) =>
  new GregorianDateTime(
    data.year,
    data.month,
    data.day,
    data.hour,
    data.minute,
    data.second,
    data.timezone,
  );

describe("juldToGrdt", () => {
  it("JulianDayをGregorianDateTimeに変換する", () => {
    const testCases = [
      { juld: 2299161.0, expected: { year: 1582, month: 10, day: 15, hour: 12, minute: 0, second: 0, timezone: null } },
      { juld: 2345678.0, expected: { year: 1710, month: 2, day: 23, hour: 12, minute: 0, second: 0, timezone: null } },
      { juld: 2400000.5, expected: { year: 1858, month: 11, day: 17, hour: 0, minute: 0, second: 0, timezone: null } },
      { juld: 2451545.0, expected: { year: 2000, month: 1, day: 1, hour: 12, minute: 0, second: 0, timezone: null } },
      { juld: 2456789.0, expected: { year: 2014, month: 5, day: 11, hour: 12, minute: 0, second: 0, timezone: null } },
      { juld: 2567890.0, expected: { year: 2318, month: 7, day: 18, hour: 12, minute: 0, second: 0, timezone: null } },
      { juld: 3000000.0, expected: { year: 3501, month: 8, day: 15, hour: 12, minute: 0, second: 0, timezone: null } },
      { juld: 3456789.0, expected: { year: 4752, month: 4, day: 7, hour: 12, minute: 0, second: 0, timezone: null } },
      { juld: 4000000.0, expected: { year: 6239, month: 7, day: 12, hour: 12, minute: 0, second: 0, timezone: null } },
    ];

    testCases.forEach(({ juld, expected }) => {
      const result = juldToGrdt(new JulianDay(juld));
      expect(result).toEqual(buildGregorian(expected));
    });
  });
});
