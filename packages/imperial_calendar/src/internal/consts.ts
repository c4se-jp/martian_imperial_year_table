import { ImperialYear } from "./ImperialYear";
import { ImperialMonth } from "./ImperialMonth";

function cumulativeSums(values: number[]): number[] {
  const result: number[] = [];
  let total = 0;
  for (const value of values) {
    total += value;
    result.push(total);
  }
  return result;
}

const rawYearTable: number[] = [0];
for (let year = 0; year < 999; year += 1) {
  rawYearTable.push(new ImperialYear(year).days());
}

const imperialMillenniumDays = rawYearTable.reduce((sum, value) => sum + value, 0) + new ImperialYear(999).days();
const imperialYearToImsnTable = cumulativeSums(rawYearTable);

const rawMonthTable: number[] = [0];
for (let month = 1; month < 24; month += 1) {
  rawMonthTable.push(new ImperialMonth(month).days());
}
const imperialMonthToImsnTable = cumulativeSums(rawMonthTable);

export { imperialMillenniumDays, imperialYearToImsnTable, imperialMonthToImsnTable };
