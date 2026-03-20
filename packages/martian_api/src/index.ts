import { handle } from "hono/aws-lambda";
import { startTelemetry } from "./telemetry.js";
import { app } from "./app.js";

const honoHandler = handle(app);
let telemetryStartPromise: Promise<void> | undefined;

function ensureTelemetryStarted(): Promise<void> {
  telemetryStartPromise ??= startTelemetry();
  return telemetryStartPromise;
}

export async function handler(
  ...args: Parameters<typeof honoHandler>
): Promise<Awaited<ReturnType<typeof honoHandler>>> {
  await ensureTelemetryStarted();
  return honoHandler(...args);
}
