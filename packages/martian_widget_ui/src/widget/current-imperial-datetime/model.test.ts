import { describe, expect, test } from "vitest";
import {
  buildCurrentImperialDatetimeDisplayModel,
  createInitialState,
  extractCurrentImperialDatetimeResponse,
} from "./model";

describe("current imperial datetime model", () => {
  test("structuredContent.response から response を抽出できる", () => {
    const result = {
      structuredContent: {
        mode: "get_current_imperial",
        request: { timezone: "+09:00" },
        response: {
          gregorianDateTime: "2026-02-16T03:34:56.000Z",
          imperialDateTime: {
            year: 1239,
            month: 8,
            day: 20,
            hour: 12,
            minute: 34,
            second: 56,
            timezone: "+09:00",
          },
          imperialDateTimeFormatted: "1239-08-20T12:34:56+09:00",
        },
      },
    };

    expect(extractCurrentImperialDatetimeResponse(result as never)?.imperialDateTimeFormatted).toBe(
      "1239-08-20T12:34:56+09:00",
    );
  });

  test("表示 model は完全 response を整形する", () => {
    const state = {
      ...createInitialState({
        structuredContent: {
          mode: "get_current_imperial",
          request: { timezone: "+09:00" },
          response: {
            gregorianDateTime: "2026-02-16T03:34:56.000Z",
            imperialDateTime: {
              year: 1239,
              month: 8,
              day: 20,
              hour: 12,
              minute: 34,
              second: 56,
              timezone: "+09:00",
            },
            imperialDateTimeFormatted: "1239-08-20T12:34:56+09:00",
          },
        },
      } as never),
      lastFetchedAt: "2026-02-16T03:34:56.000Z",
    };

    const model = buildCurrentImperialDatetimeDisplayModel(state, Date.parse("2026-02-16T03:35:10.000Z"));
    expect(model.imperialDateLine).toBe("帝國火星曆: 1239-08-20 12:34:56 +09:00");
    expect(model.imperialTimeLine).toBe("時刻: 12:34:56");
    expect(model.timezoneLine).toBe("タイムゾーン: +09:00");
    expect(model.gregorianLine).toBe("Gregorian: 2026-02-16T03:34:56.000Z");
    expect(model.relativeFetchedAt).toBe("最終取得: 14秒前");
  });

  test("formatted が無くても分解値から表示できる", () => {
    const state = {
      ...createInitialState({
        structuredContent: {
          mode: "get_current_imperial",
          request: { timezone: "+09:00" },
          response: {
            gregorianDateTime: "2026-02-16T03:34:56.000Z",
            imperialDateTime: {
              year: 1239,
              month: 8,
              day: 20,
              hour: 12,
              minute: 34,
              second: 56,
              timezone: "+09:00",
            },
          },
        },
      } as never),
      lastFetchedAt: "2026-02-16T03:34:56.000Z",
    };

    const model = buildCurrentImperialDatetimeDisplayModel(state, Date.parse("2026-02-16T03:35:10.000Z"));
    expect(model.imperialDateLine).toBe("帝國火星曆: 1239-08-20 12:34:56 +09:00");
  });

  test("formatted のみでも最低限表示できる", () => {
    const state = {
      ...createInitialState({
        structuredContent: {
          mode: "get_current_imperial",
          request: { timezone: "+09:00" },
          response: {
            gregorianDateTime: "2026-02-16T03:34:56.000Z",
            imperialDateTimeFormatted: "1239-08-20T12:34:56+09:00",
          },
        },
      } as never),
      lastFetchedAt: "2026-02-16T03:34:56.000Z",
    };

    const model = buildCurrentImperialDatetimeDisplayModel(state, Date.parse("2026-02-16T03:35:10.000Z"));
    expect(model.imperialDateLine).toBe("帝國火星曆: 1239-08-20 12:34:56 +09:00");
    expect(model.timezoneLine).toBe("タイムゾーン: +09:00");
  });
});
