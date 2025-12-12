import { useEffect, useMemo, useState } from "react";
import {
  GregorianDateTime,
  ImperialDateTime,
  ImperialSolNumber,
  JulianDay,
  MarsSolDate,
  TerrestrialTime,
  imsnToImdt,
  imsnToMrsd,
  juldToGrdt,
  juldToTert,
  mrsdToImsn,
  mrsdToTert,
  tertToJuld,
  tertToMrls,
  tertToMrsd,
} from "imperial_calendar";
import { ConversionResult, convertFromGregorian, convertFromImperial } from "../lib/conversion";
import { getBrowserGregorian } from "../lib/date";
import { normalizeTimezone } from "../lib/time";

const initialGrdt = getBrowserGregorian();
const initialState = convertFromGregorian(initialGrdt, "+00:00");

type GregorianFormState = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
  timezone: string;
};

type ImperialFormState = GregorianFormState;

type DerivedFormState = {
  juld: string;
  tert: string;
  mrsd: string;
  imsn: string;
};

function buildGregorianForm(grdt: GregorianDateTime): GregorianFormState {
  return {
    year: grdt.year.toString(),
    month: grdt.month.toString().padStart(2, "0"),
    day: grdt.day.toString().padStart(2, "0"),
    hour: grdt.hour.toString().padStart(2, "0"),
    minute: grdt.minute.toString().padStart(2, "0"),
    second: grdt.second.toString().padStart(2, "0"),
    timezone: grdt.timezone ?? "+00:00",
  };
}

function buildImperialForm(imdt: ImperialDateTime): ImperialFormState {
  return {
    year: imdt.year.toString(),
    month: imdt.month.toString().padStart(2, "0"),
    day: imdt.day.toString().padStart(2, "0"),
    hour: imdt.hour.toString().padStart(2, "0"),
    minute: imdt.minute.toString().padStart(2, "0"),
    second: imdt.second.toString().padStart(2, "0"),
    timezone: imdt.timezone ?? "+00:00",
  };
}

function parseIntField(label: string, value: string): number {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new Error(`${label} を正しく入力してください`);
  }
  return Math.trunc(num);
}

function parseNumberField(label: string, value: string): number {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new Error(`${label} を正しく入力してください`);
  }
  return num;
}

function formatJulianDayValue(juld: ConversionResult["juld"]): string {
  return (juld.day + juld.second / 86400).toFixed(5);
}

function formatImsnValue(imsn: ConversionResult["imsn"]): string {
  return (imsn.day + imsn.second / 86400).toFixed(5);
}

function pad(num: number, length: number): string {
  return num.toString().padStart(length, "0");
}

function formatIsoGregorian(grdt: GregorianDateTime): string {
  const tz = grdt.timezone ?? "+00:00";
  return `${pad(grdt.year, 4)}-${pad(grdt.month, 2)}-${pad(grdt.day, 2)}T${pad(grdt.hour, 2)}:${pad(grdt.minute, 2)}:${pad(grdt.second, 2)}${tz}`;
}

function formatIsoImperial(imdt: ImperialDateTime): string {
  const tz = imdt.timezone ?? "+00:00";
  return `${pad(imdt.year, 4)}-${pad(imdt.month, 2)}-${pad(imdt.day, 2)}T${pad(imdt.hour, 2)}:${pad(imdt.minute, 2)}:${pad(imdt.second, 2)}${tz}`;
}

