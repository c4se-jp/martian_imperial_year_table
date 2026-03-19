# martian_ui

帝國火星曆のWeb frontend

## 配信されるfile

### Web frontend

`dist/` directory以下のfile。`https://martian-imperial-year-table.c4se.jp/` から參照できます。

### MCP applicationのfrontend

`dist/widget/` directory以下のfile。MCP applicationに對應したapplicationから參照されます。現在は日時變換 widget と現在の帝國火星曆日時 widget を配信してをり、`https://martian-imperial-year-table.c4se.jp/widget/〜.html` からも參照できます。

## npm run build

以下のfileは `npm run build` commandによって自動生成されます。

- `dist/` directory以下のfile
  - Viteにより生成されます。
- `src/generated/openapi-doc.ts`
  - `packages/martian_api/openapi/openapi.yaml` から `npm run generate:api-doc` で生成されます。
- `src/generated/mcp-doc.ts`
  - `packages/martian_api/src/mcp-manifest.json` から `npm run generate:mcp-doc` で生成されます。

## OpenTelemetry

Web frontend (`src/main.tsx`) のみ browser 向け OpenTelemetry を初期化します。`src/widget/` 側は別 entry point のため計裝されません。

以下の環境變數を build 時に指定すると、Mackerel へ trace を直接送信します。

- `VITE_MACKEREL_CLIENT_TOKEN`
  - Mackerel の browser 用 client token。
- `VITE_MACKEREL_DEPLOYMENT_ENVIRONMENT`
  - `production` などの deployment 環境名。
- `VITE_MACKEREL_SERVICE_VERSION`
  - deploy した revision。GitHub Actions では `github.sha` を渡す想定です。
