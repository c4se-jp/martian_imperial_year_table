import { Alert } from "@openai/apps-sdk-ui/components/Alert";
import { useMemo } from "preact/hooks";
import type { WidgetToolResult } from "./widgetTypes";

type Props = {
  emptyMessage: string;
  formatResult?: (result: WidgetToolResult) => string | undefined;
  result?: WidgetToolResult;
};

export default function ToolResultAlert({ emptyMessage, formatResult, result }: Props) {
  const outputText = useMemo(() => {
    if (result !== undefined && formatResult !== undefined) {
      const formatted = formatResult(result);
      if (formatted !== undefined) {
        return formatted;
      }
    }
    if (result?.structuredContent !== undefined) {
      return JSON.stringify(result.structuredContent, null, 2);
    }
    const text = result?.content?.find((item) => item.type === "text")?.text;
    if (text !== undefined) {
      return text;
    }
    return emptyMessage;
  }, [emptyMessage, formatResult, result]);

  const isError = Boolean(result?.isError || result?.structuredContent?.error);

  return (
    <Alert
      color={isError ? "danger" : "info"}
      description={<pre className="m-0 whitespace-pre-wrap break-all text-xs">{outputText}</pre>}
      title="結果"
      variant="soft"
    />
  );
}
