import {
  GregorianDateTime,
  ImperialDateTime,
  ImperialYearMonth,
  ImperialSolNumber,
  JulianDay,
  MarsSolDate,
  SECONDS_PER_DAY,
  TerrestrialTime,
  grdtToJuld,
  imdtToImsn,
  imsnToImdt,
  imsnToMrsd,
  juldToGrdt,
  juldToTert,
  mrsdToImsn,
  mrsdToTert,
  tertToJuld,
  tertToMrsd,
} from "imperial_calendar";

const SVG_NS = "http://www.w3.org/2000/svg";
const DEFAULT_TIMEZONE = "+00:00";

type ElementAttributes = Record<string, string | number | undefined>;

type TextAttributes = ElementAttributes & {
  "font-size": number;
  y: number;
};

function textY(y: number, fontSize: number): number {
  return y + fontSize * 0.353;
}

type DomEnvironment = {
  document: Document;
  serializer: XMLSerializer;
  cleanup: () => void;
};

function hasBrowserDom(): boolean {
  return typeof globalThis.document !== "undefined" && typeof globalThis.document.createElement === "function";
}

async function createDomEnvironment(): Promise<DomEnvironment> {
  if (hasBrowserDom()) {
    const serializerCtor =
      (globalThis as typeof globalThis & { XMLSerializer?: typeof XMLSerializer }).XMLSerializer ?? XMLSerializer;
    return {
      document: globalThis.document,
      serializer: new serializerCtor(),
      cleanup: () => {},
    };
  }
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
  return {
    document: dom.window.document,
    serializer: new dom.window.XMLSerializer(),
    cleanup: () => {
      if (typeof dom.window.close === "function") {
        dom.window.close();
      }
    },
  };
}

function nextGrdtDayOf(grdt: GregorianDateTime): GregorianDateTime {
  const copy = grdt.copy();
  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let days = monthDays[copy.month - 1];
  if (copy.month === 2 && copy.year % 4 === 0 && (copy.year % 100 !== 0 || copy.year % 400 === 0)) {
    days = 29;
  }
  if (copy.day === days) {
    if (copy.month === 12) {
      copy.year += 1;
      copy.month = 1;
    } else {
      copy.month += 1;
    }
    copy.day = 1;
  } else {
    copy.day += 1;
  }
  return copy;
}

function grdtToImdt(grdt: GregorianDateTime, timezone: string | null): ImperialDateTime {
  const targetTimezone = timezone ?? DEFAULT_TIMEZONE;
  const juld = grdtToJuld(grdt.toUtcNaive());
  const tert = juldToTert(juld);
  const mrsd = tertToMrsd(tert);
  const imsn = mrsdToImsn(mrsd);
  return ImperialDateTime.fromStandardNaive(imsnToImdt(imsn), targetTimezone);
}

function imdtToGrdt(imdt: ImperialDateTime, timezone: string): GregorianDateTime {
  const imsn = imdtToImsn(imdt.toStandardNaive());
  const mrsd = imsnToMrsd(imsn);
  const tert = mrsdToTert(mrsd);
  const juld = tertToJuld(tert);
  return GregorianDateTime.fromUtcNaive(juldToGrdt(juld), timezone);
}

export class CalendarImage {
  static readonly BLACK = "#000000";
  static readonly BLUE = "#008dcc";
  static readonly FONT_FAMILY_BOLD =
    'fot-tsukubrdgothic-std, "FOT-TsukuBRdGothic Std B", "FOT-筑紫B丸ゴシック Std B", TsukuBRdGothic-Bold, "筑紫B丸ゴシック ボールド", sans-serif';
  static readonly FONT_FAMILY_REGULAR =
    'fot-tsukubrdgothic-std, "FOT-TsukuBRdGothic Std B", "FOT-筑紫B丸ゴシック Std B", TsukuBRdGothic-Bold, "筑紫B丸ゴシック ボールド", sans-serif';
  static readonly FONT_SIZE_ANNOTATION = 8.0;
  static readonly FONT_SIZE_BOLD_LARGE = 32.0;
  static readonly FONT_SIZE_LARGE = 20.0;
  static readonly FONT_SIZE_SMALL = 10.0;
  static readonly GRAY_BLUE = "#6bb4d6";
  static readonly GRAY_RED = "#ff9d80";
  static readonly GRAY = "#888888";
  static readonly HEIGHT_DAYS_GAP = 4.5;
  static readonly HEIGHT_GRDT_BELT = 5.5;
  static readonly HEIGHT_TOP_SPACE = 15.0;
  static readonly RED = "#e03f0c";
  static readonly SIZE_DAY_SQUARE = 22.5;
  static readonly STROKE_WIDTH_BOLD = "0.4mm";
  static readonly STROKE_WIDTH_THIN = "0.15mm";
  static readonly WHITE = "#ffffff";
  static readonly WIDTH_LEFT_SPACE = 45.0;

