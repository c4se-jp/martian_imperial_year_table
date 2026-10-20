# martian_api

AWS Lambda で動作する帝國火星曆 Web API の實裝ディレクトリです。
フレームワークは Hono を使用します。

## OpenAPI

- `openapi/openapi.yaml`

## GraphQL

`POST /graphql` に JSON の `query`、任意の `variables` と `operationName` を送ります。
Web UI のローカル計算、REST API、MCP は從來通りです。
スキーマの正本は `graphql/schema.graphql` にあり、標準の introspection でも取得できます。
公開ドキュメントは `/docs/graphql` です。API の build・開發起動・test 時に
`generate:graphql-schema` がサーバー用 TypeScript を生成し、Lambda に埋め込みます。
Web UI は同じ正本から `generate:graphql-doc` で型・引數・説明・初期値を生成します。
GET、Mutation、Subscription、batch request は提供しません。

```sh
curl http://localhost:3000/graphql \
  -H 'Content-Type: application/json' \
  --data '{"query":"query($date: GregorianDateTimeString!) { fromGregorian(datetime: $date) { imperial { formatted holidayNames } julianDay { day second } solarLongitudeDegrees } }","variables":{"date":"2026-06-01T12:00:00+09:00"}}'
```

入口は `now`、`fromGregorian`、`fromImperial`、`fromJulianDay`、
`fromTerrestrialTime`、`fromMarsSolDate`、`fromImperialSolNumber` です。
共通の `CalendarInstant` から各曆・時系を選擇できます。
`gregorian(timezone: "+09:00")`、`imperial(timezone: "+03:00")` のやうに、
出力ごとに固定オフセットを指定します。省略時は `+00:00` です。

- グレゴリオ曆 UTC の年0100〜9999を計算可能範圍とします。出力先の年もこの範圍に制限します。
- グレゴリオ曆入力は4桁の年、`T` 區切り、秒まで必須、任意の小數秒1〜3桁、`Z` 又は `±HH:MM` が必須です。
- タイムゾーンは `±HH:MM`（時00〜23、分00〜59）。IANA 名と閏秒は未對應です。
- 帝國火星曆入力は構造化された年月日時分秒です。共有ライブラリーが整數秒に丸めるため、
  `millisecond` は0のみ、帝國火星通日の `second` も整數のみ受け付けます。火星曆の出力 `millisecond` は常に0です。
- ユリウス通日と帝國火星通日は `day` と `second` に分けます。`second` は0以上86400未滿です。
- 地球時は地球時のユリウス日（單位は日）、Mars Sol Date は sol 單位です。
- 數値計算は共有ライブラリーの倍精度計算を使用します。火星側との往復は整數秒への丸めを伴ひます。
- `now` は一囘のリクエストで固定します。應答は `Cache-Control: no-store` です。

不正な JSON・GraphQL 文書・變數は HTTP 400、リクエスト上限超過は413です。
實行時の入力エラーは HTTP 200 の `errors` に入り、該當する nullable な變換結果が `null` になります。
`extensions.code` は `BAD_USER_INPUT`、`OUT_OF_RANGE`、`INTERNAL_SERVER_ERROR` を使用します。
構文・型檢證エラーは GraphQL 標準の形式です。HTTP 200 でも `errors` を確認してください。
內部例外の詳細は返さず、既存の telemetry に記錄します。

公開 API の負荷を制限するため、JSON body は16 KiB、GraphQL 文書は2048 token、
fragment 展開を含む選擇は256個、深さは12までとします。introspection もこの制限に從ひます。
CloudFront は `/graphql` を既存 Lambda へ轉送し、キャッシュしません。

## Entry Point

- `src/index.ts`
  - Lambda handler (`handler`) を export します。

## OpenTelemetry

- `MACKEREL_API_KEY`
  - local 開發時のみ直接設定できます。本番 deploy では通常使ひません。
- `MACKEREL_API_KEY_SECRET_ARN`
  - Lambda が起動時に参照する Secrets Manager secret の ARN です。
- `MACKEREL_DEPLOYMENT_ENVIRONMENT`
  - `production` などの deployment 環境名です。
- `MACKEREL_SERVICE_VERSION`
  - deploy した revision を渡します。GitHub Actions では `github.sha` を渡す想定です。

## 動作確認

手許で server を起動し動作を確認する :

```sh
npm run -w martian_api start:dev
(cd packages/martian_api && ./test.sh)
```

deploy された本番の API server の動作を確認する :

```sh
(cd packages/martian_api && BASE_URL="https://martian-imperial-year-table.c4se.jp" ./test.sh)
```
