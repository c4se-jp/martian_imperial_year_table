import type { Meta, StoryObj } from "@storybook/react";
import MartianDatetimeWidget, { type WidgetToolResult } from "./MartianDatetimeWidget";

const meta: Meta<typeof MartianDatetimeWidget> = {
  title: "Widget/MartianDatetimeWidget",
  component: MartianDatetimeWidget,
};

export default meta;

type Story = StoryObj<typeof MartianDatetimeWidget>;

function mockResult(name: string, args: Record<string, unknown>): WidgetToolResult {
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
  if (name === "convert_imperial_to_gregorian_datetime") {
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

  return {
    structuredContent: {
      mode: "convert_gregorian_to_imperial",
      request: args,
      response: {
        imperialDateTimeFormatted: "1239-08-20T10:00:00+09:00",
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
