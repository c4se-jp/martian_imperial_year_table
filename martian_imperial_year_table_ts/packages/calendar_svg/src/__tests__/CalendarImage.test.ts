import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { ImperialDateTime } from "../../../imperial_calendar/src/ImperialDateTime";
import { CalendarImage, drawCalendarSvg } from "../CalendarImage";

describe("CalendarImage", () => {
  it("生成されたSVGにタイトルとテキストを含む", () => {
    const imdt = new ImperialDateTime(1425, 1, 1, 0, 0, 0, "+00:00");
    const svg = new CalendarImage(imdt, "+09:00").drawAsSvg();
    expect(svg).toContain("帝國火星暦");
    const dom = new JSDOM(svg, { contentType: "image/svg+xml" });
    const title = dom.window.document.querySelector("title");
    expect(title?.textContent).toBe("帝國火星曆1425年1月");
    expect(dom.window.document.querySelectorAll("text").length).toBeGreaterThan(0);
  });

  it("drawCalendarSvg ヘルパー経由でも描画できる", () => {
    const imdt = new ImperialDateTime(1425, 2, 1, 0, 0, 0, "+00:00");
    const svg = drawCalendarSvg(imdt, "+09:00");
    expect(svg.startsWith("<svg")).toBe(true);
  });
});
