import { describe, it, expect } from "vitest";
import { ImperialDateTime } from "../../../ImperialDateTime";
import { ImperialSolNumber } from "../../../ImperialSolNumber";
import { imdtToImsn } from "../../../transform/imdtToImsn";
import type { Timezone } from "../../../types";

type ImperialDateTimeInit = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  timezone: Timezone;
};

const buildImperial = (data: ImperialDateTimeInit) =>
  new ImperialDateTime(
    data.year,
    data.month,
    data.day,
    data.hour,
    data.minute,
    data.second,
    data.timezone,
  );

describe("imdtToImsn", () => {
  it("ImperialDateTimeをImperialSolNumberに変換する", () => {
    const testCases = [
      { imdt: { year: 0, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: null }, expected: new ImperialSolNumber(0.0) },
      { imdt: { year: 1000, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: null }, expected: new ImperialSolNumber(668596.0) },
      { imdt: { year: 1, month: 1, day: 1, hour: 6, minute: 14, second: 25, timezone: null }, expected: new ImperialSolNumber(668.26001) },
      {
        imdt: { year: 1987, month: 6, day: 7, hour: 12, minute: 40, second: 30, timezone: null },
        expected: new ImperialSolNumber(1328646, 45630.0),
      },
      { imdt: { year: 3, month: 4, day: 5, hour: 6, minute: 7, second: 8, timezone: null }, expected: new ImperialSolNumber(2093.25495) },
      { imdt: { year: -1, month: 24, day: 28, hour: 0, minute: 0, second: 0, timezone: null }, expected: new ImperialSolNumber(-1.0) },
    ];

    testCases.forEach(({ imdt, expected }) => {
      const imperialDateTime = buildImperial(imdt);
      const imperialSolNumber = imdtToImsn(imperialDateTime);
      expect(imperialSolNumber).toEqual(expected);
    });
  });
});
