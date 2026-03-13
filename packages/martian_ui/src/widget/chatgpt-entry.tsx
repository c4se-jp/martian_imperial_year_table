import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import MartianDatetimeWidget, { type WidgetToolResult } from "./MartianDatetimeWidget";

function ChatGptApp() {
  const [result, setResult] = useState<WidgetToolResult | undefined>(undefined);
  const { app, error, isConnected } = useApp({
    appInfo: { name: "martian_datetime_widget", version: "0.1.0" },
    capabilities: {},
    onAppCreated: (createdApp) => {
      createdApp.ontoolresult = (toolResult) => {
        setResult(toolResult as WidgetToolResult);
      };
      createdApp.ontoolcancelled = (params) => {
        setResult({
          structuredContent: {
            mode: "get_current_imperial",
            request: {},
            error: params.reason ?? "tool 呼び出しが中斷されました。",
          },
          isError: true,
        });
      };
    },
  });

  useHostStyles(app, app?.getHostContext());

  useEffect(() => {
    if (isConnected && app !== null) {
      const hostContext = app.getHostContext();
      if (hostContext?.toolInfo?.tool?.name !== undefined) {
        document.title = hostContext.toolInfo.tool.name;
      }
    }
  }, [app, isConnected]);

  if (error !== null) {
    return (
      <MartianDatetimeWidget
        initialResult={{
          structuredContent: {
            mode: "get_current_imperial",
            request: {},
            error: error.message,
          },
          isError: true,
        }}
      />
    );
  }

  return (
    <MartianDatetimeWidget
      callTool={async (name, args) => {
        if (app === null) {
          return {
            structuredContent: {
              mode: "get_current_imperial",
              request: args,
              error: "MCP App がまだ初期化されてゐません。",
            },
            isError: true,
          };
        }
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

const root = document.getElementById("root");
if (root !== null) {
  ReactDOM.createRoot(root).render(<ChatGptApp />);
}
