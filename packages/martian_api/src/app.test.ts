import { describe, expect, test } from "vitest";
import { app } from "./app.js";

function formatImperialDateTime(value: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  timezone: string;
}): string {
  const pad = (num: number, length: number) => num.toString().padStart(length, "0");
  return `${pad(value.year, 4)}-${pad(value.month, 2)}-${pad(value.day, 2)}T${pad(value.hour, 2)}:${pad(value.minute, 2)}:${pad(value.second, 2)}${value.timezone}`;
}

describe("/api/gregorian-datetime/from-imperial", () => {
  test("正しいリクエストは GregorianDateTime を返す", async () => {
    const response = await app.request("/api/gregorian-datetime/from-imperial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imperialDateTimeFormatted: "0217-01-01T00:00:00+00:00",
        gregorianTimezone: "-05:00",
      }),
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      gregorianDateTime: expect.stringMatching(/^-?\d{1,}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-05:00$/),
    });
  });

  test("不正な imperialDateTimeFormatted は 400 を返す", async () => {
    const response = await app.request("/api/gregorian-datetime/from-imperial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imperialDateTimeFormatted: "2025-13-40T99:99:99+00:00",
        gregorianTimezone: "+00:00",
      }),
    });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Invalid imperialDateTimeFormatted" });
  });
});

describe("/api/imperial-datetime/current", () => {
  test("timezone 未指定の場合は +00:00 で現在日時を返す", async () => {
    const response = await app.request("/api/imperial-datetime/current");
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      gregorianDateTime: string;
      imperialDateTime: {
        year: number;
        month: number;
        day: number;
        hour: number;
        minute: number;
        second: number;
        timezone: string;
      };
      imperialDateTimeFormatted: string;
    };

    expect(body.gregorianDateTime).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(body.imperialDateTime.timezone).toBe("+00:00");
    expect(body.imperialDateTimeFormatted).toBe(formatImperialDateTime(body.imperialDateTime));
  });

  test("不正な timezone format は 400 を返す", async () => {
    const response = await app.request("/api/imperial-datetime/current?timezone=0900");
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Invalid timezone format" });
  });

  test("不正な timezone value は 400 を返す", async () => {
    const response = await app.request("/api/imperial-datetime/current?timezone=%2B24%3A00");
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Invalid timezone value" });
  });
});

describe("/api/imperial-datetime/from-gregorian", () => {
  test("正しいリクエストは ImperialDateTime を返す", async () => {
    const response = await app.request("/api/imperial-datetime/from-gregorian", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gregorianDateTime: "2025-01-01T00:00:00+00:00",
        imperialTimezone: "+09:00",
      }),
    });
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      imperialDateTime: {
        year: number;
        month: number;
        day: number;
        hour: number;
        minute: number;
        second: number;
        timezone: string;
      };
      imperialDateTimeFormatted: string;
    };
    expect(body.imperialDateTime.timezone).toBe("+09:00");
    expect(body.imperialDateTimeFormatted).toBe(formatImperialDateTime(body.imperialDateTime));
  });

  test("JSON でない body は 400 を返す", async () => {
    const response = await app.request("/api/imperial-datetime/from-gregorian", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "not-json",
    });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Invalid request body" });
  });

  test("gregorianDateTime の format 不正は 400 を返す", async () => {
    const response = await app.request("/api/imperial-datetime/from-gregorian", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gregorianDateTime: "2025-01-01 00:00:00",
        imperialTimezone: "+09:00",
      }),
    });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Invalid gregorianDateTime format" });
  });
});

describe("not found", () => {
  test("未定義ルートは 404 を返す", async () => {
    const response = await app.request("/api/unknown");
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ message: "Not Found" });
  });
});
