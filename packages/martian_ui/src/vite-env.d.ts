/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_MACKEREL_CLIENT_TOKEN?: string;
  readonly VITE_MACKEREL_DEPLOYMENT_ENVIRONMENT?: string;
  readonly VITE_MACKEREL_SERVICE_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
