import { serve } from "@hono/node-server";
import { app } from "./app.js";

const port = Number(process.env.PORT ?? 3000);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info: { port: number }) => {
    console.log(`martian_api listening on http://localhost:${info.port}`);
  },
);
