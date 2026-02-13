# AWS CDK (S3 + CloudFront)

このディレクトリは、`martian-imperial-year-table.c4se.jp` を `S3 + CloudFront` 構成で配信するための CDK です。

## 前提

- AWS CLI 設定濟み (`aws configure`)
- `cdk bootstrap` 濟み (對象アカウント/リージョン)
- CloudFront 用 ACM 証明書を `us-east-1` で事前に作成しておく
- 事前に `npm run build` でリポジトリ直下の `dist/` を生成しておく

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
- `siteAssetsPath` (context または `SITE_ASSETS_PATH`)
- `siteDomainName` (context または `SITE_DOMAIN_NAME`)

例:

```bash
npx cdk deploy \
  -c certificateArn=arn:aws:acm:us-east-1:123456789012:certificate/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
  -c hostedZoneDomainName=c4se.jp \
  -c hostedZoneId=Z1234567890ABC \
  -c siteAssetsPath=../dist \
  -c siteDomainName=martian-imperial-year-table.c4se.jp
```

## 含まれるリソース

- 非公開 S3 バケット (靜的サイト配信元)
- CloudFront ディストリビューション (`HTTPS` 強制)
- Route53 の A / AAAA Alias レコード
- `aws-s3-deployment` による `dist/` のアップロードと invalidation
