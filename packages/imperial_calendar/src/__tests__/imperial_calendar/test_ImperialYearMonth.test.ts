import { describe, it, expect } from "vitest";
import { ImperialYearMonth } from "../../ImperialYearMonth";

describe("ImperialYearMonth", () => {
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
