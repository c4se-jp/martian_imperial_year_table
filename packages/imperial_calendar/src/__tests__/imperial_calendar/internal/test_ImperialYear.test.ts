import { describe, it, expect } from "vitest";
import { ImperialYear } from "../../../internal/ImperialYear";

describe("ImperialYear", () => {
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
