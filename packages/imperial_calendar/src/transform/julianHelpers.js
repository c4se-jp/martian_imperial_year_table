import { SECONDS_PER_DAY } from "../utils";
export function computeJulianComponents(grdt) {
    const interceptDay = 1721088;
    const interceptSecond = 0.5 * SECONDS_PER_DAY;
    const tweakedYear = grdt.month === 1 || grdt.month === 2 ? grdt.year - 1 : grdt.year;
    const tweakedMonth = grdt.month === 1 || grdt.month === 2 ? grdt.month + 12 : grdt.month;
    let day = Math.floor(tweakedYear * 365.25) +
        Math.floor(tweakedYear / 400) -
        Math.floor(tweakedYear / 100) +
        Math.floor((tweakedMonth - 2) * 30.59) +
        grdt.day +
        interceptDay;
    let second = grdt.hour * 3600 + grdt.minute * 60 + grdt.second + interceptSecond;
    if (second >= SECONDS_PER_DAY) {
        day += 1;
        second -= SECONDS_PER_DAY;
    }
    return { day, second };
}
export function computeJulianValue(grdt) {
    const { day, second } = computeJulianComponents(grdt);
    return day + second / SECONDS_PER_DAY;
}
