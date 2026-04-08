import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { setupGoogleAnalytics } from "./lib/googleAnalytics";
import { setupBrowserTelemetry } from "./lib/telemetry";
import "./styles/main.css";

setupGoogleAnalytics();
setupBrowserTelemetry();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
