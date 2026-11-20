# AWS CDK (S3 + CloudFront + API Gateway + Lambda)

このディレクトリは、`martian-imperial-year-table.c4se.jp` を以下の構成で配信するための CDK です。

- 靜的サイト: `CloudFront -> S3`
- Web API: `CloudFront (/api/*) -> API Gateway (HTTP API) -> Lambda (Hono)`

## 前提

- AWS CLI 設定濟み (`aws configure`)
- `cdk bootstrap` 濟み (對象アカウント/リージョン)
- CloudFront 用 ACM 証明書を `us-east-1` で事前に作成しておく
- 事前に `npm run build` でリポジトリ直下の `dist/` と `dist/widget/` を生成しておく
- `martian_api` の Lambda bundle は `dist/widget/` を同梱する
- `dist/widget/` は S3/CloudFront へはアップロードしない

## 使ひ方

```bash
npm install
npx cdk synth
npx cdk deploy
```

## セキュリティヘッダと CSP

CloudFront の全 behavior に HSTS (`max-age=31536000`)、`nosniff`、`Referrer-Policy`、`X-Frame-Options: DENY` を付與します。HSTS はサブドメインや preload を含めません。iframe 埋め込みは禁止されます。CORS は API 側の設定を維持します。

CSP は `Content-Security-Policy` で強制します。報吿先は設定してゐないため、ブラウザーの開發者ツールで違反を確認してください。GA は廣吿機能なし、Mackerel は browser trace の送信先を想定します。インラインスタイルは現在許可しますが、インラインスクリプトや `unsafe-eval` は許可しません。

CSP 變更後は、GA と Mackerel の環境變數を設定した build を含めて、全畫面、主な操作、ダウンロード、直接 URL、テーマ復元、GA と Mackerel の通信をブラウザーで確認します。API と MCP の CORS・エラー・OPTIONS、および MCP 對應ホストでの widget も確認します。問題時は同じ値を `Content-Security-Policy-Report-Only` に戻す變更を deploy し、違反を調査してください。HSTS はブラウザーに保存され、deploy の差し戻しでは卽時に解除されません。

CDK の設定檢證は、リポジトリ直下で `npm run build` した後、このディレクトリで `npm test` を實行します。

## API の流量制限

HTTP API の `$default` stage では、全利用者に共通の目標として每秒 10 リクエスト、burst 20 リクエストを設定します。`/api/*`、`/graphql`、`/mcp` と API Gateway への直接アクセスが對象です。超過時は `429` が返ることがあります。制限はベストエフォートであり、嚴密な上限ではありません。

API Lambda の予約同時實行數は 10 です。上限到達時には API Gateway から 5xx が返る場合があります。これらの設定は Lambda への負荷を抑へますが、利用者別の制限や AWS 請求額の上限ではありません。API Gateway の `4XX`・`5XX`、Lambda の `Throttles`・`ConcurrentExecutions`・`Duration`、請求額を監視し、通常利用に支障がある場合は設定を見直してください。

## 合成監視

`imdt-transform-check` は1時間ごとに變換畫面、七曜表、REST API、MCP、GraphQL を檢查します。固定日時の變換結果を照合し、七曜表では描畫、月送り、SVG ダウンロードを確認します。各檢查が失敗しても後續を試み、最後に失敗をまとめて報吿します。Canary 自體のタイムアウトやブラウザーの起動失敗などでは全檢查を完了できない場合があります。

通知を受けたら CloudWatch の Synthetics canaries で `imdt-transform-check` の失敗した實行を開き、ステップ結果の `transform`、`calendar`、`restApi`、`mcp`、`graphql` を確認します。失敗したステップの理由とログに期待値・實際値またはエラーを記錄します。變換畫面はさらに `navigateToTransform`、`inputGregorianDate`、`verifyMartianDate` に分かれます。必要に應じて實行のスクリーンショットと CloudWatch Logs を確認してください。Canary 全體の失敗アラームは共通で、ステップごとの通知ではありません。

`executeStep` はステップの成功率・所要時間メトリクスとレポートを出力します。ステップ名はメトリクスのディメンションにもなるため、名前を變へると時系列が分かれます。詳細は [AWS の Node.js Canary ライブラリ仕様](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Library_function_Nodejs.html)を參照してください。

## 変更可能なパラメータ

- `hostedZoneDomainName` (context または `HOSTED_ZONE_DOMAIN_NAME`)
- `hostedZoneId` (context または `HOSTED_ZONE_ID`) ※必須
- `certificateArn` (context または `CERTIFICATE_ARN`) ※必須 (`us-east-1` の ACM 証明書)
- `mackerelDeploymentEnvironment` (context または `MACKEREL_DEPLOYMENT_ENVIRONMENT`)
- `mackerelServiceVersion` (context または `MACKEREL_SERVICE_VERSION`)
- `siteAssetsPath` (context または `SITE_ASSETS_PATH`)
- `siteDomainName` (context または `SITE_DOMAIN_NAME`)
- `MACKEREL_API_KEY`
  - deploy では不要です。CDK が `/martian-imperial-year-table/martian_api/mackerel_api_key` を作成し、値は AWS 側で別途設定します。

例:

```bash
npx cdk deploy \
  -c certificateArn=arn:aws:acm:us-east-1:123456789012:certificate/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
  -c hostedZoneDomainName=c4se.jp \
  -c hostedZoneId=Z1234567890ABC \
  -c mackerelDeploymentEnvironment=production \
  -c mackerelServiceVersion=$(git rev-parse HEAD) \
  -c siteAssetsPath=../dist \
  -c siteDomainName=martian-imperial-year-table.c4se.jp
```

## 依存關係の脆弱性

2026-11-17 時點で `aws-cdk-lib@2.277.0` に同梱される `minimatch@10.2.6` は、[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) の影響を受けます。惡意のある glob pattern による資源枯渴が問題で、CDK の synth・deploy 環境に影響する可能性があります。この專案で指定する asset 除外 pattern は固定値ですが、CDK 內部の全ての利用經路の安全性は確認できてゐません。

`aws-cdk-lib` が同梱する依存なので、`overrides` ではなく [AWS CDK の更新](https://github.com/aws/aws-cdk/releases)を追跡し、更新後に `npm audit --omit=dev` と synth を再確認します。修正まで殘存リスクがあります。

## 含まれるリソース

- 非公開 S3 バケット (靜的サイト配信元)
- Lambda Function (`packages/martian_api/src/index.ts` をエントリにバンドル)
- API Gateway HTTP API
- CloudFront ディストリビューション (`HTTPS` 強制)
- Route53 の A / AAAA Alias レコード
- `aws-s3-deployment` による `dist/` のアップロードと invalidation
