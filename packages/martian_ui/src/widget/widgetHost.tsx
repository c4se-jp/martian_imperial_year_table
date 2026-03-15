import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import { useEffect, useRef, useState, type ComponentType } from "react";
import ReactDOM from "react-dom/client";
import { modeFromToolName, type ToolMode, type WidgetToolResult } from "./widgetTypes";

type WidgetComponentProps = {
  callTool?: (name: string, args: Record<string, unknown>) => Promise<WidgetToolResult>;
  initialResult?: WidgetToolResult;
  subscribeToolResult?: (listener: (result: WidgetToolResult) => void) => void;
};

type MountOptions = {
  appInfoName: string;
  component: ComponentType<WidgetComponentProps>;
  fallbackMode: ToolMode;
};

function createErrorResult(message: string, mode: ToolMode, request: Record<string, unknown> = {}): WidgetToolResult {
  return {
    structuredContent: {
      mode,
      request,
      error: message,
    },
    isError: true,
  };
}

export function mountWidget(
  { appInfoName, component: WidgetComponent, fallbackMode }: MountOptions,
  root: HTMLElement,
) {
  function ChatGptApp() {
    const [result, setResult] = useState<WidgetToolResult | undefined>(undefined);
    const pendingToolCallRef = useRef<{ args: Record<string, unknown>; name: string } | undefined>(undefined);
    const { app, error, isConnected } = useApp({
      appInfo: { name: appInfoName, version: "0.1.0" },
      capabilities: {},
      onAppCreated: (createdApp) => {
        createdApp.ontoolresult = (toolResult) => {
          pendingToolCallRef.current = undefined;
          setResult(toolResult as WidgetToolResult);
        };
        createdApp.ontoolcancelled = (params) => {
          const pendingToolCall = pendingToolCallRef.current;
          pendingToolCallRef.current = undefined;
          setResult(
            createErrorResult(
              params.reason ?? "tool 呼び出しが中斷されました。",
              pendingToolCall ? modeFromToolName(pendingToolCall.name) : fallbackMode,
              pendingToolCall?.args ?? {},
            ),
          );
        };
      },
    });

    useHostStyles(app, app?.getHostContext());

    useEffect(() => {
      document.documentElement.dataset.theme = "light";
      document.documentElement.style.colorScheme = "light";
      document.body.dataset.theme = "light";
      document.body.style.colorScheme = "light";
    }, []);

    useEffect(() => {
      if (isConnected && app !== null) {
        const hostContext = app.getHostContext();
        if (hostContext?.toolInfo?.tool?.name !== undefined) {
          document.title = hostContext.toolInfo.tool.name;
        }
      }
    }, [app, isConnected]);

    if (error !== null) {
      return <WidgetComponent initialResult={createErrorResult(error.message, fallbackMode)} />;
    }

    return (
      <WidgetComponent
        callTool={async (name, args) => {
          if (app === null) {
            return createErrorResult("MCP App がまだ初期化されてゐません。", modeFromToolName(name), args);
          }
          pendingToolCallRef.current = { name, args };
          return (await app.callServerTool({ name, arguments: args })) as WidgetToolResult;
        }}
        initialResult={result}
        subscribeToolResult={(listener) => {
          if (result !== undefined) {
            listener(result);
          }
        }}
      />
    );
  }

  ReactDOM.createRoot(root).render(<ChatGptApp />);
}
