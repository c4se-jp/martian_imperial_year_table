import { useCallback, useEffect, useMemo, useState } from "react";
import { ImperialDateTime, ImperialYearMonth } from "imperial_calendar";
import { drawCalendarSvg } from "calendar_svg";
import { convertFromGregorian, toYearMonth } from "../lib/conversion";
import { getBrowserGregorian } from "../lib/date";
import { normalizeTimezone } from "../lib/time";

const initialState = convertFromGregorian(getBrowserGregorian(), "+09:00");

export default function CalendarPage() {
  const initialYm = toYearMonth(initialState.imdt);
  const [form, setForm] = useState({
    grdtTimezone: initialState.grdt.timezone ?? "+09:00",
    year: initialYm.year,
    month: initialYm.month,
  });
  const [svgMarkup, setSvgMarkup] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSvg = useCallback(async (year: number, month: number, grdtTz: string) => {
    setLoading(true);
    setError(null);
    try {
      const grdtTimezone = normalizeTimezone(grdtTz);
      const imdt = new ImperialDateTime(year, month, 1, 0, 0, 0, "+00:00");
      const svg = await drawCalendarSvg(imdt, grdtTimezone);
      setSvgMarkup(svg);
      setForm({ year, month, grdtTimezone });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "七曜表 | 帝國火星曆";
    fetchSvg(form.year, form.month, form.grdtTimezone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentYm = useMemo(() => new ImperialYearMonth(form.year, form.month), [form.year, form.month]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchSvg(form.year, form.month, form.grdtTimezone);
  };

  const handlePrev = () => {
    const prev = currentYm.prevMonth();
    fetchSvg(prev.year, prev.month, form.grdtTimezone);
  };

  const handleNext = () => {
    const next = currentYm.nextMonth();
    fetchSvg(next.year, next.month, form.grdtTimezone);
  };

  const handleSetCurrent = () => {
    const now = convertFromGregorian(getBrowserGregorian(), "+00:00");
    const ym = toYearMonth(now.imdt);
    fetchSvg(ym.year, ym.month, now.grdt.timezone ?? "+00:00");
  };

  const downloadUrl = useMemo(() => {
    if (!svgMarkup) return undefined;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
  }, [svgMarkup]);

  return (
    <section className="section">
      <div className="container">
        <form className="box" onSubmit={handleSubmit}>
          <h2 className="title is-5">帝國火星曆 七曜表</h2>
          <div className="calendar-form">
            <div className="field">
              <label className="label">年</label>
              <p className="control">
                <input
                  className="input"
                  type="number"
                  value={form.year}
                  onChange={(event) => setForm((prev) => ({ ...prev, year: Number(event.target.value) }))}
                  style={{ width: "8em" }}
                />
              </p>
            </div>
            <div className="field">
              <label className="label">月</label>
              <p className="control">
                <input
                  className="input"
                  type="number"
                  min={1}
                  max={24}
                  value={form.month}
                  onChange={(event) => setForm((prev) => ({ ...prev, month: Number(event.target.value) }))}
                  style={{ width: "5em" }}
                />
              </p>
            </div>
            <div className="field">
              <label className="label">對照するグレゴリオ曆のタイムゾーン</label>
              <p className="control">
                <input
                  className="input"
                  type="text"
                  value={form.grdtTimezone}
                  onChange={(event) => setForm((prev) => ({ ...prev, grdtTimezone: event.target.value }))}
                  style={{ width: "7em" }}
                />
              </p>
            </div>
            <p className="control calendar-form__action">
              <button className="button is-link" type="submit" disabled={loading}>
                描畫
              </button>
            </p>
            <p className="control calendar-form__action">
              <button className="button" type="button" onClick={handleSetCurrent} disabled={loading}>
                現在の月
              </button>
            </p>
          </div>
        </form>

        <div className="buttons">
          <button className="button" type="button" onClick={handlePrev} disabled={loading}>
            前の月
          </button>
          <button className="button" type="button" onClick={handleNext} disabled={loading}>
            次の月
          </button>
          {downloadUrl && (
            <a className="button is-light" href={downloadUrl} download={`calendar-${form.year}-${form.month}.svg`}>
              SVGをダウンロード
            </a>
          )}
        </div>

        {error && <div className="notification is-danger">{error}</div>}
        {loading && <progress className="progress is-small is-primary" max="100" />}
        {!loading && svgMarkup && (
          <div className="box calendar-svg-wrapper" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
        )}
      </div>
    </section>
  );
}
