import { useEffect, useState } from "react";
import { GregorianDateTime, ImperialDateTime } from "imperial_calendar";
import { drawCalendarSvg } from "calendar_svg";
import { convertFromGregorian } from "../lib/conversion";

type NowState = {
  grdtJst: GregorianDateTime;
  imdtUtc: ReturnType<typeof convertFromGregorian>["imdt"];
};

function pad(num: number, length: number): string {
  return num.toString().padStart(length, "0");
}

function formatGregorian(grdt: GregorianDateTime, label: string): string {
  return `${pad(grdt.year, 4)}-${pad(grdt.month, 2)}-${pad(grdt.day, 2)} ${pad(grdt.hour, 2)}:${pad(grdt.minute, 2)}:${pad(grdt.second, 2)} (${label})`;
}

function formatImperial(imdt: NowState["imdtUtc"]): string {
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
  const grdtJst = GregorianDateTime.fromUtcNaive(utcNaive, "Asia/Tokyo");
  const grdtUtc = GregorianDateTime.fromUtcNaive(utcNaive, "+00:00");
  const { imdt: imdtUtc } = convertFromGregorian(grdtUtc, "+00:00");
  return { grdtJst, imdtUtc };
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
    }, 1000/60);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let canceled = false;
    const loadCalendar = async () => {
      setCalendarLoading(true);
      setCalendarError(null);
      try {
        const imdt = new ImperialDateTime(nowState.imdtUtc.year, nowState.imdtUtc.month, 1, 0, 0, 0, "+00:00");
        const svg = await drawCalendarSvg(imdt, "+00:00");
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
  }, [nowState.imdtUtc.year, nowState.imdtUtc.month]);

  return (
    <section className="section">
      <div className="container">
        <div className="box">
          <h2 className="title is-5">現在の日時</h2>
          <div className="content">
            <p>
              <span className="has-text-grey">グレゴリオ曆 (JST)</span>
              <br />
              <strong>{formatGregorian(nowState.grdtJst, "JST")}</strong>
            </p>
            <p>
              <span className="has-text-grey">帝國火星曆 (+00:00)</span>
              <br />
              <strong>{formatImperial(nowState.imdtUtc)}</strong>
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
