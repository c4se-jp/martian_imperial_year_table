import { useEffect, useState } from "react";
import { GregorianDateTime, ImperialDateTime } from "imperial_calendar";
import { drawCalendarSvg } from "calendar_svg";
import { convertFromGregorian } from "../lib/conversion";
import { getBrowserGregorian } from "../lib/date";

type NowState = {
  grdtLocal: GregorianDateTime;
  imdt: ReturnType<typeof convertFromGregorian>["imdt"];
  grdtTimezone: string;
};

function pad(num: number, length: number): string {
  return num.toString().padStart(length, "0");
}

function formatGregorian(grdt: GregorianDateTime, label: string): string {
  return `${pad(grdt.year, 4)}-${pad(grdt.month, 2)}-${pad(grdt.day, 2)} ${pad(grdt.hour, 2)}:${pad(grdt.minute, 2)}:${pad(grdt.second, 2)} (${label})`;
}

function formatImperial(imdt: NowState["imdt"]): string {
  return `${pad(imdt.year, 4)}-${pad(imdt.month, 2)}-${pad(imdt.day, 2)} ${pad(imdt.hour, 2)}:${pad(imdt.minute, 2)}:${pad(imdt.second, 2)} (${imdt.timezone ?? "+00:00"})`;
}

function buildNowState(): NowState {
  const now = new Date();
  const utcNaive = new GregorianDateTime(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    now.getUTCMilliseconds(),
    null,
  );
  const grdtUtc = GregorianDateTime.fromUtcNaive(utcNaive, "+00:00");
  const { imdt: imdt } = convertFromGregorian(grdtUtc, "+00:00");
  const grdtLocal = getBrowserGregorian();
  const grdtTimezone = grdtLocal.timezone ?? "+00:00";
  return { grdtLocal, imdt, grdtTimezone };
}

export default function Home() {
  const [nowState, setNowState] = useState<NowState>(() => buildNowState());
  const [calendarSvg, setCalendarSvg] = useState<string>("");
  const [calendarLoading, setCalendarLoading] = useState<boolean>(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "帝國火星曆";
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowState(buildNowState());
    }, 1000 / 60);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let canceled = false;
    const loadCalendar = async () => {
      setCalendarLoading(true);
      setCalendarError(null);
      try {
        const svg = await drawCalendarSvg(nowState.imdt, nowState.grdtTimezone);
        if (!canceled) {
          setCalendarSvg(svg);
        }
      } catch (err) {
        if (!canceled) {
          setCalendarError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!canceled) {
          setCalendarLoading(false);
        }
      }
    };
    void loadCalendar();
    return () => {
      canceled = true;
    };
  }, [nowState.imdt.year, nowState.imdt.month, nowState.grdtTimezone]);

  return (
    <section className="section">
      <div className="container">
        <div className="box">
          <h2 className="title is-5">現在の日時</h2>
          <div className="content">
            <p>
              <span className="has-text-grey">グレゴリオ曆 ({nowState.grdtTimezone})</span>
              <br />
              <strong>{formatGregorian(nowState.grdtLocal, nowState.grdtTimezone)}</strong>
            </p>
            <p>
              <span className="has-text-grey">帝國火星曆 (+00:00)</span>
              <br />
              <strong>{formatImperial(nowState.imdt)}</strong>
            </p>
          </div>
        </div>
        <div className="box">
          <h2 className="title is-5">七曜表</h2>
          {calendarError && <div className="notification is-danger">{calendarError}</div>}
          {calendarLoading && <progress className="progress is-small is-primary" max="100" />}
          {!calendarLoading && calendarSvg && (
            <div className="calendar-svg-wrapper" dangerouslySetInnerHTML={{ __html: calendarSvg }} />
          )}
        </div>
      </div>
    </section>
  );
}
