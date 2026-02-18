import { useEffect, useMemo, useState } from "react";
import { Alert } from "@openai/apps-sdk-ui/components/Alert";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import "@openai/apps-sdk-ui/css";
import Grdt2ImdtTab from "./tabs/Grdt2ImdtTab";
import NowTab from "./tabs/NowTab";
import Imdt2GrdtTab from "./tabs/Imdt2GrdtTab";

export type ToolMode = "convert_gregorian_to_imperial" | "get_current_imperial" | "convert_imperial_to_gregorian";

export type WidgetStructuredContent = {
  error?: string;
  mode: ToolMode;
  request: Record<string, unknown>;
  response?: Record<string, unknown>;
};

export type WidgetToolResult = {
  content?: Array<{ type: string; text?: string }>;
  isError?: boolean;
  structuredContent?: WidgetStructuredContent;
};

type TabId = "grdt2imdt" | "now" | "imdt2grdt";

type Props = {
  callTool?: (name: string, args: Record<string, unknown>) => Promise<WidgetToolResult>;
  initialResult?: WidgetToolResult;
  subscribeToolResult?: (listener: (result: WidgetToolResult) => void) => void;
};

function defaultCallTool(name: string, args: Record<string, unknown>): Promise<WidgetToolResult> {
  return Promise.resolve({
    structuredContent: {
      mode:
        name === "convert_gregorian_to_imperial_datetime"
          ? "convert_gregorian_to_imperial"
          : name === "get_current_imperial_datetime"
            ? "get_current_imperial"
            : "convert_imperial_to_gregorian",
      request: args,
      error: "ローカルプレビューではMCP接続の代わりにモックを返しています。",
    },
    isError: true,
  });
}

export default function MartianDatetimeWidget({ callTool, initialResult, subscribeToolResult }: Props) {
  const [tab, setTab] = useState<TabId>("now");
  const [result, setResult] = useState<WidgetToolResult | undefined>(initialResult);
  const [running, setRunning] = useState(false);

  const [gregorianDateTime, setGregorianDateTime] = useState("2026-01-01T00:00:00+09:00");
  const [imperialTimezone, setImperialTimezone] = useState("+00:00");
  const [currentTimezone, setCurrentTimezone] = useState("+00:00");
  const [imperialDateTimeFormatted, setImperialDateTimeFormatted] = useState("1428-01-01T00:00:00+00:00");
  const [gregorianTimezone, setGregorianTimezone] = useState("+09:00");

  const outputText = useMemo(() => {
    if (result?.structuredContent !== undefined) {
      return JSON.stringify(result.structuredContent, null, 2);
    }
    const text = result?.content?.find((item) => item.type === "text")?.text;
    if (text !== undefined) {
      return text;
    }
    return "呼び出し結果がここに表示されます。";
  }, [result]);

  const isError = Boolean(result?.isError || result?.structuredContent?.error);

  useEffect(() => {
    if (subscribeToolResult === undefined) {
      return;
    }
    subscribeToolResult((nextResult) => setResult(nextResult));
  }, [subscribeToolResult]);

  async function runTool(name: string, args: Record<string, unknown>) {
    setRunning(true);
    try {
      const execute = callTool ?? defaultCallTool;
      const next = await execute(name, args);
      setResult(next);
    } catch (error) {
      setResult({
        structuredContent: {
          mode: "get_current_imperial",
          request: args,
          error: error instanceof Error ? error.message : String(error),
        },
        isError: true,
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-full rounded-2xl border border-default bg-surface p-4">
      <h1 className="heading-md">帝國火星曆</h1>
      <p className="text-sm text-secondary">火星曆と地球曆を相互に變換できます。</p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Button
          block
          color={tab === "grdt2imdt" ? "primary" : "secondary"}
          onClick={() => setTab("grdt2imdt")}
          size="sm"
          variant={tab === "grdt2imdt" ? "solid" : "soft"}
        >
          地球曆 → 火星曆
        </Button>
        <Button
          block
          color={tab === "now" ? "primary" : "secondary"}
          onClick={() => setTab("now")}
          size="sm"
          variant={tab === "now" ? "solid" : "soft"}
        >
          現在時刻
        </Button>
        <Button
          block
          color={tab === "imdt2grdt" ? "primary" : "secondary"}
          onClick={() => setTab("imdt2grdt")}
          size="sm"
          variant={tab === "imdt2grdt" ? "solid" : "soft"}
        >
          火星曆 →地球曆
        </Button>
      </div>

      {tab === "grdt2imdt" && (
        <Grdt2ImdtTab
          gregorianDateTime={gregorianDateTime}
          imperialTimezone={imperialTimezone}
          onConvert={() => runTool("convert_gregorian_to_imperial_datetime", { gregorianDateTime, imperialTimezone })}
          onGregorianDateTimeChange={setGregorianDateTime}
          onImperialTimezoneChange={setImperialTimezone}
          running={running}
        />
      )}

      {tab === "now" && (
        <NowTab
          currentTimezone={currentTimezone}
          onCurrentTimezoneChange={setCurrentTimezone}
          onFetch={() => runTool("get_current_imperial_datetime", { timezone: currentTimezone })}
          running={running}
        />
      )}

      {tab === "imdt2grdt" && (
        <Imdt2GrdtTab
          gregorianTimezone={gregorianTimezone}
          imperialDateTimeFormatted={imperialDateTimeFormatted}
          onConvert={() =>
            runTool("convert_imperial_to_gregorian_datetime", { imperialDateTimeFormatted, gregorianTimezone })
          }
          onGregorianTimezoneChange={setGregorianTimezone}
          onImperialDateTimeFormattedChange={setImperialDateTimeFormatted}
          running={running}
        />
      )}

      <section className="mt-4">
        <Alert
          color={isError ? "danger" : "info"}
          description={<pre className="m-0 whitespace-pre-wrap break-all text-xs">{outputText}</pre>}
          title="結果"
          variant="soft"
        />
      </section>
    </main>
  );
}
