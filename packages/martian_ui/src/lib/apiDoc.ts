export type ApiSchemaDoc = {
  title?: string;
  ref?: string;
  description?: string;
  type: string;
  format?: string;
  pattern?: string;
  nullable?: boolean;
  required?: string[];
  properties?: ApiSchemaPropertyDoc[];
  items?: ApiSchemaDoc;
  oneOf?: ApiSchemaDoc[];
  anyOf?: ApiSchemaDoc[];
  allOf?: ApiSchemaDoc[];
  enumValues?: Array<string | number | boolean | null>;
  additionalProperties?: boolean | ApiSchemaDoc;
  minimum?: number;
  maximum?: number;
  defaultValue?: unknown;
  example?: unknown;
};

export type ApiSchemaPropertyDoc = {
  name: string;
  required: boolean;
  description?: string;
  schema: ApiSchemaDoc;
};

export type ApiParameterDoc = {
  name: string;
  in: string;
  required: boolean;
  description?: string;
  schema: ApiSchemaDoc;
  example?: unknown;
  defaultValue?: unknown;
};

export type ApiRequestBodyDoc = {
  required: boolean;
  contentType: string;
  description?: string;
  schema: ApiSchemaDoc;
  example?: unknown;
};

export type ApiResponseDoc = {
  status: string;
  description: string;
  contentType?: string;
  schema?: ApiSchemaDoc;
  example?: unknown;
};

export type ApiEndpointDoc = {
  id: string;
  path: string;
  method: string;
  operationId?: string;
  summary?: string;
  description?: string;
  tags: string[];
  parameters: ApiParameterDoc[];
  requestBody?: ApiRequestBodyDoc;
  responses: ApiResponseDoc[];
};

export type ApiDoc = {
  sourcePath: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers: Array<{
    url: string;
    description?: string;
  }>;
  tags: Array<{
    name: string;
    description?: string;
  }>;
  endpoints: ApiEndpointDoc[];
  schemas: Array<{
    name: string;
    schema: ApiSchemaDoc;
  }>;
};
