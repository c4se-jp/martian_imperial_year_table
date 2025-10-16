import { afterAll, describe, it, expect } from "vitest";

// NOTE: Python 実装から移植したテストです。実装が未移植のため describe を skip していますが、
// 実装が揃った際には同じ振る舞いを検証できるようにしています。

type Timezone = string | null;

interface GregorianDateTimeInit {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  timezone: Timezone;
}

interface ImperialDateTimeInit {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  timezone: Timezone;
}

declare class GregorianDateTime {
  constructor(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    timezone: Timezone,
  );
  static fromUtcNaive(naive: GregorianDateTime, timezone: string): GregorianDateTime;
  toUtcNaive(): GregorianDateTime;
  get isHoliday(): boolean;
  get weekday(): number;
}

declare class ImperialDateTime {
  constructor(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    timezone: Timezone,
  );
  static fromStandardNaive(naive: ImperialDateTime, timezone: string): ImperialDateTime;
  toStandardNaive(): ImperialDateTime;
  get holiday(): HolidayMars | null;
  get japaneseMonthName(): string;
  get offset(): number;
}

declare class ImperialYearMonth {
  constructor(year: number, month: number);
  days(): number;
  nextMonth(): ImperialYearMonth;
  prevMonth(): ImperialYearMonth;
}

declare class ImperialMonth {
  constructor(month: number);
  days(): number;
}

declare class ImperialYear {
  constructor(year: number);
  isLeapYear(): boolean;
  days(): number;
}

declare class ImperialSolNumber {
  constructor(day: number, second?: number);
}

declare class HolidayMars {
  constructor(year: number, month: number, day: number);
  static between(lhs: HolidayMars, rhs: HolidayMars): HolidayMars[];
  get isHoliday(): boolean;
  get names(): string[];
}

declare class Internal {
  constructor(name: string);
}

declare const Holidays: {
  setUpForTest(data: Record<number, Record<number, Record<number, Internal | Internal[]>>>): void;
  tearDownForTest(): void;
};

declare class JulianDay {
  constructor(value: number);
  value: number;
}

declare function grdtToJuld(dateTime: GregorianDateTime): JulianDay;
declare function juldToGrdt(day: JulianDay): GregorianDateTime;
declare function juldToTert(day: JulianDay): number;
declare function tertToMrls(tert: number): number;
declare function imdtToImsn(imperialDateTime: ImperialDateTime): ImperialSolNumber;
declare function imsnToImdt(imperialSolNumber: ImperialSolNumber): ImperialDateTime;

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

describe.skip("GregorianDateTime", () => {
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
        const expectedDt = buildGregorian(expected);
        const result = GregorianDateTime.fromUtcNaive(naiveDt, timezone);
        expect(result).toEqual(expectedDt);
      });

      const timezones = ["+00:00", "-00:00", "UTC"] as const;
      for (let second = 0; second < 60; second += 1) {
        timezones.forEach((timezone) => {
          const naiveDt = buildGregorian({
            year: 1970,
            month: 1,
            day: 1,
            hour: 0,
            minute: 0,
            second,
            timezone: null,
          });
          const expectedDt = buildGregorian({
            year: 1970,
            month: 1,
            day: 1,
            hour: 0,
            minute: 0,
            second,
            timezone,
          });
          const result = GregorianDateTime.fromUtcNaive(naiveDt, timezone);
          expect(result).toEqual(expectedDt);
        });
      }
    });
  });

  describe("isHoliday", () => {
    it("祝日判定", () => {
      expect(buildGregorian({ year: 2020, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: "Asia/Tokyo" }).isHoliday).toBe(true);
      expect(buildGregorian({ year: 2020, month: 1, day: 2, hour: 0, minute: 0, second: 0, timezone: "Asia/Tokyo" }).isHoliday).toBe(false);
      expect(buildGregorian({ year: 2020, month: 2, day: 22, hour: 0, minute: 0, second: 0, timezone: "Asia/Tokyo" }).isHoliday).toBe(false);
      expect(buildGregorian({ year: 2020, month: 2, day: 23, hour: 0, minute: 0, second: 0, timezone: "Asia/Tokyo" }).isHoliday).toBe(true);
      expect(buildGregorian({ year: 2020, month: 2, day: 24, hour: 0, minute: 0, second: 0, timezone: "Asia/Tokyo" }).isHoliday).toBe(true);
      expect(buildGregorian({ year: 2020, month: 2, day: 25, hour: 0, minute: 0, second: 0, timezone: "Asia/Tokyo" }).isHoliday).toBe(false);
    });
  });

  describe("toUtcNaive", () => {
    it("UTCナイーブなGregorianDateTimeに変換", () => {
      const explicitCases: Array<{
        input: GregorianDateTimeInit;
        expected: GregorianDateTimeInit;
      }> = [
        {
          input: { year: 1970, month: 1, day: 1, hour: 9, minute: 0, second: 0, timezone: "+09:00" },
          expected: { year: 1970, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: null },
        },
        {
          input: { year: 1970, month: 1, day: 1, hour: 9, minute: 0, second: 0, timezone: "Asia/Tokyo" },
          expected: { year: 1970, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: null },
        },
        {
          input: { year: 1969, month: 12, day: 31, hour: 15, minute: 0, second: 0, timezone: "-09:00" },
          expected: { year: 1970, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: null },
        },
      ];

      explicitCases.forEach(({ input, expected }) => {
        const gregorian = buildGregorian(input);
        expect(gregorian.toUtcNaive()).toEqual(buildGregorian(expected));
      });

      const timezones = ["+00:00", "-00:00", "UTC"] as const;
      for (let second = 0; second < 60; second += 1) {
        timezones.forEach((timezone) => {
          const gregorian = buildGregorian({
            year: 1970,
            month: 1,
            day: 1,
            hour: 0,
            minute: 0,
            second,
            timezone,
          });
          const expected = buildGregorian({
            year: 1970,
            month: 1,
            day: 1,
            hour: 0,
            minute: 0,
            second,
            timezone: null,
          });
          expect(gregorian.toUtcNaive()).toEqual(expected);
        });
      }
    });
  });

  describe("weekday", () => {
    it("正しい曜日を取得する", () => {
      expect(buildGregorian({ year: 2020, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: "+09:00" }).weekday).toBe(3);
      expect(buildGregorian({ year: 2020, month: 12, day: 31, hour: 0, minute: 0, second: 0, timezone: "+09:00" }).weekday).toBe(4);
    });
  });
});

