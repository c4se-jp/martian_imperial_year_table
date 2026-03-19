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
  - CD 時に AWS Secrets Manager へ保存するための値です。Lambda には直接渡しません。
- `MACKEREL_API_KEY_SECRET_ARN`
  - Lambda が起動時に参照する Secrets Manager secret の ARN です。
- `MACKEREL_DEPLOYMENT_ENVIRONMENT`
  - `production` などの deployment 環境名です。
- `MACKEREL_SERVICE_VERSION`
  - deploy した revision を渡します。GitHub Actions では `github.sha` を渡す想定です。
