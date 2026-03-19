import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { SpanStatusCode, context, trace, type Attributes, type Span } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { hostDetector, processDetector, resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_NAMESPACE, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";

const MACKEREL_OTLP_TRACES_URL = "https://otlp-vaxila.mackerelio.com/v1/traces";
const SERVICE_NAMESPACE = "martian_imperial_year_table";
const SERVICE_NAME = "martian_api";

type TelemetryConfig = {
  apiKey: string;
  deploymentEnvironment?: string;
  serviceVersion?: string;
};

type TelemetryState = {
  enabled: boolean;
  pendingStart?: Promise<void>;
  sdk?: NodeSDK;
  started: boolean;
  shutdownHandlersRegistered: boolean;
};

declare global {
  // eslint-disable-next-line no-var
  var __martianApiTelemetryState: TelemetryState | undefined;
}

function trimEnvValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed === "" ? undefined : trimmed;
}

function getTelemetryState(): TelemetryState {
  globalThis.__martianApiTelemetryState ??= {
    enabled: false,
    started: false,
    shutdownHandlersRegistered: false,
  };
  return globalThis.__martianApiTelemetryState;
}

function getTelemetryConfig(): TelemetryConfig | undefined {
  const apiKey = trimEnvValue(process.env.MACKEREL_API_KEY);
  if (apiKey === undefined) {
    return undefined;
  }

  return {
    apiKey,
    deploymentEnvironment: trimEnvValue(process.env.MACKEREL_DEPLOYMENT_ENVIRONMENT),
    serviceVersion: trimEnvValue(process.env.MACKEREL_SERVICE_VERSION),
  };
}

async function loadSecretString(secretId: string): Promise<string | undefined> {
  const client = new SecretsManagerClient({});
  const response = await client.send(new GetSecretValueCommand({ SecretId: secretId }));
  const secretString = trimEnvValue(response.SecretString);
  if (secretString === undefined) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(secretString) as { MACKEREL_API_KEY?: unknown };
    if (typeof parsed.MACKEREL_API_KEY === "string") {
      return trimEnvValue(parsed.MACKEREL_API_KEY);
    }
  } catch {
    return secretString;
  }

  return secretString;
}

async function getTelemetryConfigFromEnvironment(): Promise<TelemetryConfig | undefined> {
  const directApiKey = trimEnvValue(process.env.MACKEREL_API_KEY);
  if (directApiKey !== undefined) {
    return {
      apiKey: directApiKey,
      deploymentEnvironment: trimEnvValue(process.env.MACKEREL_DEPLOYMENT_ENVIRONMENT),
      serviceVersion: trimEnvValue(process.env.MACKEREL_SERVICE_VERSION),
    };
  }

  const secretId = trimEnvValue(process.env.MACKEREL_API_KEY_SECRET_ARN);
  if (secretId === undefined) {
    return undefined;
  }

  const secretApiKey = await loadSecretString(secretId).catch(() => undefined);
  if (secretApiKey === undefined) {
    return undefined;
  }

  return {
    apiKey: secretApiKey,
    deploymentEnvironment: trimEnvValue(process.env.MACKEREL_DEPLOYMENT_ENVIRONMENT),
    serviceVersion: trimEnvValue(process.env.MACKEREL_SERVICE_VERSION),
  };
}

function buildAttributes(config: TelemetryConfig): Record<string, string> {
  const attributes: Record<string, string> = {
    [ATTR_SERVICE_NAMESPACE]: SERVICE_NAMESPACE,
    [ATTR_SERVICE_NAME]: SERVICE_NAME,
  };

  if (config.serviceVersion !== undefined) {
    attributes[ATTR_SERVICE_VERSION] = config.serviceVersion;
  }

  if (config.deploymentEnvironment !== undefined) {
    attributes["deployment.environment.name"] = config.deploymentEnvironment;
  }

  return attributes;
}

function registerShutdownHandlers(sdk: NodeSDK) {
  const state = getTelemetryState();
  if (state.shutdownHandlersRegistered) {
    return;
  }

  const shutdown = async () => {
    await sdk.shutdown().catch(() => {});
  };

  process.once("SIGINT", () => {
    void shutdown().finally(() => {
      process.exit(0);
    });
  });
  process.once("SIGTERM", () => {
    void shutdown().finally(() => {
      process.exit(0);
    });
  });
  process.once("beforeExit", () => {
    void shutdown();
  });

  state.shutdownHandlersRegistered = true;
}

export async function startTelemetry() {
  const state = getTelemetryState();
  if (state.started || state.pendingStart !== undefined) {
    await state.pendingStart;
    return;
  }

  state.pendingStart = (async () => {
    const config = await getTelemetryConfigFromEnvironment();
    if (config === undefined) {
      state.started = true;
      return;
    }

    const sdk = new NodeSDK({
      instrumentations: [
        getNodeAutoInstrumentations({
          "@opentelemetry/instrumentation-fs": {
            enabled: false,
          },
        }),
      ],
      resource: resourceFromAttributes(buildAttributes(config)),
      resourceDetectors: [processDetector, hostDetector],
      traceExporter: new OTLPTraceExporter({
        headers: {
          Accept: "*/*",
          "Mackerel-Api-Key": config.apiKey,
        },
        timeoutMillis: 15_000,
        url: MACKEREL_OTLP_TRACES_URL,
      }),
    });
    sdk.start();

    state.enabled = true;
    state.sdk = sdk;
    state.started = true;
    registerShutdownHandlers(sdk);
  })();

  await state.pendingStart.finally(() => {
    state.pendingStart = undefined;
  });
}

export async function flushTelemetry() {
  const state = getTelemetryState();
  if (!state.enabled || state.sdk === undefined) {
    return;
  }
  const tracerProvider = (state.sdk as unknown as { _tracerProvider?: { forceFlush?: () => Promise<void> } })
    ._tracerProvider;
  await tracerProvider?.forceFlush?.().catch(() => {});
}

function normalizeException(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
}

export function recordError(error: unknown, span?: Span) {
  const currentSpan = span ?? trace.getSpan(context.active());
  if (currentSpan === undefined) {
    return;
  }

  const exception = normalizeException(error);
  currentSpan.recordException(exception);
  currentSpan.setStatus({
    code: SpanStatusCode.ERROR,
    message: exception.message,
  });
}

export async function runWithSpan<T>(name: string, attributes: Attributes, fn: () => T | Promise<T>): Promise<T> {
  return trace.getTracer(SERVICE_NAME).startActiveSpan(name, { attributes }, async (span) => {
    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      recordError(error, span);
      throw error;
    } finally {
      span.end();
    }
  });
}
