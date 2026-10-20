import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildSchema, isInputObjectType, isObjectType, isScalarType, print } from "graphql";

const source = await readFile(new URL("../../martian_api/graphql/schema.graphql", import.meta.url), "utf8");
const schema = buildSchema(source);
const defaultValue = (field) => (field.astNode?.defaultValue ? print(field.astNode.defaultValue) : null);
const fieldDoc = (field) => ({
  name: field.name,
  description: field.description ?? "",
  type: String(field.type),
  defaultValue: defaultValue(field),
  args: (field.args ?? []).map(fieldDoc),
});
const types = Object.values(schema.getTypeMap())
  .filter((type) => !type.name.startsWith("__"))
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((type) => ({
    name: type.name,
    kind: isInputObjectType(type) ? "input" : isObjectType(type) ? "type" : isScalarType(type) ? "scalar" : "other",
    description: type.description ?? "",
    fields: isInputObjectType(type) || isObjectType(type) ? Object.values(type.getFields()).map(fieldDoc) : [],
  }));
const directory = new URL("../src/generated/", import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(
  new URL("graphql-doc.ts", directory),
  `// 自動生成。generate:graphql-doc を實行してください。\nimport type { GraphqlDoc } from "../lib/graphqlDoc";\nexport default ${JSON.stringify({ source, types }, null, 2)} satisfies GraphqlDoc;\n`,
);
