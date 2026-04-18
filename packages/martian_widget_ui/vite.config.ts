import path from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { defineConfig } from "vite";

const widgetEntries = [
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

function readAssetIfExists(assetPath: string): string | undefined {
  if (!existsSync(assetPath)) {
    return undefined;
  }
  return readFileSync(assetPath, "utf8");
}

function inlineAsset(html: string, assetPath: string, tagBuilder: (content: string) => string): string {
  const assetContent = readAssetIfExists(assetPath);
  if (assetContent === undefined) {
    return html;
  }

  const filename = path.basename(assetPath);
  return html
    .replace(
      new RegExp(
        `<script type="module"[^>]*src="(?:\\.\\/|\\.\\.\\/\\.\\.\\/)?${filename.replace(".", "\\.")}"></script>`,
      ),
      tagBuilder(assetContent),
    )
    .replace(
      new RegExp(
        `<link rel="stylesheet"[^>]*href="(?:\\.\\/|\\.\\.\\/\\.\\.\\/)?${filename.replace(".", "\\.")}"[^>]*>`,
      ),
      tagBuilder(assetContent),
    );
}

export default defineConfig({
  base: "./",
  resolve: {
    alias: [
      { find: "react-dom/client", replacement: "preact/compat/client" },
      { find: "react-dom/test-utils", replacement: "preact/test-utils" },
      { find: "react-dom", replacement: "preact/compat" },
      { find: "react/jsx-dev-runtime", replacement: "preact/jsx-dev-runtime" },
      { find: "react/jsx-runtime", replacement: "preact/jsx-runtime" },
      { find: "react", replacement: "preact/compat" },
    ],
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
    {
      name: "copy-widget-html-to-dist-root",
      closeBundle() {
        for (const entry of widgetEntries) {
          const srcHtmlPath = path.resolve(__dirname, `../../dist/widget/src/widget/${entry.name}.html`);
          const destHtmlPath = path.resolve(__dirname, `../../dist/widget/${entry.name}.html`);
          const widgetDirPath = path.resolve(__dirname, "../../dist/widget");
          const entryJsPath = path.resolve(widgetDirPath, `${entry.name}.js`);
          const entryCssPath = path.resolve(widgetDirPath, `${entry.name}.css`);
          const sharedChunkPath = path.resolve(widgetDirPath, sharedWidgetAssets.chunk);
          const sharedCssPath = path.resolve(widgetDirPath, sharedWidgetAssets.css);
          let html = readFileSync(srcHtmlPath, "utf8")
            .replaceAll(`../../${entry.name}.js`, `./${entry.name}.js`)
            .replaceAll(`../../${entry.name}.css`, `./${entry.name}.css`)
            .replaceAll(`../../${sharedWidgetAssets.chunk}`, `./${sharedWidgetAssets.chunk}`)
            .replaceAll(`../../${sharedWidgetAssets.css}`, `./${sharedWidgetAssets.css}`);

          html = inlineAsset(html, entryCssPath, (content) => `<style>\n${content}\n</style>`);
          html = inlineAsset(html, sharedCssPath, (content) => `<style>\n${content}\n</style>`);
          html = inlineAsset(html, sharedChunkPath, (content) => `<script type="module">\n${content}\n</script>`);
          html = inlineAsset(html, entryJsPath, (content) => `<script type="module">\n${content}\n</script>`);

          mkdirSync(path.dirname(destHtmlPath), { recursive: true });
          writeFileSync(destHtmlPath, html, "utf8");
        }
      },
    },
  ],
});
