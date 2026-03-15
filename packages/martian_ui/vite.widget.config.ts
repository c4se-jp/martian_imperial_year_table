import path from "node:path";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const widgetEntries = [
  {
    name: "datetime-conversion-widget",
    html: path.resolve(__dirname, "src/widget/datetime-conversion-widget.html"),
    js: "datetime-conversion-entry.tsx",
  },
  {
    name: "current-imperial-datetime-widget",
    html: path.resolve(__dirname, "src/widget/current-imperial-datetime-widget.html"),
    js: "current-imperial-datetime-entry.tsx",
  },
];

const sharedWidgetAssets = {
  chunk: "widgetHost-chunk.js",
  css: "widgetHost.css",
};

export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      imperial_calendar: path.resolve(__dirname, "../imperial_calendar/src/index.ts"),
      calendar_svg: path.resolve(__dirname, "../calendar_svg/src/index.ts"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: "../../dist/widget",
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(widgetEntries.map((entry) => [entry.name, entry.html])),
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            const entry = widgetEntries.find((candidate) => assetInfo.names.includes(candidate.js));
            if (entry) {
              return `${entry.name}.css`;
            }
          }
          return "[name][extname]";
        },
        chunkFileNames: "[name]-chunk.js",
        entryFileNames: "[name].js",
      },
    },
  },
  plugins: [
    react(),
    {
      name: "copy-widget-html-to-dist-root",
      closeBundle() {
        for (const entry of widgetEntries) {
          const srcHtmlPath = path.resolve(__dirname, `../../dist/widget/src/widget/${entry.name}.html`);
          const destHtmlPath = path.resolve(__dirname, `../../dist/widget/${entry.name}.html`);
          const html = readFileSync(srcHtmlPath, "utf8")
            .replaceAll(`../../${entry.name}.js`, `./${entry.name}.js`)
            .replaceAll(`../../${sharedWidgetAssets.chunk}`, `./${sharedWidgetAssets.chunk}`)
            .replaceAll(`../../${sharedWidgetAssets.css}`, `./${sharedWidgetAssets.css}`);
          mkdirSync(path.dirname(destHtmlPath), { recursive: true });
          writeFileSync(destHtmlPath, html, "utf8");
        }
      },
    },
  ],
});