export default function HomePage() {
  const [state, setState] = useState<ConversionResult>(initialState);
  const [grdtForm, setGrdtForm] = useState<GregorianFormState>(buildGregorianForm(initialState.grdt));
  const [imdtForm, setImdtForm] = useState<ImperialFormState>(buildImperialForm(initialState.imdt));
  const [derivedForm, setDerivedForm] = useState<DerivedFormState>({
    juld: formatJulianDayValue(initialState.juld),
    tert: initialState.tert.terrestrialTime.toFixed(5),
    mrsd: initialState.mrsd.marsSolDate.toFixed(5),
    imsn: formatImsnValue(initialState.imsn),
  });
  const [error, setError] = useState<string | null>(null);

  const convertGrdtForm = (form: GregorianFormState) => {
    try {
      const timezone = normalizeTimezone(form.timezone);
      const grdt = new GregorianDateTime(
        parseIntField("年", form.year),
        parseIntField("月", form.month),
        parseIntField("日", form.day),
        parseIntField("時", form.hour),
        parseIntField("分", form.minute),
        parseIntField("秒", form.second),
        timezone,
      );
      const next = convertFromGregorian(grdt, imdtForm.timezone);
      setState(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const convertImdtForm = (form: ImperialFormState) => {
    try {
      const timezone = normalizeTimezone(form.timezone);
      const imdt = new ImperialDateTime(
        parseIntField("年", form.year),
        parseIntField("月", form.month),
        parseIntField("日", form.day),
        parseIntField("時", form.hour),
        parseIntField("分", form.minute),
        parseIntField("秒", form.second),
        timezone,
      );
      const next = convertFromImperial(imdt, grdtForm.timezone);
      setState(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const applyStateFromDerived = (kind: keyof DerivedFormState, rawValue: string) => {
    const labels: Record<keyof DerivedFormState, string> = {
      juld: "Julian Day",
      tert: "Terrestrial Time",
      mrsd: "Mars Sol Date",
      imsn: "Imperial Sol Number",
    };
    try {
      const value = parseNumberField(labels[kind], rawValue);
      let juld: JulianDay;
      let tert: TerrestrialTime;
      let mrsd: MarsSolDate;
      let imsn: ImperialSolNumber;

      if (kind === "juld") {
        juld = new JulianDay(value);
        tert = juldToTert(juld);
        mrsd = tertToMrsd(tert);
        imsn = mrsdToImsn(mrsd);
      } else if (kind === "tert") {
        tert = new TerrestrialTime(value);
        juld = tertToJuld(tert);
        mrsd = tertToMrsd(tert);
        imsn = mrsdToImsn(mrsd);
      } else if (kind === "mrsd") {
        mrsd = new MarsSolDate(value);
        tert = mrsdToTert(mrsd);
        juld = tertToJuld(tert);
        imsn = mrsdToImsn(mrsd);
      } else {
        imsn = new ImperialSolNumber(value);
        mrsd = imsnToMrsd(imsn);
        tert = mrsdToTert(mrsd);
        juld = tertToJuld(tert);
      }

      const imdt = ImperialDateTime.fromStandardNaive(imsnToImdt(imsn), imdtForm.timezone);
      const grdtUtc = juldToGrdt(juld);
      const grdt = GregorianDateTime.fromUtcNaive(grdtUtc, grdtForm.timezone);

      setState({
        grdt,
        juld,
        deltaT: juld.deltaT,
        tert,
        mrsd,
        imsn,
        imdt,
        mrls: tertToMrls(tert),
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  useEffect(() => {
    setGrdtForm(buildGregorianForm(state.grdt));
    setImdtForm(buildImperialForm(state.imdt));
    setDerivedForm({
      juld: formatJulianDayValue(state.juld),
      tert: state.tert.terrestrialTime.toFixed(5),
      mrsd: state.mrsd.marsSolDate.toFixed(5),
      imsn: formatImsnValue(state.imsn),
    });
  }, [state]);

  useEffect(() => {
    document.title = "變換 | 帝國火星曆";
  }, []);

  const holidayNames = state.imdt.holiday?.names ?? [];

  const handleGrdtSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    convertGrdtForm(grdtForm);
  };

  const handleImdtSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    convertImdtForm(imdtForm);
  };

  const handleSetNow = () => {
    try {
      const grdt = getBrowserGregorian();
      setState(convertFromGregorian(grdt, imdtForm.timezone));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const derivedValues = useMemo(
    () => [
      { label: "⊿t", value: `${state.deltaT.toFixed(5)} s` },
      { label: "Areocentric Solar Longitude (Mars Ls)", value: `${state.mrls.toFixed(5)}°` },
    ],
    [state],
  );

  return (
    <section className="section">
      <div className="container">
        <div className="box">
          <div className="level">
            <div className="level-left">
              <div>
                <p className="heading">現在の帝國火星曆</p>
                <p className="title is-4">{`${state.imdt.year}年 ${state.imdt.month}月 ${state.imdt.day}日 ${state.imdt.hour.toString().padStart(2, "0")}:${state.imdt.minute.toString().padStart(2, "0")}:${state.imdt.second.toString().padStart(2, "0")} (${state.imdt.timezone ?? "+00:00"})`}</p>
                {holidayNames.length > 0 && <p className="tag is-danger is-light">{holidayNames.join("・")}</p>}
              </div>
            </div>
            <div className="level-right">
              <button className="button is-dark" onClick={handleSetNow} type="button">
                現在日時
              </button>
            </div>
          </div>
        </div>

        {error && <div className="notification is-danger">{error}</div>}

        <div className="columns">
          <div className="column">
            <form className="box" onSubmit={handleGrdtSubmit}>
              <h2 className="title is-5">地球 (Gregorian Date Time)</h2>
              <div className="field is-grouped is-grouped-multiline">
                {(["year", "month", "day", "hour", "minute", "second"] as const).map((field) => (
                  <p className="control" key={field}>
                    <input
                      className="input"
                      type="number"
                      placeholder={
                        field === "year"
                          ? "年"
                          : field === "month"
                            ? "月"
                            : field === "day"
                              ? "日"
                              : field === "hour"
                                ? "時"
                                : field === "minute"
                                  ? "分"
                                  : "秒"
                      }
                      value={grdtForm[field]}
                      onChange={(event) =>
                        setGrdtForm((prev) => ({
                          ...prev,
                          [field]: event.target.value,
                        }))
                      }
                      onBlur={(event) => {
                        const next = { ...grdtForm, [field]: event.target.value };
                        setGrdtForm(next);
                        convertGrdtForm(next);
                      }}
                    />
                  </p>
                ))}
                <p className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="タイムゾーン"
                    value={grdtForm.timezone}
                    onChange={(event) => setGrdtForm((prev) => ({ ...prev, timezone: event.target.value }))}
                    onBlur={(event) => {
                      const next = { ...grdtForm, timezone: event.target.value };
                      setGrdtForm(next);
                      convertGrdtForm(next);
                    }}
                  />
                </p>
              </div>
              <p className="is-size-7">
                <code>{formatIsoGregorian(state.grdt)}</code>
              </p>
            </form>
          </div>
          <div className="column">
            <form className="box" onSubmit={handleImdtSubmit}>
              <h2 className="title is-5">帝國火星曆</h2>
              <div className="field is-grouped is-grouped-multiline">
                {(["year", "month", "day", "hour", "minute", "second"] as const).map((field) => (
                  <p className="control" key={field}>
                    <input
                      className="input"
                      type="number"
                      placeholder={
                        field === "year"
                          ? "年"
                          : field === "month"
                            ? "月"
                            : field === "day"
                              ? "日"
                              : field === "hour"
                                ? "時"
                                : field === "minute"
                                  ? "分"
                                  : "秒"
                      }
                      value={imdtForm[field]}
                      onChange={(event) =>
                        setImdtForm((prev) => ({
                          ...prev,
                          [field]: event.target.value,
                        }))
                      }
                      onBlur={(event) => {
                        const next = { ...imdtForm, [field]: event.target.value };
                        setImdtForm(next);
                        convertImdtForm(next);
                      }}
                    />
                  </p>
                ))}
                <p className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="タイムゾーン"
                    value={imdtForm.timezone}
                    onChange={(event) => setImdtForm((prev) => ({ ...prev, timezone: event.target.value }))}
                    onBlur={(event) => {
                      const next = { ...imdtForm, timezone: event.target.value };
                      setImdtForm(next);
                      convertImdtForm(next);
                    }}
                  />
                </p>
              </div>
              <p className="is-size-7">
                <code>{formatIsoImperial(state.imdt)}</code>
              </p>
            </form>
          </div>
        </div>

        <div className="box">
          <h3 className="title is-5">換算結果</h3>
          <div className="columns is-multiline">
            <div className="column is-half">
              <p className="heading">Julian Day</p>
              <input
                className="input"
                type="number"
                value={derivedForm.juld}
                onChange={(event) => setDerivedForm((prev) => ({ ...prev, juld: event.target.value }))}
                onBlur={(event) => applyStateFromDerived("juld", event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyStateFromDerived("juld", (event.target as HTMLInputElement).value);
                  }
                }}
              />
            </div>
            <div className="column is-half">
              <p className="heading">Terrestrial Time</p>
              <input
                className="input"
                type="number"
                value={derivedForm.tert}
                onChange={(event) => setDerivedForm((prev) => ({ ...prev, tert: event.target.value }))}
                onBlur={(event) => applyStateFromDerived("tert", event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyStateFromDerived("tert", (event.target as HTMLInputElement).value);
                  }
                }}
              />
            </div>
            <div className="column is-half">
              <p className="heading">Mars Sol Date</p>
              <input
                className="input"
                type="number"
                value={derivedForm.mrsd}
                onChange={(event) => setDerivedForm((prev) => ({ ...prev, mrsd: event.target.value }))}
                onBlur={(event) => applyStateFromDerived("mrsd", event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyStateFromDerived("mrsd", (event.target as HTMLInputElement).value);
                  }
                }}
              />
            </div>
            <div className="column is-half">
              <p className="heading">Imperial Sol Number</p>
              <input
                className="input"
                type="number"
                value={derivedForm.imsn}
                onChange={(event) => setDerivedForm((prev) => ({ ...prev, imsn: event.target.value }))}
                onBlur={(event) => applyStateFromDerived("imsn", event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyStateFromDerived("imsn", (event.target as HTMLInputElement).value);
                  }
                }}
              />
            </div>
            {derivedValues.map((entry) => (
              <div className="column is-half" key={entry.label}>
                <p className="heading">{entry.label}</p>
                <p className="title is-6">{entry.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
