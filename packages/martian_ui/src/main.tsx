import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { setupBrowserTelemetry } from "./lib/telemetry";
import "./styles/main.css";

setupBrowserTelemetry();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
