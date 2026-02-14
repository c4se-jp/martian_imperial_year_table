import * as path from "node:path";
import { CfnOutput, Duration, Fn, RemovalPolicy, Stack, StackProps, Tags } from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigwv2Integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

export interface MartianSiteStackProps extends StackProps {
  certificateArn: string;
  hostedZoneDomainName: string;
  hostedZoneId: string;
  siteAssetsPath?: string;
  siteDomainName: string;
}

export class MartianSiteStack extends Stack {
  constructor(scope: Construct, id: string, props: MartianSiteStackProps) {
    super(scope, id, props);
    Tags.of(this).add("Service", "martian-imperial-year-table");

    const siteAssetsPath = props.siteAssetsPath ?? path.resolve(__dirname, "../../dist");

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.hostedZoneDomainName,
    });

    const certificate = acm.Certificate.fromCertificateArn(this, "SiteCertificate", props.certificateArn);

    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      autoDeleteObjects: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,
      versioned: true,
    });

    const apiLambda = new lambdaNodejs.NodejsFunction(this, "ApiLambda", {
      bundling: {
        commandHooks: {
          afterBundling(): string[] {
            return [];
          },
          beforeBundling(inputDir: string): string[] {
            return [`npm --prefix "${inputDir}" run -w imperial_calendar build`];
          },
          beforeInstall(): string[] {
            return [];
          },
        },
        format: lambdaNodejs.OutputFormat.ESM,
        target: "node22",
      },
      depsLockFilePath: path.resolve(__dirname, "../../package-lock.json"),
      entry: path.resolve(__dirname, "../../packages/martian_api/src/index.ts"),
      handler: "handler",
      memorySize: 256,
      projectRoot: path.resolve(__dirname, "../.."),
      runtime: lambda.Runtime.NODEJS_22_X,
      timeout: Duration.seconds(10),
    });

    const httpApi = new apigwv2.HttpApi(this, "ImperialCalendarHttpApi", {
      createDefaultStage: true,
      defaultIntegration: new apigwv2Integrations.HttpLambdaIntegration("DefaultLambdaIntegration", apiLambda),
    });

    const apiOriginDomainName = Fn.select(2, Fn.split("/", httpApi.apiEndpoint));

    const spaRewriteFunction = new cloudfront.Function(this, "SpaRewriteFunction", {
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var uri = request.uri || "/";

  if (uri.startsWith("/api/")) {
    return request;
  }

  if (uri.endsWith("/")) {
    request.uri = uri + "index.html";
    return request;
  }

  if (uri.indexOf(".") === -1) {
    request.uri = "/index.html";
  }

  return request;
}
`),
    });

    const distribution = new cloudfront.Distribution(this, "SiteDistribution", {
      certificate,
      comment: "martian_imperial_year_table static site",
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        functionAssociations: [
          {
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            function: spaRewriteFunction,
          },
        ],
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        "api/*": {
          origin: new origins.HttpOrigin(apiOriginDomainName),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
      domainNames: [props.siteDomainName],
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
    });

    new s3deploy.BucketDeployment(this, "DeploySiteAssets", {
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ["/*"],
      prune: true,
      sources: [s3deploy.Source.asset(siteAssetsPath)],
    });

    new route53.ARecord(this, "SiteAliasARecord", {
      recordName: props.siteDomainName,
      target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(distribution)),
      zone: hostedZone,
    });

    new route53.AaaaRecord(this, "SiteAliasAaaaRecord", {
      recordName: props.siteDomainName,
      target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(distribution)),
      zone: hostedZone,
    });

    new CfnOutput(this, "CloudFrontDomainName", {
      value: distribution.distributionDomainName,
    });

    new CfnOutput(this, "SiteBucketName", {
      value: siteBucket.bucketName,
    });

    new CfnOutput(this, "HttpApiId", {
      value: httpApi.apiId,
    });

    new CfnOutput(this, "ApiBaseUrl", {
      value: `https://${props.siteDomainName}/api`,
    });
  }
}
