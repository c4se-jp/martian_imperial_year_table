import type { ImperialDateTime } from "../ImperialDateTime";
import { ImperialSolNumber } from "../ImperialSolNumber";
import { imperialMillenniumDays, imperialMonthToImsnTable, imperialYearToImsnTable } from "../internal/consts";
import { floorDiv, pyDivmod, pyMod } from "../utils";

export type ImperialDateTimeFields = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export function toImperialSolNumber(imdt: ImperialDateTime): { day: number; second: number } {
  const millennium = floorDiv(imdt.year, 1000) * imperialMillenniumDays;
  const yearIndex = pyMod(imdt.year, 1000);
  const daysInMillennium = imperialYearToImsnTable[yearIndex];
  const daysInYear = imperialMonthToImsnTable[imdt.month - 1];
  const day = millennium + daysInMillennium + daysInYear + (imdt.day - 1);
  const second = imdt.hour * 3600 + imdt.minute * 60 + imdt.second;
  return { day, second };
}

export function deriveImperialDateTimeFields(imsn: ImperialSolNumber): ImperialDateTimeFields {
  let [millennium, daysInMillennium] = pyDivmod(imsn.day, imperialMillenniumDays);
  if (daysInMillennium < 0) {
    millennium -= 1;
    daysInMillennium += imperialMillenniumDays;
  }

  let yearsInMillennium = 0;
  while (
    yearsInMillennium + 1 < imperialYearToImsnTable.length &&
    imperialYearToImsnTable[yearsInMillennium + 1] <= daysInMillennium
  ) {
    yearsInMillennium += 1;
  }

  const daysBeforeNewYear = imperialYearToImsnTable[yearsInMillennium];
  const daysInYear = daysInMillennium - daysBeforeNewYear;

  let month = 1;
  while (month < imperialMonthToImsnTable.length && imperialMonthToImsnTable[month] <= daysInYear) {
    month += 1;
  }

  const daysBeforeMonth = imperialMonthToImsnTable[month - 1];
  const day = daysInYear - daysBeforeMonth + 1;

  const roundedSecond = Math.round(imsn.second);
  let [hour, remaining] = pyDivmod(roundedSecond, 3600);
  if (hour >= 24) {
    hour -= 24;
  }
  const [minute, second] = pyDivmod(remaining, 60);

  return {
    year: millennium * 1000 + yearsInMillennium,
    month,
    day,
    hour,
    minute,
    second,
  };
}

export function fromImperialDateTime(imdt: ImperialDateTime): ImperialSolNumber {
  const { day, second } = toImperialSolNumber(imdt);
  return new ImperialSolNumber(day, second);
}
