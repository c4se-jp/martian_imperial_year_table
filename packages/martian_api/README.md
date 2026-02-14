# martian_api

AWS Lambda で動作する帝國火星曆 Web API の實裝ディレクトリです。
フレームワークは Hono を使用します。

## OpenAPI

- `openapi/openapi.yaml`
  - 現在の帝國火星曆での日時 (`ImperialDateTime`) を返す `GET /imperial-datetime/current` を定義してゐます。

## Entry Point

- `src/index.ts`
  - Lambda handler (`handler`) を export します。
- `src/app.ts`
  - `GET /api/imperial-datetime/current` を實裝してゐます。
