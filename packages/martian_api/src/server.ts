import { serve } from "@hono/node-server";
import { startTelemetry } from "./telemetry.js";

const port = Number(process.env.PORT ?? 3000);

startTelemetry();

const { app } = await import("./app.js");

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info: { port: number }) => {
    console.log(`martian_api listening on http://localhost:${info.port}`);
  },
);
