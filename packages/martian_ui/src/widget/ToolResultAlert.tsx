import { useMemo } from "react";
import { Alert } from "@openai/apps-sdk-ui/components/Alert";
import type { WidgetToolResult } from "./widgetTypes";

type Props = {
  emptyMessage: string;
  result?: WidgetToolResult;
};

export default function ToolResultAlert({ emptyMessage, result }: Props) {
  const outputText = useMemo(() => {
    if (result?.structuredContent !== undefined) {
      return JSON.stringify(result.structuredContent, null, 2);
    }
    const text = result?.content?.find((item) => item.type === "text")?.text;
    if (text !== undefined) {
      return text;
    }
    return emptyMessage;
  }, [emptyMessage, result]);

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
