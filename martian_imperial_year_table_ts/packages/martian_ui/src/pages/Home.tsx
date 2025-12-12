import { useEffect, useMemo, useState } from "react";
import { GregorianDateTime, ImperialDateTime } from "imperial_calendar";
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

export default function HomePage() {
  const [state, setState] = useState<ConversionResult>(initialState);
  const [grdtForm, setGrdtForm] = useState<GregorianFormState>(buildGregorianForm(initialState.grdt));
  const [imdtForm, setImdtForm] = useState<ImperialFormState>(buildImperialForm(initialState.imdt));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setGrdtForm(buildGregorianForm(state.grdt));
    setImdtForm(buildImperialForm(state.imdt));
  }, [state]);

  useEffect(() => {
    document.title = "變換 | 帝國火星曆";
  }, []);

  const holidayNames = state.imdt.holiday?.names ?? [];

  const handleGrdtSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const timezone = normalizeTimezone(grdtForm.timezone);
      const grdt = new GregorianDateTime(
        parseIntField("年", grdtForm.year),
        parseIntField("月", grdtForm.month),
        parseIntField("日", grdtForm.day),
        parseIntField("時", grdtForm.hour),
        parseIntField("分", grdtForm.minute),
        parseIntField("秒", grdtForm.second),
        timezone,
      );
      const next = convertFromGregorian(grdt, imdtForm.timezone);
      setState(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleImdtSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const timezone = normalizeTimezone(imdtForm.timezone);
      const imdt = new ImperialDateTime(
        parseIntField("年", imdtForm.year),
        parseIntField("月", imdtForm.month),
        parseIntField("日", imdtForm.day),
        parseIntField("時", imdtForm.hour),
        parseIntField("分", imdtForm.minute),
        parseIntField("秒", imdtForm.second),
        timezone,
      );
      const next = convertFromImperial(imdt, grdtForm.timezone);
      setState(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
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
      { label: "Julian Day", value: (state.juld.day + state.juld.second / 86400).toFixed(5) },
      { label: "⊿t", value: `${state.deltaT.toFixed(5)} s` },
      { label: "Terrestrial Time", value: state.tert.terrestrialTime.toFixed(5) },
      { label: "Areocentric Solar Longitude (Mars Ls)", value: `${state.mrls.toFixed(5)}°` },
      { label: "Mars Sol Date", value: state.mrsd.marsSolDate.toFixed(5) },
      { label: "Imperial Sol Number", value: (state.imsn.day + state.imsn.second / 86400).toFixed(5) },
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
                      value={grdtForm[field]}
                      onChange={(event) =>
                        setGrdtForm((prev) => ({
                          ...prev,
                          [field]: event.target.value,
                        }))
                      }
                    />
                  </p>
                ))}
                <p className="control">
                  <input
                    className="input"
                    type="text"
                    value={grdtForm.timezone}
                    onChange={(event) => setGrdtForm((prev) => ({ ...prev, timezone: event.target.value }))}
                  />
                </p>
              </div>
              <button className="button is-link" type="submit">
                火星へ變換
              </button>
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
                      value={imdtForm[field]}
                      onChange={(event) =>
                        setImdtForm((prev) => ({
                          ...prev,
                          [field]: event.target.value,
                        }))
                      }
                    />
                  </p>
                ))}
                <p className="control">
                  <input
                    className="input"
                    type="text"
                    value={imdtForm.timezone}
                    onChange={(event) => setImdtForm((prev) => ({ ...prev, timezone: event.target.value }))}
                  />
                </p>
              </div>
              <button className="button is-link" type="submit">
                地球へ變換
              </button>
            </form>
          </div>
        </div>

        <div className="box">
          <h3 className="title is-5">換算結果</h3>
          <div className="columns is-multiline">
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
