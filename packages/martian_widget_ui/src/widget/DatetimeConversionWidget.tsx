import { useEffect, useState } from "preact/hooks";
import "@openai/apps-sdk-ui/css";
import Grdt2ImdtTab from "./tabs/Grdt2ImdtTab";
import Imdt2GrdtTab from "./tabs/Imdt2GrdtTab";
import ToolResultAlert from "./ToolResultAlert";
import { modeFromToolName, type WidgetToolResult } from "./widgetTypes";

type Props = {
  callTool?: (name: string, args: Record<string, unknown>) => Promise<WidgetToolResult>;
  initialResult?: WidgetToolResult;
  subscribeToolResult?: (listener: (result: WidgetToolResult) => void) => void;
};

function defaultCallTool(name: string, args: Record<string, unknown>): Promise<WidgetToolResult> {
  return Promise.resolve({
    structuredContent: {
      mode: modeFromToolName(name),
      request: args,
      error: "ローカルプレビューではMCP接續の代わりにモックを返してゐます。",
    },
    isError: true,
  });
}

function splitResults(initialResult?: WidgetToolResult) {
  return {
    gregorianToImperial:
      initialResult?.structuredContent?.mode === "convert_gregorian_to_imperial" ? initialResult : undefined,
    imperialToGregorian:
      initialResult?.structuredContent?.mode === "convert_imperial_to_gregorian" ? initialResult : undefined,
  };
}

export default function DatetimeConversionWidget({ callTool, initialResult, subscribeToolResult }: Props) {
  const [gregorianDateTime, setGregorianDateTime] = useState("2026-01-01T00:00:00+09:00");
  const [imperialTimezone, setImperialTimezone] = useState("+00:00");
  const [imperialDateTimeFormatted, setImperialDateTimeFormatted] = useState("1428-01-01T00:00:00+00:00");
  const [gregorianTimezone, setGregorianTimezone] = useState("+09:00");
  const [runningToolName, setRunningToolName] = useState<string | undefined>(undefined);
  const [results, setResults] = useState(splitResults(initialResult));

  function applyResult(nextResult: WidgetToolResult, mode = nextResult.structuredContent?.mode) {
    if (mode === "convert_gregorian_to_imperial") {
      setResults((current) => ({ ...current, gregorianToImperial: nextResult }));
      const imperialResult = nextResult.structuredContent?.response?.imperialDateTimeFormatted;
      if (typeof imperialResult === "string") {
        setImperialDateTimeFormatted(imperialResult);
      }
      return;
    }
    if (mode === "convert_imperial_to_gregorian") {
      setResults((current) => ({ ...current, imperialToGregorian: nextResult }));
      const gregorianResult = nextResult.structuredContent?.response?.gregorianDateTime;
      if (typeof gregorianResult === "string") {
        setGregorianDateTime(gregorianResult);
      }
    }
  }

  useEffect(() => {
    setResults(splitResults(initialResult));
    if (initialResult !== undefined) {
      applyResult(initialResult, initialResult.structuredContent?.mode);
    }
  }, [initialResult]);

  useEffect(() => {
    if (subscribeToolResult === undefined) {
      return;
    }
    subscribeToolResult((nextResult) => {
      applyResult(nextResult, nextResult.structuredContent?.mode);
    });
  }, [subscribeToolResult]);

  async function runTool(name: string, args: Record<string, unknown>) {
    setRunningToolName(name);
    try {
      const execute = callTool ?? defaultCallTool;
      const next = await execute(name, args);
      applyResult(next, next.structuredContent?.mode ?? modeFromToolName(name));
    } catch (error) {
      const failedResult: WidgetToolResult = {
        structuredContent: {
          mode: modeFromToolName(name),
          request: args,
          error: error instanceof Error ? error.message : String(error),
        },
        isError: true,
      };
      if (name === "convert_gregorian_to_imperial_datetime") {
        setResults((current) => ({ ...current, gregorianToImperial: failedResult }));
      } else {
        setResults((current) => ({ ...current, imperialToGregorian: failedResult }));
      }
    } finally {
      setRunningToolName(undefined);
    }
  }

  return (
    <main className="mx-auto w-full max-w-full rounded-2xl border border-default bg-surface p-4">
      <h1 className="heading-md">帝國火星曆日時變換</h1>
      <p className="text-sm text-secondary">グレゴリオ曆日時と帝國火星曆日時を相互に變換します。</p>

      <section className="mt-4">
        <Grdt2ImdtTab
          gregorianDateTime={gregorianDateTime}
          imperialTimezone={imperialTimezone}
          onConvert={() => runTool("convert_gregorian_to_imperial_datetime", { gregorianDateTime, imperialTimezone })}
          onGregorianDateTimeChange={setGregorianDateTime}
          onImperialTimezoneChange={setImperialTimezone}
          running={runningToolName === "convert_gregorian_to_imperial_datetime"}
        />
      </section>

      <section className="mt-6">
        <Imdt2GrdtTab
          gregorianTimezone={gregorianTimezone}
          imperialDateTimeFormatted={imperialDateTimeFormatted}
          onConvert={() =>
            runTool("convert_imperial_to_gregorian_datetime", { imperialDateTimeFormatted, gregorianTimezone })
          }
          onGregorianTimezoneChange={setGregorianTimezone}
          onImperialDateTimeFormattedChange={setImperialDateTimeFormatted}
          running={runningToolName === "convert_imperial_to_gregorian_datetime"}
        />
      </section>

      {results.gregorianToImperial?.structuredContent?.error !== undefined ? (
        <div className="mt-4">
          <ToolResultAlert
            emptyMessage=""
            formatResult={(result) => result.structuredContent?.error}
            result={results.gregorianToImperial}
          />
        </div>
      ) : null}

      {results.imperialToGregorian?.structuredContent?.error !== undefined ? (
        <div className="mt-4">
          <ToolResultAlert
            emptyMessage=""
            formatResult={(result) => result.structuredContent?.error}
            result={results.imperialToGregorian}
          />
        </div>
      ) : null}
    </main>
  );
}
