import type { Meta, StoryObj } from "@storybook/preact";
import CurrentImperialDatetimeWidget from "./current-imperial-datetime/CurrentImperialDatetimeWidget";
import type { WidgetToolResult } from "./widgetTypes";

const meta: Meta<typeof CurrentImperialDatetimeWidget> = {
  title: "Widget/CurrentImperialDatetimeWidget",
  component: CurrentImperialDatetimeWidget,
};

export default meta;

type Story = StoryObj<typeof CurrentImperialDatetimeWidget>;

function mockResult(name: string, args: Record<string, unknown>): WidgetToolResult {
  return {
    structuredContent: {
      mode: name === "get_current_imperial_datetime" ? "get_current_imperial" : "convert_gregorian_to_imperial",
      request: args,
      response: {
        gregorianDateTime: "2026-02-16T03:34:56.000Z",
        imperialDateTime: {
          year: 1239,
          month: 8,
          day: 20,
          hour: 12,
          minute: 34,
          second: 56,
          timezone: "+09:00",
        },
        imperialDateTimeFormatted: "1239-08-20T12:34:56+09:00",
      },
    },
  };
}

export const Default: Story = {
  args: {
    callTool: async (name, args) => {
      await new Promise((resolve) => setTimeout(resolve, 120));
      return mockResult(name, args);
    },
  },
};
