import { SpanStatusCode, trace, type Span } from "@opentelemetry/api";
import { getWebAutoInstrumentations } from "@opentelemetry/auto-instrumentations-web";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchSpanProcessor, TraceIdRatioBasedSampler, WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_NAMESPACE, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";

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
  pendingRouteTransition?: {
    navigationType: string;
    path: string;
    span: Span;
  };
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

function buildPathname(url: string | URL | null | undefined): string {
  if (url === undefined || url === null || url === "") {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  }

  const resolvedUrl = new URL(String(url), window.location.href);
  return `${resolvedUrl.pathname}${resolvedUrl.search}${resolvedUrl.hash}`;
}

function startRouteTransition(path: string, navigationType: string) {
  const state = getTelemetryState();
  if (state?.enabled !== true) {
    return;
  }

  if (state.pendingRouteTransition !== undefined) {
    state.pendingRouteTransition.span.setAttribute("route.transition.interrupted", true);
    state.pendingRouteTransition.span.setStatus({ code: SpanStatusCode.ERROR });
    state.pendingRouteTransition.span.end();
  }

  const tracer = trace.getTracer(state.tracerName);
  const span = tracer.startSpan("route transition", {
    attributes: {
      "app.route": path,
      "navigation.type": navigationType,
      "url.path": path,
    },
  });

  state.pendingRouteTransition = {
    navigationType,
    path,
    span,
  };
}

function installRouteTransitionHooks() {
  const originalPushState = window.history.pushState.bind(window.history);
  const originalReplaceState = window.history.replaceState.bind(window.history);

  window.history.pushState = function pushState(data: unknown, unused: string, url?: string | URL | null): void {
    startRouteTransition(buildPathname(url), "PUSH");
    originalPushState(data, unused, url);
  };

  window.history.replaceState = function replaceState(data: unknown, unused: string, url?: string | URL | null): void {
    startRouteTransition(buildPathname(url), "REPLACE");
    originalReplaceState(data, unused, url);
  };

  window.addEventListener("popstate", () => {
    startRouteTransition(buildPathname(window.location.href), "POP");
  });
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
    [ATTR_SERVICE_NAMESPACE]: config.serviceNamespace,
    [ATTR_SERVICE_NAME]: config.serviceName,
  };
  if (config.serviceVersion !== undefined) {
    resourceAttributes[ATTR_SERVICE_VERSION] = config.serviceVersion;
  }
  if (config.deploymentEnvironment !== undefined) {
    resourceAttributes["deployment.environment.name"] = config.deploymentEnvironment;
  }

  const provider = new WebTracerProvider({
    resource: resourceFromAttributes(resourceAttributes),
    sampler: new TraceIdRatioBasedSampler(1.0),
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

  installRouteTransitionHooks();
}

export function finishRouteTransition(path: string, navigationType: string) {
  if (typeof window === "undefined") {
    return;
  }

  const state = getTelemetryState();
  if (state?.enabled !== true) {
    return;
  }

  const pendingRouteTransition = state.pendingRouteTransition;
  if (pendingRouteTransition === undefined) {
    return;
  }

  try {
    pendingRouteTransition.span.setAttribute("app.route.committed", path);
    pendingRouteTransition.span.setAttribute("navigation.type.committed", navigationType);
    pendingRouteTransition.span.setStatus({ code: SpanStatusCode.OK });
  } catch (error) {
    pendingRouteTransition.span.recordException(error instanceof Error ? error : new Error(String(error)));
    pendingRouteTransition.span.setStatus({ code: SpanStatusCode.ERROR });
  } finally {
    pendingRouteTransition.span.end();
    state.pendingRouteTransition = undefined;
  }
}
