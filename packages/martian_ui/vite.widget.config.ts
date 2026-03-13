import path from "node:path";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
      input: {
        "chatgpt-widget": path.resolve(__dirname, "src/widget/chatgpt-widget.html"),
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "chatgpt-widget.css";
          }
          return "[name][extname]";
        },
        chunkFileNames: "chatgpt-widget-chunk.js",
        entryFileNames: "chatgpt-widget.js",
        inlineDynamicImports: true,
      },
    },
  },
  plugins: [
    react(),
    {
      name: "copy-widget-html-to-dist-root",
      closeBundle() {
        const srcHtmlPath = path.resolve(__dirname, "../../dist/widget/src/widget/chatgpt-widget.html");
        const destHtmlPath = path.resolve(__dirname, "../../dist/widget/chatgpt-widget.html");
        const html = readFileSync(srcHtmlPath, "utf8")
          .replaceAll("../../chatgpt-widget.js", "./chatgpt-widget.js")
          .replaceAll("../../chatgpt-widget.css", "./chatgpt-widget.css");
        mkdirSync(path.dirname(destHtmlPath), { recursive: true });
        writeFileSync(destHtmlPath, html, "utf8");
      },
    },
  ],
});
