import { describe, it, expect } from "vitest";
import { GregorianDateTime } from "../../../GregorianDateTime";
import { grdtToJuld } from "../../../transform/grdtToJuld";
import { juldToTert } from "../../../transform/juldToTert";
import { tertToMrls } from "../../../transform/tertToMrls";
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

describe("grdtToMrls", () => {
  it("GregorianDateTimeをMars LSに変換する", () => {
    const testCases: Array<{ grdt: { year: number; month: number; day: number }; expected: number }> = [
      { grdt: { year: 2018, month: 12, day: 28 }, expected: 314.1 },
      { grdt: { year: 2019, month: 1, day: 7 }, expected: 319.8 },
      { grdt: { year: 2019, month: 1, day: 17 }, expected: 325.4 },
      { grdt: { year: 2019, month: 1, day: 27 }, expected: 331.0 },
      { grdt: { year: 2019, month: 2, day: 6 }, expected: 336.4 },
      { grdt: { year: 2019, month: 2, day: 16 }, expected: 341.7 },
      { grdt: { year: 2019, month: 2, day: 26 }, expected: 347.0 },
      { grdt: { year: 2019, month: 3, day: 8 }, expected: 352.2 },
      { grdt: { year: 2019, month: 3, day: 18 }, expected: 357.2 },
      { grdt: { year: 2019, month: 3, day: 28 }, expected: 2.2 },
      { grdt: { year: 2019, month: 4, day: 7 }, expected: 7.2 },
      { grdt: { year: 2019, month: 4, day: 17 }, expected: 12.0 },
      { grdt: { year: 2019, month: 4, day: 27 }, expected: 16.8 },
      { grdt: { year: 2019, month: 5, day: 7 }, expected: 21.5 },
      { grdt: { year: 2019, month: 5, day: 17 }, expected: 26.2 },
      { grdt: { year: 2019, month: 5, day: 27 }, expected: 30.8 },
      { grdt: { year: 2019, month: 6, day: 6 }, expected: 35.3 },
      { grdt: { year: 2019, month: 6, day: 16 }, expected: 39.8 },
      { grdt: { year: 2019, month: 6, day: 26 }, expected: 44.3 },
      { grdt: { year: 2019, month: 7, day: 6 }, expected: 48.8 },
      { grdt: { year: 2019, month: 7, day: 16 }, expected: 53.2 },
      { grdt: { year: 2019, month: 7, day: 26 }, expected: 57.6 },
      { grdt: { year: 2019, month: 8, day: 5 }, expected: 62.0 },
      { grdt: { year: 2019, month: 8, day: 15 }, expected: 66.3 },
      { grdt: { year: 2019, month: 8, day: 25 }, expected: 70.7 },
      { grdt: { year: 2019, month: 9, day: 4 }, expected: 75.1 },
      { grdt: { year: 2019, month: 9, day: 14 }, expected: 79.4 },
      { grdt: { year: 2019, month: 9, day: 24 }, expected: 83.8 },
      { grdt: { year: 2019, month: 10, day: 4 }, expected: 88.2 },
      { grdt: { year: 2019, month: 10, day: 14 }, expected: 92.6 },
      { grdt: { year: 2019, month: 10, day: 24 }, expected: 97.1 },
      { grdt: { year: 2019, month: 11, day: 3 }, expected: 101.5 },
      { grdt: { year: 2019, month: 11, day: 13 }, expected: 106.0 },
      { grdt: { year: 2019, month: 11, day: 23 }, expected: 110.6 },
      { grdt: { year: 2019, month: 12, day: 3 }, expected: 115.2 },
      { grdt: { year: 2019, month: 12, day: 13 }, expected: 119.8 },
      { grdt: { year: 2019, month: 12, day: 23 }, expected: 124.5 },
      { grdt: { year: 2020, month: 1, day: 2 }, expected: 129.3 },
    ];

    testCases.forEach(({ grdt, expected }) => {
      const gregorian = buildGregorian({
        year: grdt.year,
        month: grdt.month,
        day: grdt.day,
        hour: 0,
        minute: 0,
        second: 0,
        timezone: "UTC",
      });
      const actual = tertToMrls(juldToTert(grdtToJuld(gregorian)));
      const roundedActual = Math.round((actual - 0.01) * 10) / 10;
      expect(roundedActual).toBe(expected);
    });
  });
});
