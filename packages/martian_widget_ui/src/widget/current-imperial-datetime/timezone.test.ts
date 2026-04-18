import { describe, expect, test } from "vitest";
import { formatTimezoneOffset, validateTimezone } from "./timezone";

describe("timezone", () => {
  test("validateTimezone は ±HH:MM 形式を受け入れる", () => {
    expect(validateTimezone("+09:00")).toBeUndefined();
  });

  test("validateTimezone は不正な形式を拒否する", () => {
    expect(validateTimezone("0900")).toBe("タイムゾーンは ±HH:MM 形式で入力してください。");
  });

  test("formatTimezoneOffset は分から ±HH:MM へ整形する", () => {
    expect(formatTimezoneOffset(540)).toBe("+09:00");
    expect(formatTimezoneOffset(-300)).toBe("-05:00");
  });
});
