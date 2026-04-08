# martian_ui

帝國火星曆のWeb frontend

## 配信されるfile

### Web frontend

`dist/` directory以下のfile。`https://martian-imperial-year-table.c4se.jp/` から參照できます。

## npm run build

以下のfileは `npm run build` commandによって自動生成されます。

- `dist/` directory以下のfile
  - Viteにより生成されます。
- `src/generated/openapi-doc.ts`
  - `packages/martian_api/openapi/openapi.yaml` から `npm run generate:api-doc` で生成されます。
- `src/generated/mcp-doc.ts`
  - `packages/martian_api/src/mcp-manifest.json` から `npm run generate:mcp-doc` で生成されます。

## OpenTelemetry

Web frontend (`src/main.tsx`) のみ browser 向け OpenTelemetry を初期化します。

以下の環境變數を build 時に指定すると、Mackerel へ trace を直接送信します。

- `VITE_MACKEREL_CLIENT_TOKEN`
  - Mackerel の browser 用 client token。
- `VITE_MACKEREL_DEPLOYMENT_ENVIRONMENT`
  - `production` などの deployment 環境名。
- `VITE_MACKEREL_SERVICE_VERSION`
  - deploy した revision。GitHub Actions では `github.sha` を渡す想定です。

## Google Analytics

Web frontend (`src/main.tsx`) では `VITE_GA_MEASUREMENT_ID` が build 時に指定されてゐる場合のみ Google Analytics 4 を初期化します。

- `VITE_GA_MEASUREMENT_ID`
  - GA4 の measurement ID。例: `G-XXXXXXXXXX`

SPA なので `send_page_view: false` とし、初回表示と route 遷移ごとに `page_view` event を手動送信します。

MCP application 向け widget UI は packages/martian_widget_ui に分離されてゐます。
