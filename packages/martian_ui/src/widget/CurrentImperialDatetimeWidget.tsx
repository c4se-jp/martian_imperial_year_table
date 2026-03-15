import { useEffect, useState } from "react";
import "@openai/apps-sdk-ui/css";
import NowTab from "./tabs/NowTab";
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

export default function CurrentImperialDatetimeWidget({ callTool, initialResult, subscribeToolResult }: Props) {
  const [currentTimezone, setCurrentTimezone] = useState("+00:00");
  const [result, setResult] = useState<WidgetToolResult | undefined>(
    initialResult?.structuredContent?.mode === "get_current_imperial" ? initialResult : undefined,
  );
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (initialResult?.structuredContent?.mode === "get_current_imperial") {
      setResult(initialResult);
    }
  }, [initialResult]);

  useEffect(() => {
    if (subscribeToolResult === undefined) {
      return;
    }
    subscribeToolResult((nextResult) => {
      if (nextResult.structuredContent?.mode === "get_current_imperial") {
        setResult(nextResult);
      }
    });
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
          mode: modeFromToolName(name),
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
      <h1 className="heading-md">現在の帝國火星曆日時</h1>
      <p className="text-sm text-secondary">指定したタイムゾーンで現在の帝國火星曆日時を取得します。</p>

      <NowTab
        currentTimezone={currentTimezone}
        onCurrentTimezoneChange={setCurrentTimezone}
        onFetch={() => runTool("get_current_imperial_datetime", { timezone: currentTimezone })}
        running={running}
      />

      <section className="mt-4">
        <ToolResultAlert emptyMessage="現在の帝國火星曆日時がここに表示されます。" result={result} />
      </section>
    </main>
  );
}
