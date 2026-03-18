export type McpFieldDoc = {
  name: string;
  type: string;
  description?: string;
  pattern?: string;
  defaultValue?: string;
  examples?: string[];
};

export type McpToolDoc = {
  name: string;
  mode: string;
  title: string;
  description: string;
  readOnlyHint: boolean;
  inputSchema: McpFieldDoc[];
  meta: {
    resourceUri?: string;
    invoking?: string;
    invoked?: string;
  };
  doc: {
    summary: string;
    returns: string;
    requestExample?: unknown;
    responseExample?: unknown;
    errors: string[];
  };
};

export type McpResourceDoc = {
  id: string;
  uri: string;
  title: string;
  description: string;
  mimeType: string;
  meta: {
    widgetDescription?: string;
    widgetPrefersBorder?: boolean;
    connectDomains?: string[];
    resourceDomains?: string[];
  };
};

export type McpDoc = {
  sourcePath: string;
  server: {
    name: string;
    version: string;
    title: string;
    description: string;
  };
  resources: McpResourceDoc[];
  tools: McpToolDoc[];
};
