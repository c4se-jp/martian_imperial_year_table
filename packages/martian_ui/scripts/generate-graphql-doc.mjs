import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildSchema, isInputObjectType, isObjectType, isScalarType, print } from "graphql";

const source = await readFile(new URL("../../martian_api/graphql/schema.graphql", import.meta.url), "utf8");
const schema = buildSchema(source);
const builtinDescriptions = {
  Int: "Int スカラー型は、小數部分を持たない符號附き整數を表します。表現できる値の範圍は -2^31 以上 2^31 - 1 以下です。",
  Boolean: "Boolean スカラー型は、眞（true）又は僞（false）を表します。",
  Float: "Float スカラー型は、IEEE 754 で規定された符號附き倍精度浮動小數點數を表します。",
  String:
    "String スカラー型は、UTF-8 の文字列として表現されるテキストデータを表します。GraphQL では、主に人が讀める自由形式のテキストを表すために使はれます。",
};
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
    description: builtinDescriptions[type.name] ?? type.description ?? "",
    fields: isInputObjectType(type) || isObjectType(type) ? Object.values(type.getFields()).map(fieldDoc) : [],
  }));
const directory = new URL("../src/generated/", import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(
  new URL("graphql-doc.ts", directory),
  `// 自動生成。generate:graphql-doc を實行してください。\nimport type { GraphqlDoc } from "../lib/graphqlDoc";\nexport default ${JSON.stringify({ source, types }, null, 2)} satisfies GraphqlDoc;\n`,
);
