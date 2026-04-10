const GOOGLE_ANALYTICS_SCRIPT_ID = "martian-ui-google-analytics";
const GOOGLE_ANALYTICS_STATE_KEY = "__martianUiGoogleAnalyticsState";
const GOOGLE_ANALYTICS_DATA_LAYER_KEY = "dataLayer";

type GoogleAnalyticsCommand = "config" | "consent" | "event" | "js";

type GoogleAnalyticsFunction = {
  (...args: [GoogleAnalyticsCommand, ...unknown[]]): void;
};

type GoogleAnalyticsState = {
  enabled: boolean;
  measurementId?: string;
  lastTrackedPath?: string;
};

declare global {
  interface Window {
    __martianUiGoogleAnalyticsState?: GoogleAnalyticsState;
    dataLayer?: unknown[];
    gtag?: GoogleAnalyticsFunction;
  }
}

function trimEnvValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed === "" ? undefined : trimmed;
}

function getMeasurementId(): string | undefined {
  return trimEnvValue(import.meta.env.VITE_GA_MEASUREMENT_ID);
}

function getGoogleAnalyticsState(): GoogleAnalyticsState | undefined {
  return window[GOOGLE_ANALYTICS_STATE_KEY];
}

function initializeGoogleAnalytics(measurementId: string) {
  window[GOOGLE_ANALYTICS_DATA_LAYER_KEY] ??= [];
  window.gtag = function gtag(..._args: [GoogleAnalyticsCommand, ...unknown[]]) {
    // Google 推奨 snippet と同じく arguments object を dataLayer に積む。
    window[GOOGLE_ANALYTICS_DATA_LAYER_KEY]?.push(arguments);
  } as GoogleAnalyticsFunction;

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: false,
  });
}

function ensureGoogleAnalyticsScript(measurementId: string) {
  if (document.getElementById(GOOGLE_ANALYTICS_SCRIPT_ID) !== null) {
    return;
  }

  const script = document.createElement("script");
  script.id = GOOGLE_ANALYTICS_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.append(script);
}

function buildCurrentPath() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function setupGoogleAnalytics() {
  if (typeof window === "undefined") {
    return;
  }

  if (getGoogleAnalyticsState() !== undefined) {
    return;
  }

  const measurementId = getMeasurementId();
  if (measurementId === undefined) {
    window[GOOGLE_ANALYTICS_STATE_KEY] = {
      enabled: false,
    };
    return;
  }

  initializeGoogleAnalytics(measurementId);
  ensureGoogleAnalyticsScript(measurementId);

  window[GOOGLE_ANALYTICS_STATE_KEY] = {
    enabled: true,
    measurementId,
  };
}

export function trackPageView(path: string = buildCurrentPath()) {
  if (typeof window === "undefined") {
    return;
  }

  const state = getGoogleAnalyticsState();
  if (state?.enabled !== true || state.measurementId === undefined || window.gtag === undefined) {
    return;
  }

  if (state.lastTrackedPath === path) {
    return;
  }

  state.lastTrackedPath = path;

  window.gtag("event", "page_view", {
    send_to: state.measurementId,
    page_location: window.location.href,
    page_path: path,
    page_title: document.title,
  });
}
