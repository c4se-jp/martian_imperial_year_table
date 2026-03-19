import { SpanStatusCode, trace } from "@opentelemetry/api";
import { getWebAutoInstrumentations } from "@opentelemetry/auto-instrumentations-web";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http/build/esm/platform/browser";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchSpanProcessor, WebTracerProvider } from "@opentelemetry/sdk-trace-web";

const MACKEREL_OTLP_TRACES_URL = "https://otlp-vaxila.mackerelio.com/v1/traces";
const EXPORTER_URL_PATTERN = /^https:\/\/otlp-vaxila\.mackerelio\.com\/v1\/traces(?:[/?#]|$)/;
const TELEMETRY_STATE_KEY = "__martianUiTelemetryState";

type BrowserTelemetryConfig = {
  clientToken: string;
  deploymentEnvironment?: string;
  serviceNamespace: string;
  serviceName: string;
  serviceVersion?: string;
};

type TelemetryState = {
  enabled: boolean;
  provider?: WebTracerProvider;
  tracerName: string;
};

declare global {
  interface Window {
    __martianUiTelemetryState?: TelemetryState;
  }
}

function trimEnvValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed === "" ? undefined : trimmed;
}

function getTelemetryConfig(): BrowserTelemetryConfig | undefined {
  const clientToken = trimEnvValue(import.meta.env.VITE_MACKEREL_CLIENT_TOKEN);
  if (clientToken === undefined) {
    return undefined;
  }

  return {
    clientToken,
    deploymentEnvironment: trimEnvValue(import.meta.env.VITE_MACKEREL_DEPLOYMENT_ENVIRONMENT),
    serviceNamespace: "martian_imperial_year_table",
    serviceName: "martian_ui",
    serviceVersion: trimEnvValue(import.meta.env.VITE_MACKEREL_SERVICE_VERSION),
  };
}

function getPropagationTargets(): Array<RegExp | string> {
  const origin = window.location.origin.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return [new RegExp(`^${origin}(?:/|$)`), /^\//u];
}

function getTelemetryState(): TelemetryState | undefined {
  return window[TELEMETRY_STATE_KEY];
}

export function setupBrowserTelemetry() {
  if (typeof window === "undefined") {
    return;
  }

  if (getTelemetryState() !== undefined) {
    return;
  }

  const config = getTelemetryConfig();
  if (config === undefined) {
    window[TELEMETRY_STATE_KEY] = {
      enabled: false,
      tracerName: "martian_ui",
    };
    return;
  }

  const exporter = new OTLPTraceExporter({
    url: MACKEREL_OTLP_TRACES_URL,
    headers: {
      Accept: "application/json",
      "X-Mackerel-Client-Token": config.clientToken,
    },
  });

  const resourceAttributes: Record<string, string> = {
    "service.namespace": config.serviceNamespace,
    "service.name": config.serviceName,
  };
  if (config.serviceVersion !== undefined) {
    resourceAttributes["service.version"] = config.serviceVersion;
  }
  if (config.deploymentEnvironment !== undefined) {
    resourceAttributes["deployment.environment.name"] = config.deploymentEnvironment;
  }

  const provider = new WebTracerProvider({
    resource: resourceFromAttributes(resourceAttributes),
    spanProcessors: [
      new BatchSpanProcessor(exporter, {
        exportTimeoutMillis: 15_000,
        maxExportBatchSize: 10,
        maxQueueSize: 100,
        scheduledDelayMillis: 5_000,
      }),
    ],
  });

  provider.register();

  registerInstrumentations({
    instrumentations: [
      getWebAutoInstrumentations({
        "@opentelemetry/instrumentation-document-load": {
          enabled: true,
          ignoreNetworkEvents: true,
        },
        "@opentelemetry/instrumentation-fetch": {
          clearTimingResources: true,
          ignoreNetworkEvents: true,
          ignoreUrls: [EXPORTER_URL_PATTERN],
          propagateTraceHeaderCorsUrls: getPropagationTargets(),
        },
        "@opentelemetry/instrumentation-user-interaction": {
          enabled: true,
          eventNames: ["click", "submit"],
        },
        "@opentelemetry/instrumentation-xml-http-request": {
          clearTimingResources: true,
          ignoreNetworkEvents: true,
          ignoreUrls: [EXPORTER_URL_PATTERN],
          propagateTraceHeaderCorsUrls: getPropagationTargets(),
        },
      }),
    ],
  });

  const flush = () => {
    void provider.forceFlush().catch(() => {});
  };
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flush();
    }
  });

  window[TELEMETRY_STATE_KEY] = {
    enabled: true,
    provider,
    tracerName: config.serviceName,
  };
}

export function trackRouteTransition(path: string, navigationType: string) {
  if (typeof window === "undefined") {
    return;
  }

  const state = getTelemetryState();
  if (state?.enabled !== true) {
    return;
  }

  const tracer = trace.getTracer(state.tracerName);
  const span = tracer.startSpan("route transition", {
    attributes: {
      "app.route": path,
      "code.function.name": "trackRouteTransition",
      "navigation.type": navigationType,
      "url.path": path,
    },
  });

  try {
    span.setStatus({ code: SpanStatusCode.OK });
  } catch (error) {
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    span.setStatus({ code: SpanStatusCode.ERROR });
  } finally {
    span.end();
  }
}
