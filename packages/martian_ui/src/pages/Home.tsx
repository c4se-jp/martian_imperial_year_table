import { useEffect, useState } from "react";
import { GregorianDateTime } from "imperial_calendar";
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
    null,
  );
  const grdtJst = GregorianDateTime.fromUtcNaive(utcNaive, "Asia/Tokyo");
  const grdtUtc = GregorianDateTime.fromUtcNaive(utcNaive, "+00:00");
  const { imdt: imdtUtc } = convertFromGregorian(grdtUtc, "+00:00");
  return { grdtJst, imdtUtc };
}

export default function Home() {
  const [nowState, setNowState] = useState<NowState>(() => buildNowState());

  useEffect(() => {
    document.title = "帝國火星曆";
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowState(buildNowState());
    }, 50);
    return () => window.clearInterval(timer);
  }, []);

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
      </div>
    </section>
  );
}
