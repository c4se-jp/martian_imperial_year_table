export type ToolMode = "convert_gregorian_to_imperial" | "get_current_imperial" | "convert_imperial_to_gregorian";

export type WidgetStructuredContent = {
  error?: string;
  mode: ToolMode;
  request: Record<string, unknown>;
  response?: Record<string, unknown>;
};

export type WidgetToolResult = {
  content?: Array<{ type: string; text?: string }>;
  isError?: boolean;
  structuredContent?: WidgetStructuredContent;
};

export function modeFromToolName(name: string): ToolMode {
  if (name === "convert_gregorian_to_imperial_datetime") {
    return "convert_gregorian_to_imperial";
  }
  if (name === "get_current_imperial_datetime") {
    return "get_current_imperial";
  }
  return "convert_imperial_to_gregorian";
}
