import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uiRoot = path.resolve(__dirname, "..");
const inputPath = path.resolve(uiRoot, "../martian_api/openapi/openapi.yaml");
const outputDir = path.resolve(uiRoot, "src/generated");
const outputPath = path.resolve(outputDir, "openapi-doc.ts");

const httpMethods = ["get", "post", "put", "patch", "delete", "options", "head", "trace"];

function inferSchemaType(schema) {
  if (!schema || typeof schema !== "object") return "unknown";
  if (typeof schema.type === "string") return schema.type;
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    const value = schema.enum[0];
    return value === null ? "null" : typeof value;
  }
  if (schema.properties || schema.additionalProperties) return "object";
  if (schema.items) return "array";
  if (schema.oneOf) return "oneOf";
  if (schema.anyOf) return "anyOf";
  if (schema.allOf) return "allOf";
  return "unknown";
}

function buildSyntheticExample(schema, namedSchemas, stack = []) {
  if (!schema || typeof schema !== "object") return null;
  if (typeof schema.$ref === "string") {
    const ref = refNameFromRef(schema.$ref);
    if (stack.includes(ref)) return null;
    return buildSyntheticExample(namedSchemas[ref], namedSchemas, [...stack, ref]);
  }
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;
  if (Array.isArray(schema.enum) && schema.enum.length > 0) return schema.enum[0];

  const type = inferSchemaType(schema);
  if (type === "object") {
    const properties = schema.properties ?? {};
    return Object.fromEntries(
      Object.entries(properties).map(([name, propertySchema]) => [
        name,
        buildSyntheticExample(propertySchema, namedSchemas, stack),
      ]),
    );
  }
  if (type === "array") {
    return [buildSyntheticExample(schema.items, namedSchemas, stack)];
  }
  if (type === "integer") return schema.minimum ?? 0;
  if (type === "number") return schema.minimum ?? 0;
  if (type === "boolean") return true;
  if (type === "string") {
    if (schema.format === "date-time") return "2026-02-14T12:34:56Z";
    if (typeof schema.pattern === "string" && schema.pattern.includes("[+-]")) return "+00:00";
    return "string";
  }
  return null;
}

function refNameFromRef(ref) {
  const parts = ref.split("/");
  return parts[parts.length - 1];
}

function createNormalizer(namedSchemas) {
  function normalizeSchema(rawSchema, stack = []) {
    if (!rawSchema || typeof rawSchema !== "object") {
      return { type: "unknown" };
    }

    if (typeof rawSchema.$ref === "string") {
      const ref = refNameFromRef(rawSchema.$ref);
      if (stack.includes(ref)) {
        return { title: ref, ref, type: "object" };
      }
      const normalized = normalizeSchema(namedSchemas[ref], [...stack, ref]);
      return {
        ...normalized,
        title: normalized.title ?? ref,
        ref,
      };
    }

    const normalized = {
      title: typeof rawSchema.title === "string" ? rawSchema.title : undefined,
      description: typeof rawSchema.description === "string" ? rawSchema.description : undefined,
      type: inferSchemaType(rawSchema),
      format: typeof rawSchema.format === "string" ? rawSchema.format : undefined,
      pattern: typeof rawSchema.pattern === "string" ? rawSchema.pattern : undefined,
      nullable: rawSchema.nullable === true ? true : undefined,
      required: Array.isArray(rawSchema.required) ? rawSchema.required : undefined,
      enumValues: Array.isArray(rawSchema.enum) ? rawSchema.enum : undefined,
      minimum: typeof rawSchema.minimum === "number" ? rawSchema.minimum : undefined,
      maximum: typeof rawSchema.maximum === "number" ? rawSchema.maximum : undefined,
      defaultValue: rawSchema.default,
      example: rawSchema.example ?? buildSyntheticExample(rawSchema, namedSchemas, stack),
    };

    if (normalized.type === "object") {
      const required = new Set(Array.isArray(rawSchema.required) ? rawSchema.required : []);
      const properties = Object.entries(rawSchema.properties ?? {}).map(([name, propertySchema]) => ({
        name,
        required: required.has(name),
        description:
          propertySchema && typeof propertySchema === "object" && typeof propertySchema.description === "string"
            ? propertySchema.description
            : undefined,
        schema: normalizeSchema(propertySchema, stack),
      }));
      const additionalProperties =
        typeof rawSchema.additionalProperties === "boolean"
          ? rawSchema.additionalProperties
          : rawSchema.additionalProperties
            ? normalizeSchema(rawSchema.additionalProperties, stack)
            : undefined;
      return {
        ...normalized,
        properties,
        additionalProperties,
      };
    }

    if (normalized.type === "array") {
      return {
        ...normalized,
        items: normalizeSchema(rawSchema.items, stack),
      };
    }

    if (Array.isArray(rawSchema.oneOf)) {
      return {
        ...normalized,
        oneOf: rawSchema.oneOf.map((schema) => normalizeSchema(schema, stack)),
      };
    }

    if (Array.isArray(rawSchema.anyOf)) {
      return {
        ...normalized,
        anyOf: rawSchema.anyOf.map((schema) => normalizeSchema(schema, stack)),
      };
    }

    if (Array.isArray(rawSchema.allOf)) {
      return {
        ...normalized,
        allOf: rawSchema.allOf.map((schema) => normalizeSchema(schema, stack)),
      };
    }

    return normalized;
  }

  return normalizeSchema;
}

