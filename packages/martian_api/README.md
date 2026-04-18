# martian_api

AWS Lambda で動作する帝國火星曆 Web API の實裝ディレクトリです。
フレームワークは Hono を使用します。

## OpenAPI

- `openapi/openapi.yaml`

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
