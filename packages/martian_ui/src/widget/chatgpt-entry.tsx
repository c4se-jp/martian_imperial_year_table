import ReactDOM from "react-dom/client";
import MartianDatetimeWidget, { type WidgetToolResult } from "./MartianDatetimeWidget";

type OpenAiBridge = {
  callTool?: (name: string, args: Record<string, unknown>) => Promise<WidgetToolResult>;
  on?: (eventName: string, listener: (payload: WidgetToolResult) => void) => void;
};

declare global {
  interface Window {
    openai?: OpenAiBridge;
    martianWidgetSetResult?: (result: WidgetToolResult) => void;
  }
}

const root = document.getElementById("root");
if (root !== null) {
  ReactDOM.createRoot(root).render(
    <MartianDatetimeWidget
      callTool={async (name, args) => {
        const bridge = window.openai;
        if (bridge?.callTool === undefined) {
          return {
            structuredContent: {
              mode: "get_current_imperial",
              request: args,
              error: "window.openai.callTool が利用できません。",
            },
            isError: true,
          };
        }
        return bridge.callTool(name, args);
      }}
      subscribeToolResult={(listener) => {
        window.martianWidgetSetResult = listener;
        if (window.openai?.on !== undefined) {
          window.openai.on("tool_result", listener);
        }
      }}
    />,
  );
}

window.martianWidgetSetResult = () => {};
