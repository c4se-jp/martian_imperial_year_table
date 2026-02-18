import { useEffect } from "react";
import MartianDatetimeWidget, { type WidgetToolResult } from "../widget/MartianDatetimeWidget";

function buildMockResult(name: string, args: Record<string, unknown>): WidgetToolResult {
  if (name === "convert_gregorian_to_imperial_datetime") {
    return {
      structuredContent: {
        mode: "convert_gregorian_to_imperial",
        request: args,
        response: {
          imperialDateTimeFormatted: "1239-08-20T10:00:00+09:00",
          imperialDateTime: {
            year: 1239,
            month: 8,
            day: 20,
            hour: 10,
            minute: 0,
            second: 0,
            timezone: "+09:00",
          },
        },
      },
    };
  }

  if (name === "get_current_imperial_datetime") {
    return {
      structuredContent: {
        mode: "get_current_imperial",
        request: args,
        response: {
          imperialDateTimeFormatted: "1239-08-20T12:34:56+00:00",
          gregorianDateTime: "2026-02-16T12:34:56.000Z",
        },
      },
    };
  }

  return {
    structuredContent: {
      mode: "convert_imperial_to_gregorian",
      request: args,
      response: {
        gregorianDateTime: "2026-02-16T09:00:00+09:00",
      },
    },
  };
}

export default function WidgetStorybookPage() {
  useEffect(() => {
    document.title = "Widget Storybook | 帝國火星曆";
  }, []);

  return (
    <section className="container">
      <div className="notification is-light">
        <p className="title is-5">Widget Storybook (ローカル確認用)</p>
        <p className="subtitle is-7">ChatGPT連携なしで、3つのtoolを1つのwidgetで操作した時の表示を確認できます。</p>
      </div>

      <MartianDatetimeWidget
        callTool={async (name, args) => {
          await new Promise((resolve) => setTimeout(resolve, 120));
          return buildMockResult(name, args);
        }}
      />
    </section>
  );
}
