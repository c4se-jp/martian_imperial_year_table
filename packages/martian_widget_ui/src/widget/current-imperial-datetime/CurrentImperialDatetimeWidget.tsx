import { useEffect, useRef, useState } from "preact/hooks";
import type { WidgetToolResult } from "../widgetTypes";
import ImperialNowCard from "./ImperialNowCard";
import {
  buildCurrentImperialDatetimeDisplayModel,
  createInitialState,
  extractCurrentImperialDatetimeResponse,
  type CurrentImperialDatetimeAppState,
} from "./model";
import { TIMEZONE_PRESETS, isTimezonePreset, validateTimezone } from "./timezone";

type Props = {
  callTool?: (name: string, args: Record<string, unknown>) => Promise<WidgetToolResult>;
  initialResult?: WidgetToolResult;
  subscribeToolResult?: (listener: (result: WidgetToolResult) => void) => void;
};

function defaultCallTool(name: string, args: Record<string, unknown>): Promise<WidgetToolResult> {
  return Promise.resolve({
    structuredContent: {
      mode: name === "get_current_imperial_datetime" ? "get_current_imperial" : "convert_gregorian_to_imperial",
      request: args,
      error: "ローカルプレビューではMCP接續の代わりにモックを返してゐます。",
    },
    isError: true,
  });
}

function isCurrentImperialToolResult(result: WidgetToolResult) {
  return result.structuredContent?.mode === undefined || result.structuredContent?.mode === "get_current_imperial";
}