  private readonly imdt: ImperialDateTime;
  private readonly grdtTimezone: string;

  private document: Document | null = null;
  private serializer: XMLSerializer | null = null;
  private cleanupDom: (() => void) | null = null;

  constructor(imdt: ImperialDateTime, grdtTimezone: string) {
    this.grdtTimezone = grdtTimezone;
    this.imdt = imdt.copy();
    this.imdt.day = 1;
    this.imdt.hour = 0;
    this.imdt.minute = 0;
    this.imdt.second = 0;
  }

  async drawAsSvg(): Promise<string> {
    const domEnv = await createDomEnvironment();
    this.document = domEnv.document;
    this.serializer = domEnv.serializer;
    this.cleanupDom = domEnv.cleanup;
    const svg = this.document.createElementNS(SVG_NS, "svg");
    this.setAttributes(svg, {
      height: "148mm",
      style: `background-color: ${CalendarImage.WHITE};`,
      width: "210mm",
    });
    this.appendElement(svg, "title", {}, `帝國火星曆${this.imdt.year}年${this.imdt.month}月`);
    const group = this.appendElement(svg, "g", { "font-family": CalendarImage.FONT_FAMILY_REGULAR });
    this.drawTitle(group);
    this.drawJoubi(group);
    this.drawStaticFrame(group);
    this.drawImdtDays(group);
    this.drawImdtSyukuzitu(group);
    this.drawGrdtDays(group);
    const serializer = this.serializer;
    if (!serializer) {
      throw new Error("Serializer is not initialized");
    }
    const output = serializer.serializeToString(svg);
    this.cleanupDom?.();
    this.cleanupDom = null;
    this.document = null;
    this.serializer = null;
    return output;
  }

  private get doc(): Document {
    if (!this.document) {
      throw new Error("Document is not initialized");
    }
    return this.document;
  }

