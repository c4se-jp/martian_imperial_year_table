import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildSchema } from "graphql";

const source = await readFile(new URL("../graphql/schema.graphql", import.meta.url), "utf8");
buildSchema(source);
const directory = new URL("../src/generated/", import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(
  new URL("graphql-schema.ts", directory),
  `// 自動生成。graphql/schema.graphql を編輯してください。\nexport default ${JSON.stringify(source)};\n`,
);
