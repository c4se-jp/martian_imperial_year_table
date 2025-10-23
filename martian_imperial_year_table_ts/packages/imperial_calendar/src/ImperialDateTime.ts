import { ImperialSolNumber } from "./ImperialSolNumber";
import { imdtToImsn } from "./transform/imdtToImsn";
import { deriveImperialDateTimeFields } from "./transform/imperialHelpers";
import { SECONDS_PER_DAY } from "./utils";
import { Timezone, isNaive } from "./types";
import { HolidayMars } from "./internal/HolidayMars";

const IMPERIAL_MONTH_NAMES = [
  "立春",
  "雨水",
  "啓蟄",
  "春分",
  "清明",
  "穀雨",
  "立夏",
  "小滿",
  "芒種",
  "夏至",
  "小暑",
  "大暑",
  "立秋",
  "處暑",
  "白露",
  "秋分",
  "寒露",
  "霜降",
  "立冬",
  "小雪",
  "大雪",
  "冬至",
  "小寒",
  "大寒",
];

const IMPERIAL_TIMEZONE_REGEX = /^([+-])(\d{2}):(\d{2})$/;

function parseImperialTimezone(timezone: string): number {
  const match = timezone.match(IMPERIAL_TIMEZONE_REGEX);
  if (!match) {
    throw new Error(`Unknown timezone format: ${timezone}`);
  }
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  return sign * (hours + minutes / 60);
}

export class ImperialDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  timezone: Timezone;

  constructor(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    timezone: Timezone,
  ) {
    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = hour;
    this.minute = minute;
    this.second = second;
    this.timezone = timezone;
  }

  copy(): ImperialDateTime {
    return new ImperialDateTime(
      this.year,
      this.month,
      this.day,
      this.hour,
      this.minute,
      this.second,
      this.timezone,
    );
  }

  valueOf(): number {
    const naive = isNaive(this.timezone) ? this : this.toStandardNaive();
    return (
      naive.year * 1_000_000_000_000 +
      naive.month * 10_000_000_000 +
      naive.day * 100_000_000 +
      naive.hour * 1_000_000 +
      naive.minute * 10_000 +
      naive.second
    );
  }

  static fromStandardNaive(imdt: ImperialDateTime, timezone: string): ImperialDateTime {
    if (!isNaive(imdt.timezone)) {
      throw new Error(`This is not naive: ${JSON.stringify(imdt)}`);
    }
    const offset = parseImperialTimezone(timezone);
    const imsn = imdtToImsn(imdt);
    let day = imsn.day;
    let second = imsn.second + offset * 60 * 60;
    if (second < 0) {
      day -= 1;
      second += SECONDS_PER_DAY;
    } else if (second >= SECONDS_PER_DAY) {
      day += 1;
      second -= SECONDS_PER_DAY;
    }
    const fields = deriveImperialDateTimeFields(new ImperialSolNumber(day, second));
    return new ImperialDateTime(fields.year, fields.month, fields.day, fields.hour, fields.minute, fields.second, timezone);
  }

  get holiday(): HolidayMars | null {
    const holiday = new HolidayMars(this.year, this.month, this.day);
    return holiday.isHoliday ? holiday : null;
  }

  get japaneseMonthName(): string {
    return IMPERIAL_MONTH_NAMES[this.month - 1];
  }

  get offset(): number {
    if (isNaive(this.timezone)) {
      throw new Error(`This is naive: ${JSON.stringify(this)}`);
    }
    return parseImperialTimezone(this.timezone);
  }

  toStandardNaive(): ImperialDateTime {
    if (isNaive(this.timezone)) {
      throw new Error(`This is naive: ${JSON.stringify(this)}`);
    }
    const offsetSeconds = this.offset * 60 * 60;
    const imsn = imdtToImsn(
      new ImperialDateTime(this.year, this.month, this.day, this.hour, this.minute, this.second, null),
    );
    let day = imsn.day;
    let second = imsn.second - offsetSeconds;
    if (second < 0) {
      day -= 1;
      second += SECONDS_PER_DAY;
    } else if (second >= SECONDS_PER_DAY) {
      day += 1;
      second -= SECONDS_PER_DAY;
    }
    const fields = deriveImperialDateTimeFields(new ImperialSolNumber(day, second));
    return new ImperialDateTime(fields.year, fields.month, fields.day, fields.hour, fields.minute, fields.second, null);
  }
}
