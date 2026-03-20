import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { render, type ComponentType } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
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

let standaloneClientPromise: Promise<Client> | undefined;

function resolveStandaloneMcpUrl(): URL {
  return new URL("/mcp", window.location.href);
}

async function getStandaloneClient(): Promise<Client> {
  if (standaloneClientPromise === undefined) {
    standaloneClientPromise = (async () => {
      const client = new Client(
        {
          name: "martian-widget-client",
          version: "0.1.0",
        },
        {
          capabilities: {},
        },
      );
      const transport = new StreamableHTTPClientTransport(resolveStandaloneMcpUrl());
      await client.connect(transport);
      return client;
    })().catch((error) => {
      standaloneClientPromise = undefined;
      throw error;
    });
  }

  return await standaloneClientPromise;
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

    return (
      <WidgetComponent
        callTool={async (name, args) => {
          if (app !== null) {
            pendingToolCallRef.current = { name, args };
            return (await app.callServerTool({ name, arguments: args })) as WidgetToolResult;
          }

          try {
            const client = await getStandaloneClient();
            return (await client.callTool({ name, arguments: args })) as WidgetToolResult;
          } catch (standaloneError) {
            const message =
              error?.message ??
              (standaloneError instanceof Error ? standaloneError.message : "MCP tool の呼び出しに失敗しました。");
            return createErrorResult(message, modeFromToolName(name), args);
          }
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

  render(<ChatGptApp />, root);
}
