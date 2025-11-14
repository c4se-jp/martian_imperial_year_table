import { describe, it, expect } from "vitest";
import { ImperialSolNumber } from "../../../ImperialSolNumber";
import { MarsSolDate } from "../../../MarsSolDate";
import { TerrestrialTime } from "../../../TerrestrialTime";
import { JulianDay } from "../../../JulianDay";
import { imsnToMrsd } from "../../../transform/imsnToMrsd";
import { mrsdToImsn } from "../../../transform/mrsdToImsn";
import { mrsdToTert } from "../../../transform/mrsdToTert";
import { tertToMrsd } from "../../../transform/tertToMrsd";
import { tertToJuld } from "../../../transform/tertToJuld";
import { juldToTert } from "../../../transform/juldToTert";
import { isClose } from "../../../utils";

describe("mrsd/tert conversions", () => {
  it("converts between imsn and mrsd", () => {
    const imsn = new ImperialSolNumber(935321, 79532.61734358966);
    const mrsd = imsnToMrsd(imsn);
    expect(isClose(mrsd.marsSolDate, 34127.295516404454, 0.00001)).toBe(true);
    const roundTrip = mrsdToImsn(mrsd);
    expect(isClose(roundTrip.imperialSolNumber, imsn.imperialSolNumber, 0.0000001)).toBe(true);
  });

  it("converts between mrsd and tert", () => {
    const mrsd = new MarsSolDate(34127.295516404454);
    const tert = mrsdToTert(mrsd);
    expect(isClose(tert.terrestrialTime, 2440587.500465196, 0.0000001)).toBe(true);
    const back = tertToMrsd(tert);
    expect(isClose(back.marsSolDate, mrsd.marsSolDate, 0.0000001)).toBe(true);
  });

  it("converts between tert and juld", () => {
    const tert = new TerrestrialTime(2440587.500465196);
    const juld = tertToJuld(tert);
    expect(juld.day).toBe(2440587);
    expect(isClose(juld.second, 43200, 0.0001)).toBe(true);
    const back = juldToTert(juld);
    expect(isClose(back.terrestrialTime, tert.terrestrialTime, 0.0000001)).toBe(true);
  });
});
