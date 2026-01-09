import { isNaive } from "./types";
const NAMED_TIMEZONE_OFFSETS = {
    UTC: 0,
    "Asia/Tokyo": 9,
};
const JAPANESE_HOLIDAYS = new Set(["2020-01-01", "2020-02-23", "2020-02-24"]);
function toUtcDate(parts) {
    return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second));
}
function fromUtcDate(date) {
    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        hour: date.getUTCHours(),
        minute: date.getUTCMinutes(),
        second: date.getUTCSeconds(),
    };
}
function shiftByOffset(parts, offsetHours) {
    const date = toUtcDate(parts);
    const shifted = new Date(date.getTime() + offsetHours * 60 * 60 * 1000);
    return fromUtcDate(shifted);
}
function parseTimezone(timezone) {
    if (timezone in NAMED_TIMEZONE_OFFSETS) {
        return NAMED_TIMEZONE_OFFSETS[timezone];
    }
    const match = timezone.match(/^([+-])(\d{2}):(\d{2})$/);
    if (!match) {
        throw new Error(`Unknown timezone format: ${timezone}`);
    }
    const sign = match[1] === "-" ? -1 : 1;
    const hours = Number(match[2]);
    const minutes = Number(match[3]);
    return sign * (hours + minutes / 60);
}
export class GregorianDateTime {
    year;
    month;
    day;
    hour;
    minute;
    second;
    timezone;
    constructor(year, month, day, hour, minute, second, timezone) {
        this.year = year;
        this.month = month;
        this.day = day;
        this.hour = hour;
        this.minute = minute;
        this.second = second;
        this.timezone = timezone;
    }
    toParts() {
        return {
            year: this.year,
            month: this.month,
            day: this.day,
            hour: this.hour,
            minute: this.minute,
            second: this.second,
        };
    }
    copy() {
        return new GregorianDateTime(this.year, this.month, this.day, this.hour, this.minute, this.second, this.timezone);
    }
    static fromUtcNaive(naive, timezone) {
        if (!isNaive(naive.timezone)) {
            throw new Error(`This is not naive: ${JSON.stringify(naive)}`);
        }
        const offset = parseTimezone(timezone);
        const shifted = shiftByOffset(naive.toParts(), offset);
        return new GregorianDateTime(shifted.year, shifted.month, shifted.day, shifted.hour, shifted.minute, shifted.second, timezone);
    }
    get isHoliday() {
        const key = `${this.year.toString().padStart(4, "0")}-${this.month.toString().padStart(2, "0")}-${this.day
            .toString()
            .padStart(2, "0")}`;
        return JAPANESE_HOLIDAYS.has(key);
    }
    get weekday() {
        const date = new Date(Date.UTC(this.year, this.month - 1, this.day));
        const day = date.getUTCDay();
        return day === 0 ? 7 : day;
    }
    get offset() {
        if (isNaive(this.timezone)) {
            throw new Error(`This is naive: ${JSON.stringify(this)}`);
        }
        return parseTimezone(this.timezone);
    }
    toUtcNaive() {
        if (isNaive(this.timezone)) {
            throw new Error(`This is naive: ${JSON.stringify(this)}`);
        }
        const offset = parseTimezone(this.timezone);
        const shifted = shiftByOffset(this.toParts(), -offset);
        return new GregorianDateTime(shifted.year, shifted.month, shifted.day, shifted.hour, shifted.minute, shifted.second, null);
    }
}
