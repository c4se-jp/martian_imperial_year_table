import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            imperial_calendar: path.resolve(__dirname, "../imperial_calendar/src/index.ts"),
            calendar_svg: path.resolve(__dirname, "../calendar_svg/src/index.ts"),
        },
    },
    server: {
        host: "0.0.0.0",
        port: 5173,
    },
});
