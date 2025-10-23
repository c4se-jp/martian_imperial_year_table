import { describe, it, expect } from "vitest";
import { ImperialDateTime } from "../../ImperialDateTime";
import { HolidayMars } from "../../internal/HolidayMars";
import type { Timezone } from "../../types";

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

describe("ImperialDateTime", () => {
  describe("等値性", () => {
    it("等値性", () => {
      expect(buildImperial({ year: 1, month: 2, day: 3, hour: 4, minute: 5, second: 6, timezone: "+00:00" })).toEqual(
        buildImperial({ year: 1, month: 2, day: 3, hour: 4, minute: 5, second: 6, timezone: "+00:00" }),
      );
      expect(buildImperial({ year: 1, month: 2, day: 3, hour: 4, minute: 5, second: 6, timezone: "+00:00" })).not.toEqual(
        buildImperial({ year: 1, month: 2, day: 3, hour: 4, minute: 5, second: 7, timezone: "+00:00" }),
      );
    });
  });

  describe("より小さい", () => {
    it("より小さい", () => {
      const equalLhs = buildImperial({ year: 2, month: 2, day: 2, hour: 2, minute: 2, second: 2, timezone: null });
      const equalRhs = buildImperial({ year: 2, month: 2, day: 2, hour: 2, minute: 2, second: 2, timezone: null });
      expect(equalLhs < equalRhs).toBe(false);

      const increasingCases: Array<{ lhs: ImperialDateTimeInit; rhs: ImperialDateTimeInit }> = [
        {
          lhs: { year: 1, month: 2, day: 2, hour: 2, minute: 2, second: 2, timezone: null },
          rhs: { year: 2, month: 2, day: 2, hour: 2, minute: 2, second: 2, timezone: null },
        },
        {
          lhs: { year: 2, month: 1, day: 2, hour: 2, minute: 2, second: 2, timezone: null },
          rhs: { year: 2, month: 2, day: 2, hour: 2, minute: 2, second: 2, timezone: null },
        },
        {
          lhs: { year: 2, month: 2, day: 1, hour: 2, minute: 2, second: 2, timezone: null },
          rhs: { year: 2, month: 2, day: 2, hour: 2, minute: 2, second: 2, timezone: null },
        },
        {
          lhs: { year: 2, month: 2, day: 2, hour: 1, minute: 2, second: 2, timezone: null },
          rhs: { year: 2, month: 2, day: 2, hour: 2, minute: 2, second: 2, timezone: null },
        },
        {
          lhs: { year: 2, month: 2, day: 2, hour: 2, minute: 1, second: 2, timezone: null },
          rhs: { year: 2, month: 2, day: 2, hour: 2, minute: 2, second: 2, timezone: null },
        },
        {
          lhs: { year: 2, month: 2, day: 2, hour: 2, minute: 2, second: 1, timezone: null },
          rhs: { year: 2, month: 2, day: 2, hour: 2, minute: 2, second: 2, timezone: null },
        },
      ];

      increasingCases.forEach(({ lhs, rhs }) => {
        expect(buildImperial(lhs) < buildImperial(rhs)).toBe(true);
      });

      const decreasingCases: Array<{ lhs: ImperialDateTimeInit; rhs: ImperialDateTimeInit }> = [
        {
          lhs: { year: 2, month: 1, day: 2, hour: 2, minute: 2, second: 2, timezone: null },
          rhs: { year: 1, month: 2, day: 2, hour: 2, minute: 2, second: 2, timezone: null },
        },
        {
          lhs: { year: 2, month: 2, day: 1, hour: 2, minute: 2, second: 2, timezone: null },
          rhs: { year: 2, month: 1, day: 2, hour: 2, minute: 2, second: 2, timezone: null },
        },
        {
          lhs: { year: 2, month: 2, day: 2, hour: 1, minute: 2, second: 2, timezone: null },
          rhs: { year: 2, month: 2, day: 1, hour: 2, minute: 2, second: 2, timezone: null },
        },
        {
          lhs: { year: 2, month: 2, day: 2, hour: 2, minute: 1, second: 2, timezone: null },
          rhs: { year: 2, month: 2, day: 2, hour: 2, minute: 2, second: 2, timezone: null },
        },
        {
          lhs: { year: 2, month: 2, day: 2, hour: 2, minute: 2, second: 1, timezone: null },
          rhs: { year: 2, month: 2, day: 2, hour: 2, minute: 1, second: 2, timezone: null },
        },
      ];

      decreasingCases.forEach(({ lhs, rhs }) => {
        expect(buildImperial(lhs) < buildImperial(rhs)).toBe(false);
      });

      const lhsPositiveZone = buildImperial({
        year: 2,
        month: 2,
        day: 2,
        hour: 3,
        minute: 2,
        second: 2,
        timezone: "+01:00",
      });
      const rhsNegativeZone = buildImperial({
        year: 2,
        month: 2,
        day: 2,
        hour: 1,
        minute: 2,
        second: 2,
        timezone: "-01:00",
      });
      expect(lhsPositiveZone < rhsNegativeZone).toBe(false);

      const lhsPositiveZoneSecond = buildImperial({
        year: 2,
        month: 2,
        day: 2,
        hour: 3,
        minute: 2,
        second: 1,
        timezone: "+01:00",
      });
      expect(lhsPositiveZoneSecond < rhsNegativeZone).toBe(true);
    });
  });

  describe("fromStandardNaive", () => {
    it("標準タイムゾーンナイーブなImperialDateTimeから変換", () => {
      for (let hour = 0; hour < 23; hour += 1) {
        [0, 15, 30, 45].forEach((minute) => {
          const negativeTimezone = `-${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;
          const positiveTimezone = `+${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;

          const negResult = ImperialDateTime.fromStandardNaive(
            buildImperial({ year: 1398, month: 1, day: 1, hour, minute, second: 0, timezone: null }),
            negativeTimezone,
          );
          expect(negResult).toEqual(
            buildImperial({ year: 1398, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: negativeTimezone }),
          );

          const posResult = ImperialDateTime.fromStandardNaive(
            buildImperial({ year: 1398, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: null }),
            positiveTimezone,
          );
          expect(posResult).toEqual(
            buildImperial({ year: 1398, month: 1, day: 1, hour, minute, second: 0, timezone: positiveTimezone }),
          );
        });
      }
    });
  });

  describe("holiday", () => {
    it("該当する祝日", () => {
      const holiday = new HolidayMars(1425, 1, 1);
      expect(buildImperial({ year: 1425, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: "+00:00" }).holiday).toEqual(holiday);
      expect(buildImperial({ year: 1425, month: 1, day: 4, hour: 0, minute: 0, second: 0, timezone: "+00:00" }).holiday).toBeNull();
    });
  });

  describe("japaneseMonthName", () => {
    it("日本語（火星語）月名", () => {
      expect(buildImperial({ year: 1425, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: "+00:00" }).japaneseMonthName).toBe("立春");
      expect(buildImperial({ year: 1425, month: 24, day: 1, hour: 0, minute: 0, second: 0, timezone: "+00:00" }).japaneseMonthName).toBe("大寒");
    });
  });

  describe("offset", () => {
    it("タイムゾーンの文字列表現を内部表現にする", () => {
      const testCases: Array<{ timezone: string; expected: number }> = [
        { timezone: "+00:00", expected: 0.0 },
        { timezone: "-00:00", expected: 0.0 },
        { timezone: "+00:15", expected: 0.25 },
        { timezone: "+01:00", expected: 1.0 },
        { timezone: "+23:45", expected: 23.75 },
        { timezone: "-00:15", expected: -0.25 },
        { timezone: "-23:45", expected: -23.75 },
      ];

      testCases.forEach(({ timezone, expected }) => {
        const imperial = buildImperial({ year: 0, month: 1, day: 1, hour: 1, minute: 1, second: 1, timezone });
        expect(Math.abs(imperial.offset - expected)).toBeLessThan(0.000005);
      });

      const invalidTimezone = "+00";
      expect(() => {
        const imperial = buildImperial({ year: 0, month: 1, day: 1, hour: 1, minute: 1, second: 1, timezone: invalidTimezone });
        return imperial.offset;
      }).toThrow();
    });
  });

  describe("toStandardNaive", () => {
    it("標準タイムゾーンナイーブなImperialDateTimeに変換", () => {
      for (let hour = 0; hour < 23; hour += 1) {
        [0, 15, 30, 45].forEach((minute) => {
          const negativeTimezone = `-${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;
          const positiveTimezone = `+${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;

          const negativeExpected = buildImperial({
            year: 1398,
            month: 1,
            day: 1,
            hour,
            minute,
            second: 0,
            timezone: null,
          });
          const positiveExpected = buildImperial({
            year: 1398,
            month: 1,
            day: 1,
            hour: 0,
            minute: 0,
            second: 0,
            timezone: null,
          });

          expect(
            buildImperial({ year: 1398, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: negativeTimezone }).toStandardNaive(),
          ).toEqual(negativeExpected);
          expect(
            buildImperial({ year: 1398, month: 1, day: 1, hour, minute, second: 0, timezone: positiveTimezone }).toStandardNaive(),
          ).toEqual(positiveExpected);
        });
      }
    });
  });
});
