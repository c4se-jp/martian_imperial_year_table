# martian_widget_ui

MCP application 向けの帝國火星曆 widget frontend

## 配信されるfile

`dist/widget/` directory 以下の file。MCP application に對應した application から參照され、`https://martian-imperial-year-table.c4se.jp/widget/〜.html` からも配信されます。

## npm run build

`npm run build` により `dist/widget/` directory 以下の file が Vite で生成されます。

## framework

この package は Preact を利用します。`@modelcontextprotocol/ext-apps/react` など React 前提の依存 library は compat layer 經由で使用します。
