# martian_ui

帝國火星曆のWeb frontend

## 配信されるfile

### Web frontend

`dist/` directory以下のfile。`https://martian-imperial-year-table.c4se.jp/` から參照できます。

### MCP applicationのfrontend

`dist/widget/` directory以下のfile。MCP applicationに對應したapplicationから參照されます。`https://martian-imperial-year-table.c4se.jp/widget/〜.html` からも參照できます。

## npm run build

以下のfileは `npm run build` commandによって自動生成されます。

- `dist/` directory以下のfile
  - Viteにより生成されます。
- `src/generated/openapi-doc.ts`
  - `packages/martian_api/openapi/openapi.yaml` から `npm run generate:api-doc` で生成されます。
- `src/generated/mcp-doc.ts`
  - `packages/martian_api/src/mcp-manifest.json` から `npm run generate:mcp-doc` で生成されます。
