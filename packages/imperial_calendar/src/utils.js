export const SECONDS_PER_DAY = 24 * 60 * 60;
export const MINUTES_PER_DAY = 24 * 60;
export function floorDiv(a, b) {
    return Math.floor(a / b);
}
export function pyMod(a, b) {
    const mod = a % b;
    return mod < 0 ? mod + Math.abs(b) : mod;
}
export function pyDivmod(a, b) {
    const quotient = floorDiv(a, b);
    const remainder = a - quotient * b;
    return [quotient, remainder];
}
export function isClose(a, b, absTol) {
    return Math.abs(a - b) <= absTol;
}