  private setAttributes(element: Element, attrs: ElementAttributes): void {
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }
      const normalized =
        typeof value === "number"
          ? Number.isInteger(value)
            ? value.toString()
            : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")
          : value;
      if (key === "style" && typeof normalized === "string") {
        element.setAttribute(key, normalized.trim());
      } else {
        element.setAttribute(key, normalized);
      }
    });
  }

  private appendElement(parent: Element, tag: string, attrs: ElementAttributes = {}, text?: string): Element {
    const element = this.doc.createElementNS(SVG_NS, tag);
    this.setAttributes(element, attrs);
    if (text !== undefined) {
      element.textContent = text;
    }
    parent.appendChild(element);
    return element;
  }

  private drawText(parent: Element, attrs: TextAttributes, text: string): void {
    const fontSize = attrs["font-size"];
    const y = textY(attrs.y, fontSize);
    const attribs: ElementAttributes = {
      ...attrs,
      y: `${y}mm`,
      "font-size": `${fontSize}pt`,
    };
    this.appendElement(parent, "text", attribs, text);
  }

  private drawGrdtDay(parent: Element, grdt: GregorianDateTime): void {
    const imdt = grdtToImdt(grdt, this.imdt.timezone);
    const seconds = ((imdt.hour * 60 + imdt.minute) * 60 + imdt.second) / SECONDS_PER_DAY;
    const lineX = seconds * CalendarImage.SIZE_DAY_SQUARE;
    const monthDays = ImperialYearMonthDays(this.imdt);
    if (imdt.month === this.imdt.month) {
      const column = (imdt.day - 1) % 7;
      const row = Math.floor((imdt.day - 1) / 7);
      const x = CalendarImage.WIDTH_LEFT_SPACE + lineX + CalendarImage.SIZE_DAY_SQUARE * column;
      const yBase =
        CalendarImage.HEIGHT_TOP_SPACE +
        CalendarImage.SIZE_DAY_SQUARE +
        (CalendarImage.HEIGHT_GRDT_BELT + CalendarImage.HEIGHT_DAYS_GAP + CalendarImage.SIZE_DAY_SQUARE) * row;
      this.appendElement(parent, "line", {
        stroke: CalendarImage.BLACK,
        "stroke-width": CalendarImage.STROKE_WIDTH_THIN,
        x1: `${x}mm`,
        x2: `${x}mm`,
        y1: `${yBase}mm`,
        y2: `${yBase + CalendarImage.HEIGHT_GRDT_BELT}mm`,
      });
    }
    const nextGrdt = nextGrdtDayOf(grdt);
    const nextImdt = grdtToImdt(nextGrdt, this.imdt.timezone);
    const nextSeconds = ((nextImdt.hour * 60 + nextImdt.minute) * 60 + nextImdt.second) / SECONDS_PER_DAY;
    const nextLineX = nextSeconds * CalendarImage.SIZE_DAY_SQUARE;
    const canDrawMonthHeader = nextLineX > 0.353 * CalendarImage.FONT_SIZE_SMALL * ("10/10".length * 0.6) + 1.5;
    let color: string;
    if (grdt.isHoliday || grdt.weekday === 7) {
      color = CalendarImage.GRAY_RED;
    } else if (grdt.weekday === 6) {
      color = CalendarImage.GRAY_BLUE;
    } else {
      color = CalendarImage.GRAY;
    }
    if (imdt.month === this.imdt.month) {
      const showMonthDay =
        grdt.day === 1 || (imdt.day === 1 && !canDrawMonthHeader) ? `${grdt.month}/${grdt.day}` : `${grdt.day}`;
      const canDrawInCell =
        CalendarImage.SIZE_DAY_SQUARE - lineX >
        0.353 * CalendarImage.FONT_SIZE_SMALL * (showMonthDay.length * 0.6) + 1.5;
      const isLastDay = imdt.day === monthDays;
      if (isLastDay && !canDrawInCell) {
        // Do nothing (keeps parity with Python implementation).
      } else if (imdt.day % 7 === 0 && !canDrawInCell) {
        const row = Math.ceil(imdt.day / 7);
        this.drawText(
          parent,
          {
            fill: color,
            "font-size": CalendarImage.FONT_SIZE_SMALL,
            x: `${CalendarImage.WIDTH_LEFT_SPACE + 1}mm`,
            y:
              CalendarImage.HEIGHT_TOP_SPACE +
              CalendarImage.SIZE_DAY_SQUARE +
              0.5 +
              (CalendarImage.HEIGHT_GRDT_BELT + CalendarImage.HEIGHT_DAYS_GAP + CalendarImage.SIZE_DAY_SQUARE) * row,
          },
          showMonthDay,
        );
      } else {
        const column = (imdt.day - 1) % 7;
        const row = Math.floor((imdt.day - 1) / 7);
        const x = CalendarImage.WIDTH_LEFT_SPACE + lineX + 1 + CalendarImage.SIZE_DAY_SQUARE * column;
        this.drawText(
          parent,
          {
            fill: color,
            "font-size": CalendarImage.FONT_SIZE_SMALL,
            x: `${x}mm`,
            y:
              CalendarImage.HEIGHT_TOP_SPACE +
              CalendarImage.SIZE_DAY_SQUARE +
              0.5 +
              (CalendarImage.HEIGHT_GRDT_BELT + CalendarImage.HEIGHT_DAYS_GAP + CalendarImage.SIZE_DAY_SQUARE) * row,
          },
          showMonthDay,
        );
      }
    } else if (canDrawMonthHeader) {
      this.drawText(
        parent,
        {
          fill: color,
          "font-size": CalendarImage.FONT_SIZE_SMALL,
          x: `${CalendarImage.WIDTH_LEFT_SPACE + 1}mm`,
          y: CalendarImage.HEIGHT_TOP_SPACE + CalendarImage.SIZE_DAY_SQUARE + 0.5,
        },
        `${grdt.month}/${grdt.day}`,
      );
    }
  }

  private drawGrdtDays(parent: Element): void {
    const drawing = imdtToGrdt(this.imdt, this.grdtTimezone);
    drawing.hour = 0;
    drawing.minute = 0;
    drawing.second = 0;
    let current = drawing;
    const monthEnd = this.nextImdtMonth();
    while (grdtToImdt(current, this.imdt.timezone) < monthEnd) {
      this.drawGrdtDay(parent, current);
      current = nextGrdtDayOf(current);
    }
  }

  private drawImdtDays(parent: Element): void {
    const days = ImperialYearMonthDays(this.imdt);
    for (let day = 1; day <= days; day += 1) {
      const imdt = this.imdt.copy();
      imdt.day = day;
      let color: string;
      if (imdt.holiday !== null || day % 7 === 1) {
        color = CalendarImage.RED;
      } else if (day % 7 === 0) {
        color = CalendarImage.BLUE;
      } else {
        color = CalendarImage.BLACK;
      }
      const column = (day - 1) % 7;
      const row = Math.floor((day - 1) / 7);
      const x = CalendarImage.WIDTH_LEFT_SPACE + 1 + CalendarImage.SIZE_DAY_SQUARE * column;
      const y =
        CalendarImage.HEIGHT_TOP_SPACE +
        1 +
        (CalendarImage.SIZE_DAY_SQUARE + CalendarImage.HEIGHT_GRDT_BELT + CalendarImage.HEIGHT_DAYS_GAP) * row;
      this.drawText(parent, { fill: color, "font-size": CalendarImage.FONT_SIZE_SMALL, x: `${x}mm`, y }, `${day}`);
      if (imdt.holiday) {
        const dayWidth = CalendarImage.FONT_SIZE_SMALL * (0.353 - 0.06) * `${day}`.length;
        this.drawText(
          parent,
          {
            fill: color,
            "font-size": CalendarImage.FONT_SIZE_ANNOTATION,
            style: `inline-size: ${CalendarImage.SIZE_DAY_SQUARE - dayWidth - 1}mm;`,
            x: `${x + dayWidth}mm`,
            y: y + 0.2,
          },
          imdt.holiday.names.join("・"),
        );
      }
    }
  }

  private drawImdtSyukuzitu(_parent: Element): void {
    // Placeholder for future implementation (parity with Python version).
  }

  private drawJoubi(parent: Element): void {
    [
      ["日", CalendarImage.RED],
      ["月", CalendarImage.BLACK],
      ["火", CalendarImage.BLACK],
      ["水", CalendarImage.BLACK],
      ["木", CalendarImage.BLACK],
      ["金", CalendarImage.BLACK],
      ["土", CalendarImage.BLUE],
    ].forEach(([label, color], index) => {
      const x =
        CalendarImage.WIDTH_LEFT_SPACE + CalendarImage.SIZE_DAY_SQUARE / 2 - 2 + CalendarImage.SIZE_DAY_SQUARE * index;
      this.drawText(
        parent,
        {
          fill: color,
          "font-size": CalendarImage.FONT_SIZE_SMALL,
          x: `${x}mm`,
          y: CalendarImage.HEIGHT_TOP_SPACE - 5,
        },
        label,
      );
    });
  }

  private drawStaticFrame(parent: Element): void {
    const days = ImperialYearMonthDays(this.imdt);
    for (let row = 0; row < 4; row += 1) {
      const daysOfWeek = row === 3 && days === 27 ? 6 : 7;
      const y =
        CalendarImage.HEIGHT_TOP_SPACE +
        (CalendarImage.SIZE_DAY_SQUARE + CalendarImage.HEIGHT_GRDT_BELT + CalendarImage.HEIGHT_DAYS_GAP) * row;
      this.appendElement(parent, "rect", {
        fill: CalendarImage.WHITE,
        height: `${CalendarImage.SIZE_DAY_SQUARE + CalendarImage.HEIGHT_GRDT_BELT}mm`,
        stroke: CalendarImage.BLACK,
        "stroke-width": CalendarImage.STROKE_WIDTH_BOLD,
        width: `${CalendarImage.SIZE_DAY_SQUARE * daysOfWeek}mm`,
        x: `${CalendarImage.WIDTH_LEFT_SPACE}mm`,
        y: `${y}mm`,
      });
      const lineY =
        CalendarImage.HEIGHT_TOP_SPACE +
        CalendarImage.SIZE_DAY_SQUARE +
        (CalendarImage.SIZE_DAY_SQUARE + CalendarImage.HEIGHT_GRDT_BELT + CalendarImage.HEIGHT_DAYS_GAP) * row;
      this.appendElement(parent, "line", {
        stroke: CalendarImage.BLACK,
        "stroke-width": CalendarImage.STROKE_WIDTH_THIN,
        x1: `${CalendarImage.WIDTH_LEFT_SPACE}mm`,
        x2: `${CalendarImage.WIDTH_LEFT_SPACE + CalendarImage.SIZE_DAY_SQUARE * daysOfWeek}mm`,
        y1: `${lineY}mm`,
        y2: `${lineY}mm`,
      });
      for (let col = 0; col < daysOfWeek; col += 1) {
        const x = CalendarImage.WIDTH_LEFT_SPACE + CalendarImage.SIZE_DAY_SQUARE * (col + 1);
        this.appendElement(parent, "line", {
          stroke: CalendarImage.BLACK,
          "stroke-width": CalendarImage.STROKE_WIDTH_BOLD,
          x1: `${x}mm`,
          x2: `${x}mm`,
          y1: `${y}mm`,
          y2: `${lineY}mm`,
        });
      }
    }
  }

  private drawTitle(parent: Element): void {
    this.drawText(
      parent,
      { fill: CalendarImage.BLACK, "font-size": CalendarImage.FONT_SIZE_LARGE, x: "5mm", y: 9.5 },
      "帝國火星暦",
    );
    this.drawText(
      parent,
      { fill: CalendarImage.BLACK, "font-size": CalendarImage.FONT_SIZE_LARGE, x: "11mm", y: 18.0 },
      `${this.imdt.year}年`,
    );
    const monthContainer = this.appendElement(parent, "svg", {
      height: "44mm",
      style: "background-color: transparent;",
      width: `${CalendarImage.WIDTH_LEFT_SPACE - 8}mm`,
      x: "0mm",
      y: "28mm",
    });
    this.drawText(
      monthContainer,
      {
        fill: CalendarImage.BLACK,
        "font-family": CalendarImage.FONT_FAMILY_BOLD,
        "font-size": CalendarImage.FONT_SIZE_BOLD_LARGE,
        "text-anchor": "middle",
        x: "64%",
        y: 0.0,
      },
      `${this.imdt.month}月`,
    );
    this.drawText(
      parent,
      {
        fill: CalendarImage.BLACK,
        "font-size": CalendarImage.FONT_SIZE_LARGE,
        x: "9.5mm",
        y: 42.0,
      },
      `(${this.imdt.japaneseMonthName}月)`,
    );
    this.drawText(
      parent,
      {
        fill: CalendarImage.GRAY,
        "font-size": CalendarImage.FONT_SIZE_ANNOTATION,
        x: `${CalendarImage.WIDTH_LEFT_SPACE - 5.5}mm`,
        y: 52.0,
      },
      "～",
    );
    const periodContainer = this.appendElement(parent, "svg", {
      height: "8mm",
      style: "background-color: transparent;",
      width: `${CalendarImage.WIDTH_LEFT_SPACE - 8}mm`,
      x: "2mm",
      y: "52mm",
    });
    const weekdays = ["月", "火", "水", "木", "金", "土", "日"];
    const grdtStart = imdtToGrdt(this.imdt, this.grdtTimezone);
    const grdtEnd = imdtToGrdt(this.nextImdtMonth(), this.grdtTimezone);
    const startWeekday = weekdays[grdtStart.weekday - 1];
    const endWeekday = weekdays[grdtEnd.weekday - 1];
    this.drawText(
      periodContainer,
      {
        fill: CalendarImage.GRAY,
        "font-size": CalendarImage.FONT_SIZE_ANNOTATION,
        "text-anchor": "end",
        x: "100%",
        y: 0.0,
      },
      `${grdtStart.year}/${grdtStart.month}/${grdtStart.day}(${startWeekday})${grdtStart.hour
        .toString()
        .padStart(2, "0")}:${grdtStart.minute.toString().padStart(2, "0")}:${grdtStart.second
        .toString()
        .padStart(2, "0")}`,
    );
    const endYearPrefix = grdtStart.year !== grdtEnd.year ? `${grdtEnd.year}/` : "";
    this.drawText(
      periodContainer,
      {
        fill: CalendarImage.GRAY,
        "font-size": CalendarImage.FONT_SIZE_ANNOTATION,
        "text-anchor": "end",
        x: "100%",
        y: 4.0,
      },
      `${endYearPrefix}${grdtEnd.month}/${grdtEnd.day}(${endWeekday})${grdtEnd.hour
        .toString()
        .padStart(2, "0")}:${grdtEnd.minute.toString().padStart(2, "0")}:${grdtEnd.second.toString().padStart(2, "0")}`,
    );
  }

  private nextImdtMonth(): ImperialDateTime {
    const next = new ImperialYearMonth(this.imdt.year, this.imdt.month).nextMonth();
    return new ImperialDateTime(next.year, next.month, 1, 0, 0, 0, this.imdt.timezone);
  }
}

function ImperialYearMonthDays(imdt: ImperialDateTime): number {
  return new ImperialYearMonth(imdt.year, imdt.month).days();
}

export async function drawCalendarSvg(imdt: ImperialDateTime, grdtTimezone: string): Promise<string> {
  return new CalendarImage(imdt, grdtTimezone).drawAsSvg();
}
