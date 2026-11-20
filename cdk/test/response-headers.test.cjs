const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { App } = require("aws-cdk-lib");
const { Template } = require("aws-cdk-lib/assertions");
const { MartianSiteStack } = require("../lib/martian-site-stack.ts");

test("全 behavior のヘッダと Lambda bundle の起動を檢證する", () => {
  const app = new App();
  const stack = new MartianSiteStack(app, "TestStack", {
    certificateArn: "arn:aws:acm:us-east-1:123456789012:certificate/00000000-0000-0000-0000-000000000000",
    hostedZoneDomainName: "example.com",
    hostedZoneId: "Z1234567890",
    siteAssetsPath: path.resolve(__dirname, "../../dist"),
    siteDomainName: "example.com",
  });
  const template = Template.fromStack(stack).toJSON();
  const resources = template.Resources;
  const stages = Object.values(resources).filter((resource) => resource.Type === "AWS::ApiGatewayV2::Stage");
  assert.equal(stages.length, 1);
  assert.equal(stages[0].Properties.StageName, "$default");
  assert.deepEqual(stages[0].Properties.DefaultRouteSettings, {
    ThrottlingBurstLimit: 20,
    ThrottlingRateLimit: 10,
  });
  const apiFunctions = Object.entries(resources).filter(
    ([id, resource]) => id.startsWith("ApiLambda") && resource.Type === "AWS::Lambda::Function",
  );
  assert.equal(apiFunctions.length, 1);
  assert.equal(apiFunctions[0][1].Properties.ReservedConcurrentExecutions, 10);
  const canaries = Object.values(resources).filter((resource) => resource.Type === "AWS::Synthetics::Canary");
  assert.equal(canaries.length, 1);
  assert.equal(canaries[0].Properties.Name, "imdt-transform-check");
  assert.equal(canaries[0].Properties.RunConfig.TimeoutInSeconds, 300);
  const policies = Object.entries(resources).filter(([, resource]) => resource.Type === "AWS::CloudFront::ResponseHeadersPolicy");
  assert.equal(policies.length, 1);
  const [policyId, policy] = policies[0];
  const config = policy.Properties.ResponseHeadersPolicyConfig;
  const expectedCsp = [
    "default-src 'self'",
    "script-src 'self' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com",
    "connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com https://otlp-vaxila.mackerelio.com",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
  ].join("; ");
  assert.deepEqual(config.SecurityHeadersConfig, {
    ContentSecurityPolicy: { ContentSecurityPolicy: expectedCsp, Override: true },
    ContentTypeOptions: { Override: true },
    FrameOptions: { FrameOption: "DENY", Override: true },
    ReferrerPolicy: { ReferrerPolicy: "strict-origin-when-cross-origin", Override: true },
    StrictTransportSecurity: { AccessControlMaxAgeSec: 31536000, Override: true },
  });
  assert.equal(config.CorsConfig, undefined);
  assert.equal(config.CustomHeadersConfig, undefined);

  const distributions = Object.values(resources).filter((resource) => resource.Type === "AWS::CloudFront::Distribution");
  assert.equal(distributions.length, 1);
  const distribution = distributions[0].Properties.DistributionConfig;
  assert.deepEqual(distribution.DefaultCacheBehavior.ResponseHeadersPolicyId, { Ref: policyId });
  assert.deepEqual(distribution.CacheBehaviors.map((behavior) => behavior.PathPattern).sort(), ["api/*", "graphql", "mcp"]);
  for (const behavior of distribution.CacheBehaviors) {
    assert.deepEqual(behavior.ResponseHeadersPolicyId, { Ref: policyId });
  }

  const bundlePaths = fs.readdirSync(app.outdir)
    .filter((name) => name.startsWith("asset."))
    .map((name) => path.join(app.outdir, name, "index.js"))
    .filter((name) => fs.existsSync(name));
  assert.equal(bundlePaths.length, 1);
  const env = { ...process.env, NODE_PATH: path.resolve(__dirname, "../../node_modules") };
  delete env.MACKEREL_API_KEY;
  delete env.MACKEREL_API_KEY_SECRET_ARN;
  execFileSync(process.execPath, [path.join(__dirname, "lambda-smoke.cjs"), bundlePaths[0]], {
    env,
    stdio: "inherit",
  });
});