export default function CurrentImperialDatetimeWidget({ callTool, initialResult, subscribeToolResult }: Props) {
  const [state, setState] = useState<CurrentImperialDatetimeAppState>(() => createInitialState(initialResult));
  const [now, setNow] = useState(() => Date.now());
  const inFlightRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);
  const aliveRef = useRef(true);
  const stateRef = useRef(state);
  const pendingTimezoneRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (initialResult === undefined) {
      return;
    }

    const response = extractCurrentImperialDatetimeResponse(initialResult);
    if (response === undefined) {
      return;
    }

    setState((current) => ({
      ...current,
      imperialNow: response,
      lastFetchedAt: new Date().toISOString(),
      status: initialResult.isError === true ? "error" : "success",
    }));
  }, [initialResult]);

  useEffect(() => {
    if (subscribeToolResult === undefined) {
      return;
    }

    subscribeToolResult((nextResult) => {
      if (!isCurrentImperialToolResult(nextResult)) {
        return;
      }

      const response = extractCurrentImperialDatetimeResponse(nextResult);
      if (response === undefined) {
        return;
      }

      setState((current) => ({
        ...current,
        imperialNow: response,
        lastFetchedAt: new Date().toISOString(),
        status: nextResult.isError === true ? "error" : "success",
        errorMessage:
          nextResult.isError === true
            ? (nextResult.structuredContent?.error ?? "現在日時を取得できませんでした。再試行してください。")
            : undefined,
        selectedTimezone: response.imperialDateTime?.timezone ?? current.selectedTimezone,
        timezoneSelection:
          response.imperialDateTime?.timezone !== undefined
            ? isTimezonePreset(response.imperialDateTime.timezone)
              ? "preset"
              : "custom"
            : current.timezoneSelection,
        customTimezoneDraft:
          response.imperialDateTime?.timezone !== undefined && !isTimezonePreset(response.imperialDateTime.timezone)
            ? response.imperialDateTime.timezone
            : current.customTimezoneDraft,
      }));
    });
  }, [subscribeToolResult]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  async function refreshCurrentImperialDatetime(nextTimezone = state.selectedTimezone) {
    if (inFlightRef.current) {
      if (pendingTimezoneRef.current !== nextTimezone) {
        pendingTimezoneRef.current = nextTimezone;
      }
      return;
    }
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }

    const timezoneError = validateTimezone(nextTimezone);
    if (timezoneError !== undefined) {
      setState((current) => ({
        ...current,
        selectedTimezone: nextTimezone,
        timezoneSelection: isTimezonePreset(nextTimezone) ? "preset" : "custom",
        customTimezoneDraft: isTimezonePreset(nextTimezone) ? current.customTimezoneDraft : nextTimezone,
        status: "error",
        errorMessage: timezoneError,
      }));
      return;
    }

    inFlightRef.current = true;
    setState((current) => ({
      ...current,
      selectedTimezone: nextTimezone,
      timezoneSelection: isTimezonePreset(nextTimezone) ? "preset" : "custom",
      customTimezoneDraft: isTimezonePreset(nextTimezone) ? current.customTimezoneDraft : nextTimezone,
      status: "loading",
      errorMessage: undefined,
    }));

    try {
      const execute = callTool ?? defaultCallTool;
      const nextResult = await execute("get_current_imperial_datetime", { timezone: nextTimezone });
      if (!aliveRef.current) {
        return;
      }

      const response = extractCurrentImperialDatetimeResponse(nextResult);
      if (nextResult.isError === true || response === undefined) {
        setState((current) => ({
          ...current,
          status: "error",
          errorMessage: nextResult.structuredContent?.error ?? "現在日時を取得できませんでした。再試行してください。",
        }));
        return;
      }

      setState((current) => ({
        ...current,
        selectedTimezone: response.imperialDateTime?.timezone ?? nextTimezone,
        timezoneSelection:
          response.imperialDateTime?.timezone !== undefined
            ? isTimezonePreset(response.imperialDateTime.timezone)
              ? "preset"
              : "custom"
            : "custom",
        customTimezoneDraft:
          response.imperialDateTime?.timezone !== undefined && !isTimezonePreset(response.imperialDateTime.timezone)
            ? response.imperialDateTime.timezone
            : current.customTimezoneDraft,
        imperialNow: response,
        lastFetchedAt: new Date().toISOString(),
        status: "success",
        errorMessage: undefined,
      }));
    } catch (error) {
      if (!aliveRef.current) {
        return;
      }

      setState((current) => ({
        ...current,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "現在日時を取得できませんでした。再試行してください。",
      }));
    } finally {
      inFlightRef.current = false;
      const latestState = stateRef.current;
      const queuedTimezone = pendingTimezoneRef.current;
      pendingTimezoneRef.current = undefined;

      if (aliveRef.current && queuedTimezone !== undefined && queuedTimezone !== nextTimezone) {
        void refreshCurrentImperialDatetime(queuedTimezone);
        return;
      }

      if (aliveRef.current && latestState.autoRefresh) {
        timerRef.current = window.setTimeout(() => {
          void refreshCurrentImperialDatetime(nextTimezone);
        }, latestState.refreshIntervalSec * 1000);
      }
    }
  }

  useEffect(() => {
    if (!state.autoRefresh) {
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
      return;
    }

    void refreshCurrentImperialDatetime(state.selectedTimezone);
  }, []);

  const displayModel = buildCurrentImperialDatetimeDisplayModel(state, now);

  return (
    <main
      style={{
        width: "100%",
        maxWidth: "960px",
        margin: "0 auto",
        padding: "18px",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          borderRadius: "28px",
          padding: "22px",
          background:
            "radial-gradient(circle at top left, rgba(251, 191, 36, 0.18), transparent 38%), linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
          boxShadow: "0 30px 60px rgba(15, 23, 42, 0.10)",
          border: "1px solid rgba(15, 23, 42, 0.10)",
        }}
      >
        <header style={{ display: "grid", gap: "8px", marginBottom: "18px" }}>
          <div style={{ fontSize: "12px", letterSpacing: "0.16em", color: "#64748b" }}>MARTIAN IMPERIAL YEAR TABLE</div>
          <h1 style={{ fontSize: "28px", lineHeight: 1.1, margin: 0 }}>現在の帝國火星曆日時</h1>
          <p style={{ margin: 0, color: "#475569", fontSize: "14px" }}>
            任意のタイムゾーンで現在時刻を取得し、帝國火星曆として表示します。
          </p>
        </header>

        <ImperialNowCard model={displayModel} />

        <section
          style={{
            display: "grid",
            gap: "14px",
            marginTop: "18px",
            padding: "16px",
            borderRadius: "22px",
            border: "1px solid rgba(15, 23, 42, 0.10)",
            background: "rgba(255, 255, 255, 0.72)",
          }}
        >
          <label style={{ display: "grid", gap: "8px", fontSize: "14px", color: "#334155" }}>
            タイムゾーン
            <select
              value={state.timezoneSelection === "custom" ? "custom" : state.selectedTimezone}
              onChange={(event) => {
                const nextValue = event.currentTarget.value;
                if (nextValue === "custom") {
                  setState((current) => ({
                    ...current,
                    timezoneSelection: "custom",
                    customTimezoneDraft: current.selectedTimezone,
                  }));
                  return;
                }

                setState((current) => ({
                  ...current,
                  selectedTimezone: nextValue,
                  timezoneSelection: "preset",
                  customTimezoneDraft: nextValue,
                }));
                void refreshCurrentImperialDatetime(nextValue);
              }}
              style={{
                appearance: "none",
                borderRadius: "14px",
                border: "1px solid rgba(148, 163, 184, 0.7)",
                background: "#fff",
                color: "#0f172a",
                padding: "10px 12px",
                fontSize: "15px",
              }}
            >
              {TIMEZONE_PRESETS.map((timezone) => (
                <option key={timezone} value={timezone}>
                  {timezone}
                </option>
              ))}
              <option value="custom">カスタム</option>
            </select>
          </label>

          {state.timezoneSelection === "custom" ? (
            <label style={{ display: "grid", gap: "8px", fontSize: "14px", color: "#334155" }}>
              カスタムタイムゾーン
              <input
                value={state.customTimezoneDraft}
                onChange={(event) => {
                  const nextValue = event.currentTarget.value;
                  setState((current) => ({
                    ...current,
                    selectedTimezone: nextValue,
                    customTimezoneDraft: nextValue,
                  }));
                }}
                placeholder="+09:00"
                style={{
                  borderRadius: "14px",
                  border: "1px solid rgba(148, 163, 184, 0.7)",
                  background: "#fff",
                  color: "#0f172a",
                  padding: "10px 12px",
                  fontSize: "15px",
                }}
              />
            </label>
          ) : null}

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => void refreshCurrentImperialDatetime(state.selectedTimezone)}
              disabled={!displayModel.canRefresh}
              style={{
                borderRadius: "999px",
                border: "none",
                background: displayModel.canRefresh ? "#0f172a" : "#94a3b8",
                color: "#fff",
                padding: "10px 16px",
                fontSize: "14px",
                cursor: displayModel.canRefresh ? "pointer" : "not-allowed",
              }}
            >
              {state.status === "loading" ? "取得中..." : "再取得"}
            </button>

            <label
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#334155" }}
            >
              <input
                type="checkbox"
                checked={state.autoRefresh}
                onChange={(event) => {
                  const enabled = event.currentTarget.checked;
                  setState((current) => ({ ...current, autoRefresh: enabled }));
                  if (enabled) {
                    void refreshCurrentImperialDatetime(state.selectedTimezone);
                    return;
                  }

                  if (timerRef.current !== undefined) {
                    window.clearTimeout(timerRef.current);
                    timerRef.current = undefined;
                  }
                }}
              />
              自動更新
            </label>

            <span style={{ fontSize: "13px", color: "#64748b" }}>更新間隔 {state.refreshIntervalSec} 秒</span>
          </div>
        </section>
      </div>
    </main>
  );
}
