#!/usr/bin/env node
import * as path from "node:path";
import * as cdk from "aws-cdk-lib";
import { MartianSiteStack } from "../lib/martian-site-stack";

const app = new cdk.App();

const hostedZoneDomainName =
  app.node.tryGetContext("hostedZoneDomainName") ?? process.env.HOSTED_ZONE_DOMAIN_NAME ?? "c4se.jp";

const hostedZoneId = app.node.tryGetContext("hostedZoneId") ?? process.env.HOSTED_ZONE_ID;
const certificateArn = app.node.tryGetContext("certificateArn") ?? process.env.CERTIFICATE_ARN;

if (!hostedZoneId) {
  throw new Error("hostedZoneId (or HOSTED_ZONE_ID) is required.");
}
if (!certificateArn) {
  throw new Error("certificateArn (or CERTIFICATE_ARN) is required.");
}

const siteAssetsPath =
  app.node.tryGetContext("siteAssetsPath") ?? process.env.SITE_ASSETS_PATH ?? path.resolve(__dirname, "../../dist");

const siteDomainName =
  app.node.tryGetContext("siteDomainName") ?? process.env.SITE_DOMAIN_NAME ?? "martian-imperial-year-table.c4se.jp";

new MartianSiteStack(app, "MartianImperialYearTableSiteStack", {
  siteDomainName,
  certificateArn,
  hostedZoneId,
  hostedZoneDomainName,
  siteAssetsPath,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
