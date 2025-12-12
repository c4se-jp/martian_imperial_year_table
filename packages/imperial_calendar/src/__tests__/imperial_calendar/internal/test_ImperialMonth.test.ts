import { describe, it, expect } from "vitest";
import { ImperialMonth } from "../../../internal/ImperialMonth";

describe("ImperialMonth", () => {
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
