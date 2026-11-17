const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");
const { App } = require("aws-cdk-lib");
const { Template } = require("aws-cdk-lib/assertions");
const { MartianSiteStack } = require("../lib/martian-site-stack.ts");

test("全 behavior に同じセキュリティヘッダを適用する", () => {
  const stack = new MartianSiteStack(new App(), "TestStack", {
    certificateArn: "arn:aws:acm:us-east-1:123456789012:certificate/00000000-0000-0000-0000-000000000000",
    hostedZoneDomainName: "example.com",
    hostedZoneId: "Z1234567890",
    siteAssetsPath: path.resolve(__dirname, "../../dist"),
    siteDomainName: "example.com",
  });
  const template = Template.fromStack(stack).toJSON();
  const resources = template.Resources;
  const policies = Object.entries(resources).filter(([, resource]) => resource.Type === "AWS::CloudFront::ResponseHeadersPolicy");
  assert.equal(policies.length, 1);
  const [policyId, policy] = policies[0];
  const config = policy.Properties.ResponseHeadersPolicyConfig;
  assert.deepEqual(config.SecurityHeadersConfig, {
    ContentTypeOptions: { Override: true },
    FrameOptions: { FrameOption: "DENY", Override: true },
    ReferrerPolicy: { ReferrerPolicy: "strict-origin-when-cross-origin", Override: true },
    StrictTransportSecurity: { AccessControlMaxAgeSec: 31536000, Override: true },
  });
  assert.equal(config.CorsConfig, undefined);
  const [header] = config.CustomHeadersConfig.Items;
  assert.equal(config.CustomHeadersConfig.Items.length, 1);
  assert.equal(header.Header, "Content-Security-Policy-Report-Only");
  assert.equal(header.Override, true);
  assert.equal(header.Value, [
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
  ].join("; "));

  const distributions = Object.values(resources).filter((resource) => resource.Type === "AWS::CloudFront::Distribution");
  assert.equal(distributions.length, 1);
  const distribution = distributions[0].Properties.DistributionConfig;
  assert.deepEqual(distribution.DefaultCacheBehavior.ResponseHeadersPolicyId, { Ref: policyId });
  assert.deepEqual(distribution.CacheBehaviors.map((behavior) => behavior.PathPattern).sort(), ["api/*", "graphql", "mcp"]);
  for (const behavior of distribution.CacheBehaviors) {
    assert.deepEqual(behavior.ResponseHeadersPolicyId, { Ref: policyId });
  }
});
