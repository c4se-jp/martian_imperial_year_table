import { describe, expect, it, vi, afterEach } from "vitest";
import { app } from "./app.js";

async function query(query: string, variables?: Record<string, unknown>, operationName?: string) {
  const response = await app.request("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables, operationName }),
  });
  return { response, body: await response.json() };
}

afterEach(() => vi.useRealTimers());

describe("GraphQL API", () => {
  it("選擇した値とタイムゾーンを返す", async () => {
    const { response, body } = await query(
      `query Convert($date: GregorianDateTimeString!) {
      fromGregorian(datetime: $date) {
        utc: gregorian { formatted }
        japan: gregorian(timezone: "+09:00") { formatted millisecond }
        imperial { year month day second millisecond holidayNames }
        julianDay { day second }
        terrestrialTime marsSolDate imperialSolNumber { day second }
        deltaTSeconds solarLongitudeDegrees
      }
    }`,
      { date: "2026-06-01T12:00:00.123+09:00" },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body.errors).toBeUndefined();
    expect(body.data.fromGregorian.utc.formatted).toBe("2026-06-01T03:00:00.123+00:00");
    expect(body.data.fromGregorian.japan.millisecond).toBe(123);
    expect(body.data.fromGregorian.imperial.millisecond).toBe(0);
    expect(body.data.fromGregorian.solarLongitudeDegrees).toBeGreaterThanOrEqual(0);
    expect(body.data.fromGregorian.solarLongitudeDegrees).toBeLessThan(360);
  });

  it("REST と同じ火星曆日時を返す", async () => {
    const rest = await app.request("/api/imperial-datetime/from-gregorian", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gregorianDateTime: "2026-06-01T12:00:00+09:00", imperialTimezone: "+03:00" }),
    });
    const expected = await rest.json();
    const { body } = await query(`{ fromGregorian(datetime: "2026-06-01T12:00:00+09:00") {
      imperial(timezone: "+03:00") { formatted }
    } }`);
    expect(body.data.fromGregorian.imperial.formatted).toBe(expected.imperialDateTimeFormatted);
  });

  it("各入力時系から同じ瞬閒へ變換する", async () => {
    const { body: initial } = await query(`{ fromGregorian(datetime: "2026-06-01T03:00:00Z") {
      julianDay { day second } terrestrialTime marsSolDate
      imperialSolNumber { day second }
      imperial { year month day hour minute second timezone }
    } }`);
    const values = initial.data.fromGregorian;
    for (const [field, type, value, arg] of [
      ["fromJulianDay", "JulianDayInput!", values.julianDay, "value"],
      ["fromTerrestrialTime", "Float!", values.terrestrialTime, "value"],
      ["fromMarsSolDate", "Float!", values.marsSolDate, "value"],
      ["fromImperialSolNumber", "ImperialSolNumberInput!", values.imperialSolNumber, "value"],
      ["fromImperial", "ImperialDateTimeInput!", values.imperial, "datetime"],
    ] as const) {
      const { body } = await query(
        `query($input: ${type}) {
        result: ${field}(${arg}: $input) { julianDay { day second } }
      }`,
        { input: value },
      );
      expect(body.errors, field).toBeUndefined();
      const result = body.data.result.julianDay;
      const delta = (result.day - values.julianDay.day) * 86400 + result.second - values.julianDay.second;
      expect(Math.abs(delta), field).toBeLessThan(2);
    }
  });

  it("現在時刻を一囘の實行中で固定する", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T03:00:00Z"));
    const { body } = await query("{ a: now { gregorian { formatted } } b: now { gregorian { formatted } } }");
    expect(body.data.a).toEqual(body.data.b);
    expect(body.data.a.gregorian.formatted).toBe("2026-06-01T03:00:00.000+00:00");
  });

  it.each([
    `{ fromGregorian(datetime: "2026-02-30T00:00:00Z") { marsSolDate } }`,
    `{ fromGregorian(datetime: "2026-01-01T00:00:00") { marsSolDate } }`,
    `{ now { imperial(timezone: "+24:00") { year } } }`,
  ])("不正な scalar を拒否する: %s", async (source) => {
    const { response, body } = await query(source);
    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });

  it.each([
    `fromImperial(datetime: {year: 3000, month: 25, day: 1})`,
    `fromImperial(datetime: {year: 3000, month: 1, day: 1, millisecond: 1})`,
    `fromImperialSolNumber(value: {day: 100, second: 0.5})`,
    `fromJulianDay(value: {day: 2451545, second: 86400})`,
  ])("入力不正を部分エラーとして返す: %s", async (field) => {
    const { body } = await query(`{ bad: ${field} { marsSolDate } good: now { marsSolDate } }`);
    expect(body.data.bad).toBeNull();
    expect(body.data.good.marsSolDate).toBeTypeOf("number");
    expect(body.errors[0].extensions.code).toBe("BAD_USER_INPUT");
  });

  it("範圍外を拒否する", async () => {
    const { body } = await query("{ fromJulianDay(value: {day: 2147483647}) { marsSolDate } }");
    expect(body.errors[0].extensions.code).toBe("OUT_OF_RANGE");
  });

  it("未知の欄と循環 fragment を拒否する", async () => {
    for (const source of ["{ unknown }", "{ now { ...F } } fragment F on CalendarInstant { ...F }"]) {
      const { response, body } = await query(source);
      expect(response.status).toBe(400);
      expect(body.errors).toBeDefined();
    }
  });

  it("fragment 展開後の複雜度を制限する", async () => {
    const fields = Array.from({ length: 90 }, (_, i) => `a${i}: now { ...F }`).join(" ");
    const { response } = await query(`{ ${fields} } fragment F on CalendarInstant { gregorian { year } }`);
    expect(response.status).toBe(400);
  });

  it("不正な HTTP body と過大なリクエストを拒否する", async () => {
    for (const body of ["null", "[]", "{", '{"query":123}']) {
      const response = await app.request("/graphql", { method: "POST", body });
      expect(response.status).toBe(400);
    }
    const response = await app.request("/graphql", { method: "POST", body: " ".repeat(16385) });
    expect(response.status).toBe(413);
  });

  it("operationName で實行對象を選擇する", async () => {
    const { body } = await query("query A { now { marsSolDate } } query B { now { terrestrialTime } }", {}, "B");
    expect(body.errors).toBeUndefined();
    expect(Object.keys(body.data.now)).toEqual(["terrestrialTime"]);
  });
});
