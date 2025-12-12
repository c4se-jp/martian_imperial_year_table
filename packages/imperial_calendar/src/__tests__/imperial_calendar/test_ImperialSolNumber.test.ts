import { describe, it, expect } from "vitest";
import { ImperialSolNumber } from "../../ImperialSolNumber";

describe("ImperialSolNumber", () => {
  describe("等値性", () => {
    it("等値性", () => {
      expect(new ImperialSolNumber(0.0)).toEqual(new ImperialSolNumber(0.0));
      expect(new ImperialSolNumber(0.0)).not.toEqual(new ImperialSolNumber(0.1));
    });
  });
});
