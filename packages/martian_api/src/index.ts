import { startTelemetry } from "./telemetry.js";
import { handle } from "hono/aws-lambda";

startTelemetry();

const { app } = await import("./app.js");

export const handler = handle(app);
