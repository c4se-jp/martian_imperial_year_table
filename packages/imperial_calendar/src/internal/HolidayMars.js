import { ImperialYearMonth } from "../ImperialYearMonth";
class Internal {
    name;
    constructor(name) {
        this.name = name;
    }
}
function cloneHolidays(source) {
    const clone = {};
    for (const [yearKey, months] of Object.entries(source)) {
        const year = Number(yearKey);
        clone[year] = {};
        for (const [monthKey, days] of Object.entries(months)) {
            const month = Number(monthKey);
            clone[year][month] = {};
            for (const [dayKey, entry] of Object.entries(days)) {
                const day = Number(dayKey);
                if (Array.isArray(entry)) {
                    clone[year][month][day] = entry.map((internal) => new Internal(internal.name));
                }
                else {
                    clone[year][month][day] = new Internal(entry.name);
                }
            }
        }
    }
    return clone;
}
const DEFAULT_HOLIDAYS = {
    1425: {
        1: {
            1: new Internal("四方節"),
            2: new Internal("振替休日"),
            3: new Internal("元始祭"),
            15: new Internal("元宵節"),
            16: new Internal("振替休日"),
        },
        3: { 15: new Internal("春季皇靈祭"), 16: new Internal("振替休日") },
        5: { 17: new Internal("神武天皇祭") },
        6: { 4: new Internal("紀元節") },
        10: { 13: new Internal("夏至祭") },
        12: { 26: new Internal("大祓前日"), 27: new Internal("夏越大祓") },
        13: { 1: new Internal("裏元日"), 2: new Internal("振替休日") },
        16: { 25: new Internal("秋季皇靈祭") },
        17: { 19: new Internal("天長節") },
        18: { 2: new Internal("地久節") },
        20: { 16: new Internal("神嘗祭") },
        22: { 1: new Internal("新嘗祭"), 2: new Internal("振替休日") },
        24: {
            26: new Internal("大祓前々日"),
            27: new Internal("大祓前日"),
            28: new Internal("年越大祓"),
        },
    },
    1426: {
        1: {
            1: new Internal("四方節"),
            2: new Internal("振替休日"),
            3: new Internal("元始祭"),
            15: new Internal("元宵節"),
            16: new Internal("振替休日"),
        },
        3: { 14: new Internal("春季皇靈祭"), 16: new Internal("振替休日") },
        5: { 17: new Internal("神武天皇祭") },
        6: { 4: new Internal("紀元節") },
        10: { 13: new Internal("夏至祭") },
        12: { 26: new Internal("大祓前日"), 27: new Internal("夏越大祓") },
        13: { 1: new Internal("裏元日"), 2: new Internal("振替休日") },
        16: { 24: new Internal("秋季皇靈祭") },
        17: { 19: new Internal("天長節") },
        18: { 2: new Internal("地久節") },
        20: { 16: new Internal("神嘗祭") },
        22: { 1: new Internal("新嘗祭"), 2: new Internal("振替休日") },
        24: {
            25: new Internal("大祓前々日"),
            26: new Internal("大祓前日"),
            27: new Internal("年越大祓"),
        },
    },
    1427: {
        1: {
            1: new Internal("四方節"),
            2: new Internal("振替休日"),
            3: new Internal("元始祭"),
            15: new Internal("元宵節"),
            16: new Internal("振替休日"),
        },
        3: { 14: new Internal("春季皇靈祭"), 16: new Internal("振替休日") },
        5: { 17: new Internal("神武天皇祭") },
        6: { 4: new Internal("紀元節") },
        10: { 13: new Internal("夏至祭") },
        12: { 26: new Internal("大祓前日"), 27: new Internal("夏越大祓") },
        13: { 1: new Internal("裏元日"), 2: new Internal("振替休日") },
        16: { 24: new Internal("秋季皇靈祭") },
        17: { 19: new Internal("天長節") },
        18: { 2: new Internal("地久節") },
        20: { 16: new Internal("神嘗祭") },
        22: { 1: new Internal("新嘗祭"), 2: new Internal("振替休日") },
        24: {
            26: new Internal("大祓前々日"),
            27: new Internal("大祓前日"),
            28: new Internal("年越大祓"),
        },
    },
};
class Holidays {
    static holidays = cloneHolidays(DEFAULT_HOLIDAYS);
    static setUpForTest(holidays) {
        this.holidays = cloneHolidays(holidays);
    }
    static tearDownForTest() {
        this.holidays = cloneHolidays(DEFAULT_HOLIDAYS);
    }
}
class HolidayMars {
    year;
    month;
    day;
    internals;
    constructor(year, month, day) {
        this.year = year;
        this.month = month;
        this.day = day;
        this.internals = [];
        const yearData = Holidays.holidays[year];
        if (yearData) {
            const monthData = yearData[month];
            if (monthData) {
                const dayData = monthData[day];
                if (dayData) {
                    this.internals = Array.isArray(dayData) ? dayData.slice() : [dayData];
                }
            }
        }
    }
    static between(lhs, rhs) {
        if (lhs.valueOf() > rhs.valueOf()) {
            return [];
        }
        const years = Object.keys(Holidays.holidays)
            .map(Number)
            .sort((a, b) => a - b);
        if (years.length === 0) {
            return [];
        }
        const minYear = years[0];
        const maxYear = years[years.length - 1];
        const startYear = Math.max(lhs.year, minYear);
        const endYear = Math.min(rhs.year, maxYear);
        const holidays = [];
        for (let year = startYear; year <= endYear; year += 1) {
            const yearData = Holidays.holidays[year];
            if (!yearData)
                continue;
            const monthStart = year === lhs.year ? lhs.month : 1;
            const monthEnd = year === rhs.year ? rhs.month : 24;
            for (let month = monthStart; month <= monthEnd; month += 1) {
                const monthData = yearData[month];
                if (!monthData)
                    continue;
                const startDay = year === lhs.year && month === lhs.month ? lhs.day : 1;
                const endDay = year === rhs.year && month === rhs.month ? rhs.day : new ImperialYearMonth(year, month).days();
                const days = Object.keys(monthData)
                    .map(Number)
                    .sort((a, b) => a - b);
                for (const day of days) {
                    if (day >= startDay && day <= endDay) {
                        holidays.push(new HolidayMars(year, month, day));
                    }
                }
            }
        }
        return holidays;
    }
    valueOf() {
        return this.year * 10000 + this.month * 100 + this.day;
    }
    get isHoliday() {
        return this.internals.length > 0;
    }
    get names() {
        return this.internals.map((internal) => internal.name);
    }
}
export { Internal, Holidays, HolidayMars, DEFAULT_HOLIDAYS };
