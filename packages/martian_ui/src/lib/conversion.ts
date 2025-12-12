import {
  GregorianDateTime,
  ImperialDateTime,
  ImperialSolNumber,
  ImperialYearMonth,
  JulianDay,
  MarsSolDate,
  TerrestrialTime,
  grdtToJuld,
  juldToGrdt,
  juldToTert,
  tertToMrls,
  imdtToImsn,
  imsnToImdt,
  tertToJuld,
  tertToMrsd,
  mrsdToTert,
  mrsdToImsn,
  imsnToMrsd,
} from "imperial_calendar";

export type ConversionResult = {
  grdt: GregorianDateTime;
  juld: JulianDay;
  deltaT: number;
  tert: TerrestrialTime;
  mrsd: MarsSolDate;
  imsn: ImperialSolNumber;
  imdt: ImperialDateTime;
  mrls: number;
};

export function convertFromGregorian(grdt: GregorianDateTime, imdtTimezone: string): ConversionResult {
  const utc = grdt.toUtcNaive();
  const juld = grdtToJuld(utc);
  const tert = juldToTert(juld);
  const mrsd = tertToMrsd(tert);
  const imsn = mrsdToImsn(mrsd);
  const imdt = ImperialDateTime.fromStandardNaive(imsnToImdt(imsn), imdtTimezone);
  return {
    grdt,
    juld,
    deltaT: juld.deltaT,
    tert,
    mrsd,
    imsn,
    imdt,
    mrls: tertToMrls(tert),
  };
}

export function convertFromImperial(imdt: ImperialDateTime, grdtTimezone: string): ConversionResult {
  const imsn = imdtToImsn(imdt.toStandardNaive());
  const mrsd = imsnToMrsd(imsn);
  const tert = mrsdToTert(mrsd);
  const juld = tertToJuld(tert);
  const grdtUtc = juldToGrdt(juld);
  const grdt = GregorianDateTime.fromUtcNaive(grdtUtc, grdtTimezone);
  return {
    grdt,
    juld,
    deltaT: juld.deltaT,
    tert,
    mrsd,
    imsn,
    imdt,
    mrls: tertToMrls(tert),
  };
}

export function toYearMonth(imdt: ImperialDateTime): ImperialYearMonth {
  return new ImperialYearMonth(imdt.year, imdt.month);
}
