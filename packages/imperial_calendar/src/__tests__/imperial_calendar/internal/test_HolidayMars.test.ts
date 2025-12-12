import { afterAll, describe, it, expect } from "vitest";
import { HolidayMars, Holidays, Internal } from "../../../internal/HolidayMars";

describe("HolidayMars", () => {
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

      increasingCases.forEach(([low, high]) => {
        expect(low < high).toBe(true);
      });

      const decreasingCases = [
        [new HolidayMars(2, 1, 2), new HolidayMars(1, 2, 2)],
        [new HolidayMars(2, 2, 1), new HolidayMars(2, 1, 2)],
        [new HolidayMars(2, 2, 2), new HolidayMars(2, 2, 1)],
      ] as const;

      decreasingCases.forEach(([low, high]) => {
        expect(low < high).toBe(false);
      });
    });
  });

  describe("names", () => {
    it("祝日の名前", () => {
      Holidays.setUpForTest({
        1425: { 1: { 1: [new Internal("僞1"), new Internal("僞2")] } },
      });
      expect(new HolidayMars(1425, 1, 1).names).toEqual(["僞1", "僞2"]);
    });
  });
});