describe.skip("ImperialDateTime", () => {
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
          rhs: { year: 2, month: 2, day: 2, hour: 1, minute: 2, second: 2, timezone: null },
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

describe.skip("ImperialSolNumber", () => {
  describe("等値性", () => {
    it("等値性", () => {
      expect(new ImperialSolNumber(0.0)).toEqual(new ImperialSolNumber(0.0));
      expect(new ImperialSolNumber(0.0)).not.toEqual(new ImperialSolNumber(0.1));
    });
  });
});

describe.skip("ImperialYearMonth", () => {
  describe("days", () => {
    it("月の日数", () => {
      const testCases = [
        { year: 1245, month: 24, expected: 28 },
        { year: 1246, month: 24, expected: 27 },
      ];

      testCases.forEach(({ year, month, expected }) => {
        expect(new ImperialYearMonth(year, month).days()).toBe(expected);
      });
    });
  });

  describe("nextMonth", () => {
    it("翌月", () => {
      const testCases = [
        { input: { year: 1425, month: 1 }, expected: { year: 1425, month: 2 } },
        { input: { year: 1425, month: 24 }, expected: { year: 1426, month: 1 } },
      ];

      testCases.forEach(({ input, expected }) => {
        const nextMonth = new ImperialYearMonth(input.year, input.month).nextMonth();
        expect(nextMonth).toEqual(new ImperialYearMonth(expected.year, expected.month));
      });
    });
  });

  describe("prevMonth", () => {
    it("先月", () => {
      const testCases = [
        { input: { year: 1425, month: 2 }, expected: { year: 1425, month: 1 } },
        { input: { year: 1425, month: 1 }, expected: { year: 1424, month: 24 } },
      ];

      testCases.forEach(({ input, expected }) => {
        const prevMonth = new ImperialYearMonth(input.year, input.month).prevMonth();
        expect(prevMonth).toEqual(new ImperialYearMonth(expected.year, expected.month));
      });
    });
  });
});

describe.skip("HolidayMars", () => {
  afterAll(() => {
    Holidays.tearDownForTest();
  });

  describe("between", () => {
    it("該当期間中の祝日一覧", () => {
      Holidays.setUpForTest({
        1425: {
          1: {
            1: new Internal("僞1"),
            3: new Internal("僞2"),
            5: new Internal("僞3"),
          },
        },
      });

      const cases: Array<{ start: HolidayMars; end: HolidayMars; expected: HolidayMars[] }> = [
        {
          expected: [new HolidayMars(1425, 1, 1), new HolidayMars(1425, 1, 3), new HolidayMars(1425, 1, 5)],
          start: new HolidayMars(1425, 1, 1),
          end: new HolidayMars(1425, 1, 5),
        },
        {
          expected: [new HolidayMars(1425, 1, 3), new HolidayMars(1425, 1, 5)],
          start: new HolidayMars(1425, 1, 2),
          end: new HolidayMars(1425, 1, 5),
        },
        {
          expected: [new HolidayMars(1425, 1, 1), new HolidayMars(1425, 1, 3)],
          start: new HolidayMars(1425, 1, 1),
          end: new HolidayMars(1425, 1, 4),
        },
      ];

      cases.forEach(({ expected, start, end }) => {
        expect(HolidayMars.between(start, end)).toEqual(expected);
      });

      Holidays.setUpForTest({
        1425: { 1: { 26: new Internal("僞1") }, 2: { 2: new Internal("僞2") } },
      });
      expect(HolidayMars.between(new HolidayMars(1425, 1, 26), new HolidayMars(1425, 2, 2))).toEqual([
        new HolidayMars(1425, 1, 26),
        new HolidayMars(1425, 2, 2),
      ]);

      Holidays.setUpForTest({
        1425: { 24: { 26: new Internal("僞1") } },
        1426: { 1: { 1: new Internal("僞2") } },
      });
      expect(HolidayMars.between(new HolidayMars(1425, 24, 26), new HolidayMars(1426, 1, 1))).toEqual([
        new HolidayMars(1425, 24, 26),
        new HolidayMars(1426, 1, 1),
      ]);
    });
  });

  describe("isHoliday", () => {
    it("その日が祝日であるか否か", () => {
      Holidays.setUpForTest({ 1425: { 1: { 1: new Internal("僞1") } } });
      expect(new HolidayMars(1425, 1, 1).isHoliday).toBe(true);
      expect(new HolidayMars(1425, 1, 2).isHoliday).toBe(false);

      Holidays.setUpForTest({ 1425: { 1: { 2: [new Internal("僞1"), new Internal("僞2")] } } });
      expect(new HolidayMars(1425, 1, 1).isHoliday).toBe(false);
      expect(new HolidayMars(1425, 1, 2).isHoliday).toBe(true);
    });
  });

  describe("より小さい", () => {
    it("より小さい", () => {
      const lhs = new HolidayMars(2, 2, 2);
      const rhs = new HolidayMars(2, 2, 2);
      expect(lhs < rhs).toBe(false);

      const increasingCases = [
        [new HolidayMars(1, 2, 2), new HolidayMars(2, 2, 2)],
        [new HolidayMars(2, 1, 2), new HolidayMars(2, 2, 2)],
        [new HolidayMars(2, 2, 1), new HolidayMars(2, 2, 2)],
      ] as const;

      increasingCases.forEach(([l, r]) => {
        expect(l < r).toBe(true);
      });

      const decreasingCases = [
        [new HolidayMars(2, 1, 2), new HolidayMars(1, 2, 2)],
        [new HolidayMars(2, 2, 1), new HolidayMars(2, 1, 2)],
      ] as const;

      decreasingCases.forEach(([l, r]) => {
        expect(l < r).toBe(false);
      });
    });
  });

  describe("names", () => {
    it("祝日の呼び名", () => {
      Holidays.setUpForTest({ 1425: { 3: { 3: new Internal("僞1") } } });
      expect(new HolidayMars(1425, 3, 3).names).toEqual(["僞1"]);

      Holidays.setUpForTest({ 1425: { 3: { 3: [new Internal("僞1"), new Internal("僞2")] } } });
      expect(new HolidayMars(1425, 3, 3).names).toEqual(["僞1", "僞2"]);
    });
  });
});

describe.skip("ImperialMonth", () => {
  describe("days", () => {
    it("この月の日数", () => {
      const testCases = [
        { month: 1, days: 28 },
        { month: 2, days: 28 },
        { month: 3, days: 28 },
        { month: 4, days: 28 },
        { month: 5, days: 28 },
        { month: 6, days: 27 },
        { month: 7, days: 28 },
        { month: 8, days: 28 },
        { month: 9, days: 28 },
        { month: 10, days: 28 },
        { month: 11, days: 28 },
        { month: 12, days: 27 },
        { month: 13, days: 28 },
        { month: 14, days: 28 },
        { month: 15, days: 28 },
        { month: 16, days: 28 },
        { month: 17, days: 28 },
        { month: 18, days: 27 },
        { month: 19, days: 28 },
        { month: 20, days: 28 },
        { month: 21, days: 28 },
        { month: 22, days: 28 },
        { month: 23, days: 28 },
        { month: 24, days: 27 },
      ];

      testCases.forEach(({ month, days }) => {
        expect(new ImperialMonth(month).days()).toBe(days);
      });
    });
  });
});

describe.skip("ImperialYear", () => {
  describe("isLeapYear", () => {
    it("閏年か否か", () => {
      [1, 10].forEach((year) => {
        expect(new ImperialYear(year).isLeapYear()).toBe(true);
      });

      [0, 2, 250].forEach((year) => {
        expect(new ImperialYear(year).isLeapYear()).toBe(false);
      });
    });
  });

  describe("days", () => {
    it("この年の日数", () => {
      const testCases = [
        { year: 0, days: 668 },
        { year: 2, days: 668 },
        { year: 1, days: 669 },
        { year: 10, days: 669 },
        { year: 250, days: 668 },
      ];

      testCases.forEach(({ year, days }) => {
        expect(new ImperialYear(year).days()).toBe(days);
      });
    });
  });
});

describe.skip("Transform Functions", () => {
  describe("grdtToJuld", () => {
    it("GregorianDateTimeをJulianDayに変換する", () => {
      const testCases = [
        { grdt: { year: 1582, month: 10, day: 15, hour: 12, minute: 0, second: 0, timezone: null }, expected: 2299161.0 },
        { grdt: { year: 1710, month: 2, day: 23, hour: 12, minute: 0, second: 0, timezone: null }, expected: 2345678.0 },
        { grdt: { year: 1858, month: 11, day: 17, hour: 0, minute: 0, second: 0, timezone: null }, expected: 2400000.5 },
        { grdt: { year: 2000, month: 1, day: 1, hour: 12, minute: 0, second: 0, timezone: null }, expected: 2451545.0 },
        { grdt: { year: 2014, month: 5, day: 11, hour: 12, minute: 0, second: 0, timezone: null }, expected: 2456789.0 },
        { grdt: { year: 2318, month: 7, day: 18, hour: 12, minute: 0, second: 0, timezone: null }, expected: 2567890.0 },
        { grdt: { year: 3501, month: 8, day: 15, hour: 12, minute: 0, second: 0, timezone: null }, expected: 3000000.0 },
        { grdt: { year: 4752, month: 4, day: 7, hour: 12, minute: 0, second: 0, timezone: null }, expected: 3456789.0 },
        { grdt: { year: 6239, month: 7, day: 12, hour: 12, minute: 0, second: 0, timezone: null }, expected: 4000000.0 },
      ];

      testCases.forEach(({ grdt, expected }) => {
        const result = grdtToJuld(buildGregorian(grdt)).value;
        expect(result).toBe(expected);
      });
    });

    it("時刻を変換する", () => {
      const testCases = [
        { grdt: { year: 1970, month: 1, day: 1, hour: 21, minute: 5, second: 22, timezone: null }, expected: 2440588.37873 },
        { grdt: { year: 1970, month: 1, day: 1, hour: 21, minute: 5, second: 23, timezone: null }, expected: 2440588.37874 },
      ];

      testCases.forEach(({ grdt, expected }) => {
        const result = grdtToJuld(buildGregorian(grdt)).value;
        expect(result).toBe(expected);
      });
    });
  });

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

  describe("imsnToImdt", () => {
    it("ImperialSolNumberをImperialDateTimeに変換する", () => {
      const testCases = [
        { imsn: new ImperialSolNumber(0.0), expected: { year: 0, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: null } },
        { imsn: new ImperialSolNumber(668596.0), expected: { year: 1000, month: 1, day: 1, hour: 0, minute: 0, second: 0, timezone: null } },
        { imsn: new ImperialSolNumber(668.26001), expected: { year: 1, month: 1, day: 1, hour: 6, minute: 14, second: 25, timezone: null } },
        {
          imsn: new ImperialSolNumber(1328646, 45630.0),
          expected: { year: 1987, month: 6, day: 7, hour: 12, minute: 40, second: 30, timezone: null },
        },
        { imsn: new ImperialSolNumber(2093.25495), expected: { year: 3, month: 4, day: 5, hour: 6, minute: 7, second: 8, timezone: null } },
        { imsn: new ImperialSolNumber(-1.0), expected: { year: -1, month: 24, day: 28, hour: 0, minute: 0, second: 0, timezone: null } },
      ];

      testCases.forEach(({ imsn, expected }) => {
        const imperialDateTime = imsnToImdt(imsn);
        expect(imperialDateTime).toEqual(buildImperial(expected));
      });
    });
  });
});
