import { GregorianDateTime } from "./GregorianDateTime";
import { ImperialDateTime } from "./ImperialDateTime";
import { ImperialSolNumber } from "./ImperialSolNumber";
import { ImperialYearMonth } from "./ImperialYearMonth";
import { ImperialYear } from "./internal/ImperialYear";
import { ImperialMonth } from "./internal/ImperialMonth";
import { HolidayMars, Holidays, Internal } from "./internal/HolidayMars";
import { JulianDay } from "./JulianDay";
import { MarsSolDate } from "./MarsSolDate";
import { TerrestrialTime } from "./TerrestrialTime";
import { grdtToJuld } from "./transform/grdtToJuld";
import { juldToGrdt } from "./transform/juldToGrdt";
import { juldToTert } from "./transform/juldToTert";
import { tertToMrls } from "./transform/tertToMrls";
import { tertToJuld } from "./transform/tertToJuld";
import { tertToMrsd } from "./transform/tertToMrsd";
import { mrsdToTert } from "./transform/mrsdToTert";
import { mrsdToImsn } from "./transform/mrsdToImsn";
import { imsnToMrsd } from "./transform/imsnToMrsd";
import { imdtToImsn } from "./transform/imdtToImsn";
import { imsnToImdt } from "./transform/imsnToImdt";
import { deriveImperialDateTimeFields } from "./transform/imperialHelpers";
import { computeJulianComponents, computeJulianValue } from "./transform/julianHelpers";
import { SECONDS_PER_DAY, MINUTES_PER_DAY, floorDiv, pyDivmod, pyMod, isClose } from "./utils";
import { Timezone, isNaive } from "./types";

const exportedObjects = {
  GregorianDateTime,
  ImperialDateTime,
  ImperialSolNumber,
  ImperialYearMonth,
  ImperialYear,
  ImperialMonth,
  HolidayMars,
  Holidays,
  Internal,
  JulianDay,
  MarsSolDate,
  TerrestrialTime,
  grdtToJuld,
  juldToGrdt,
  juldToTert,
  tertToMrls,
  tertToJuld,
  tertToMrsd,
  mrsdToTert,
  mrsdToImsn,
  imsnToMrsd,
  imdtToImsn,
  imsnToImdt,
  deriveImperialDateTimeFields,
  computeJulianComponents,
  computeJulianValue,
  SECONDS_PER_DAY,
  MINUTES_PER_DAY,
  floorDiv,
  pyDivmod,
  pyMod,
  isClose,
  isNaive,
};

Object.assign(globalThis as Record<string, unknown>, exportedObjects);

export {
  GregorianDateTime,
  ImperialDateTime,
  ImperialSolNumber,
  ImperialYearMonth,
  ImperialYear,
  ImperialMonth,
  HolidayMars,
  Holidays,
  Internal,
  JulianDay,
  MarsSolDate,
  TerrestrialTime,
  grdtToJuld,
  juldToGrdt,
  juldToTert,
  tertToMrls,
  tertToJuld,
  tertToMrsd,
  mrsdToTert,
  mrsdToImsn,
  imsnToMrsd,
  imdtToImsn,
  imsnToImdt,
  deriveImperialDateTimeFields,
  computeJulianComponents,
  computeJulianValue,
  SECONDS_PER_DAY,
  MINUTES_PER_DAY,
  floorDiv,
  pyDivmod,
  pyMod,
  isClose,
  isNaive,
};

export type { Timezone };

export default exportedObjects;