function selectJsonContent(content) {
  if (!content || typeof content !== "object") return undefined;
  if (content["application/json"]) {
    return { contentType: "application/json", value: content["application/json"] };
  }
  const first = Object.entries(content)[0];
  if (!first) return undefined;
  return { contentType: first[0], value: first[1] };
}

function makeEndpointId(method, endpointPath, operationId) {
  if (typeof operationId === "string" && operationId.length > 0) return operationId;
  return `${method}-${endpointPath}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const source = await readFile(inputPath, "utf8");
  const parsed = parse(source);
  const namedSchemas = parsed.components?.schemas ?? {};
  const normalizeSchema = createNormalizer(namedSchemas);

  const endpoints = Object.entries(parsed.paths ?? {}).flatMap(([endpointPath, methods]) =>
    Object.entries(methods ?? {})
      .filter(([method]) => httpMethods.includes(method))
      .map(([method, operation]) => {
        const parameters = Array.isArray(operation.parameters)
          ? operation.parameters.map((parameter) => ({
              name: parameter.name,
              in: parameter.in,
              required: parameter.required === true,
              description: parameter.description,
              schema: normalizeSchema(parameter.schema ?? {}),
              example: parameter.example ?? parameter.schema?.example,
              defaultValue: parameter.schema?.default,
            }))
          : [];

        const requestContent = selectJsonContent(operation.requestBody?.content);
        const requestBody = requestContent
          ? {
              required: operation.requestBody?.required === true,
              contentType: requestContent.contentType,
              description: operation.requestBody?.description,
              schema: normalizeSchema(requestContent.value?.schema ?? {}),
              example:
                requestContent.value?.example ??
                requestContent.value?.examples?.default?.value ??
                buildSyntheticExample(requestContent.value?.schema ?? {}, namedSchemas),
            }
          : undefined;

        const responses = Object.entries(operation.responses ?? {}).map(([status, response]) => {
          const responseContent = selectJsonContent(response.content);
          return {
            status,
            description: response.description ?? "",
            contentType: responseContent?.contentType,
            schema: responseContent ? normalizeSchema(responseContent.value?.schema ?? {}) : undefined,
            example: responseContent
              ? responseContent.value?.example ??
                responseContent.value?.examples?.default?.value ??
                buildSyntheticExample(responseContent.value?.schema ?? {}, namedSchemas)
              : undefined,
          };
        });

        return {
          id: makeEndpointId(method, endpointPath, operation.operationId),
          path: endpointPath,
          method: method.toUpperCase(),
          operationId: operation.operationId,
          summary: operation.summary,
          description: operation.description,
          tags: Array.isArray(operation.tags) ? operation.tags : [],
          parameters,
          requestBody,
          responses,
        };
      }),
  );

  const schemas = Object.entries(namedSchemas).map(([name, schema]) => ({
    name,
    schema: {
      ...normalizeSchema(schema, [name]),
      title: name,
      ref: name,
    },
  }));

  const apiDoc = {
    sourcePath: "packages/martian_api/openapi/openapi.yaml",
    info: {
      title: parsed.info?.title ?? "API",
      version: parsed.info?.version ?? "",
      description: parsed.info?.description,
    },
    servers: Array.isArray(parsed.servers)
      ? parsed.servers.map((server) => ({
          url: server.url,
          description: server.description,
        }))
      : [],
    tags: Array.isArray(parsed.tags)
      ? parsed.tags.map((tag) => ({
          name: tag.name,
          description: tag.description,
        }))
      : [],
    endpoints,
    schemas,
  };

  const output = `import type { ApiDoc } from "../lib/apiDoc";

const apiDoc = ${JSON.stringify(apiDoc, null, 2)} satisfies ApiDoc;

export default apiDoc;
`;

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, output, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
