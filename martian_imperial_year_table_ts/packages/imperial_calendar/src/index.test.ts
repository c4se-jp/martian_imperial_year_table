import { describe, it, expect } from "vitest";
import { getCurrentMartianYear, add, isEmpty } from "./index.js";

describe("imperial_calendar", () => {
  describe("getCurrentMartianYear", () => {
    it("現在の火星帝国暦の年を返す", () => {
      const martianYear = getCurrentMartianYear();
      const expectedYear = new Date().getFullYear() + 1000;
      expect(martianYear).toBe(expectedYear);
    });

    it("数値を返す", () => {
      const martianYear = getCurrentMartianYear();
      expect(typeof martianYear).toBe("number");
    });
  });

  describe("add", () => {
    it("正の数を足し算する", () => {
      expect(add(2, 3)).toBe(5);
    });

    it("負の数を足し算する", () => {
      expect(add(-2, -3)).toBe(-5);
    });

    it("正の数と負の数を足し算する", () => {
      expect(add(5, -3)).toBe(2);
    });

    it("ゼロを足し算する", () => {
      expect(add(0, 5)).toBe(5);
      expect(add(5, 0)).toBe(5);
    });
  });

  describe("isEmpty", () => {
    it("空文字列の場合はtrueを返す", () => {
      expect(isEmpty("")).toBe(true);
    });

    it("文字列がある場合はfalseを返す", () => {
      expect(isEmpty("hello")).toBe(false);
    });

    it("スペースのみの文字列の場合はfalseを返す", () => {
      expect(isEmpty(" ")).toBe(false);
    });
  });
});