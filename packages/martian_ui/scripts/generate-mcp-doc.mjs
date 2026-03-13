import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uiRoot = path.resolve(__dirname, "..");
const inputPath = path.resolve(uiRoot, "../martian_api/src/mcp-manifest.json");
const outputDir = path.resolve(uiRoot, "src/generated");
const outputPath = path.resolve(outputDir, "mcp-doc.ts");

async function main() {
  const source = await readFile(inputPath, "utf8");
  const manifest = JSON.parse(source);

  const doc = {
    sourcePath: "packages/martian_api/src/mcp-manifest.json",
    server: manifest.server,
    resources: manifest.resources,
    tools: manifest.tools.map((tool) => ({
      name: tool.name,
      mode: tool.mode,
      title: tool.title,
      description: tool.description,
      readOnlyHint: tool.readOnlyHint === true,
      inputSchema: Object.entries(tool.inputSchema).map(([name, field]) => ({
        name,
        type: field.type,
        description: field.description,
        pattern: field.pattern,
        defaultValue: field.default,
        examples: field.examples ?? [],
      })),
      meta: tool.meta ?? {},
      doc: {
        summary: tool.doc.summary,
        returns: tool.doc.returns,
        requestExample: tool.doc.requestExample,
        responseExample: tool.doc.responseExample,
        errors: tool.doc.errors ?? [],
      },
    })),
  };

  const output = `import type { McpDoc } from "../lib/mcpDoc";

const mcpDoc = ${JSON.stringify(doc, null, 2)} satisfies McpDoc;

export default mcpDoc;
`;

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, output, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
