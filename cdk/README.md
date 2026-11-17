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
