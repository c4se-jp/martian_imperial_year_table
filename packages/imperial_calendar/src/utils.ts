export const SECONDS_PER_DAY = 24 * 60 * 60;
export const MINUTES_PER_DAY = 24 * 60;

export function floorDiv(a: number, b: number): number {
  return Math.floor(a / b);
}

export function pyMod(a: number, b: number): number {
  const mod = a % b;
  return mod < 0 ? mod + Math.abs(b) : mod;
}

export function pyDivmod(a: number, b: number): [number, number] {
  const quotient = floorDiv(a, b);
  const remainder = a - quotient * b;
  return [quotient, remainder];
}

export function isClose(a: number, b: number, absTol: number): boolean {
  return Math.abs(a - b) <= absTol;
}
