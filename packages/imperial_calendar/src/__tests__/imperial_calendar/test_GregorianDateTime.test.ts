import { describe, it, expect } from "vitest";
import { GregorianDateTime } from "../../GregorianDateTime";
import type { Timezone } from "../../types";

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
  new GregorianDateTime(data.year, data.month, data.day, data.hour, data.minute, data.second, data.timezone);

describe("GregorianDateTime", () => {
  describe("fromUtcNaive", () => {
    it("UTCナイーブなGregorianDateTimeから変換", () => {
      const explicitCases: Array<{
        naive: GregorianDateTimeInit;
        timezone: string;
        expected: GregorianDateTimeInit;
      }> = [
        {
          naive: { year: 1970, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: null },
          timezone: "+09:00",
          expected: { year: 1970, month: 1, day: 1, hour: 9, minute: 0, second: 0, timezone: "+09:00" },
        },
        {
          naive: { year: 1970, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: null },
          timezone: "Asia/Tokyo",
          expected: { year: 1970, month: 1, day: 1, hour: 9, minute: 0, second: 0, timezone: "Asia/Tokyo" },
        },
        {
          naive: { year: 1970, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: null },
          timezone: "-09:00",
          expected: { year: 1969, month: 12, day: 31, hour: 15, minute: 0, second: 0, timezone: "-09:00" },
        },
      ];

      explicitCases.forEach(({ naive, timezone, expected }) => {
        const naiveDt = buildGregorian(naive);
        const actual = GregorianDateTime.fromUtcNaive(naiveDt, timezone);
        expect(actual).toEqual(buildGregorian(expected));
      });
    });
  });

  describe("isHoliday", () => {
    it("休日なら真", () => {
      expect(
        buildGregorian({
          year: 2020,
          month: 2,
          day: 24,
          hour: 0,
          minute: 0,
          second: 0,
          timezone: null,
        }).isHoliday,
      ).toBe(true);
      expect(
        buildGregorian({
          year: 2020,
          month: 2,
          day: 25,
          hour: 0,
          minute: 0,
          second: 0,
          timezone: null,
        }).isHoliday,
      ).toBe(false);
    });
  });

  describe("toUtcNaive", () => {
    it("タイムゾーン付GregorianDateTimeをナイーブに変換", () => {
      const explicitCases: Array<{
        original: GregorianDateTimeInit;
        expected: GregorianDateTimeInit;
      }> = [
        {
          original: { year: 1970, month: 1, day: 1, hour: 9, minute: 0, second: 0, timezone: "+09:00" },
          expected: { year: 1970, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: null },
        },
        {
          original: { year: 1970, month: 1, day: 1, hour: 9, minute: 0, second: 0, timezone: "Asia/Tokyo" },
          expected: { year: 1970, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: null },
        },
        {
          original: { year: 1969, month: 12, day: 31, hour: 15, minute: 0, second: 0, timezone: "-09:00" },
          expected: { year: 1970, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: null },
        },
      ];

      explicitCases.forEach(({ original, expected }) => {
        const actual = buildGregorian(original).toUtcNaive();
        expect(actual).toEqual(buildGregorian(expected));
      });
    });
  });

  describe("weekday", () => {
    it("曜日番号（1=月）", () => {
      expect(
        buildGregorian({ year: 2020, month: 2, day: 24, hour: 0, minute: 0, second: 0, timezone: null }).weekday,
      ).toBe(1);
      expect(
        buildGregorian({ year: 2020, month: 2, day: 25, hour: 0, minute: 0, second: 0, timezone: null }).weekday,
      ).toBe(2);
    });
  });
});
