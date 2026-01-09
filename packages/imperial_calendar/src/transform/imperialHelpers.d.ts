import type { ImperialDateTime } from "../ImperialDateTime";
import { ImperialSolNumber } from "../ImperialSolNumber";
export type ImperialDateTimeFields = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};
export declare function toImperialSolNumber(imdt: ImperialDateTime): {
  day: number;
  second: number;
};
export declare function deriveImperialDateTimeFields(imsn: ImperialSolNumber): ImperialDateTimeFields;
export declare function fromImperialDateTime(imdt: ImperialDateTime): ImperialSolNumber;
