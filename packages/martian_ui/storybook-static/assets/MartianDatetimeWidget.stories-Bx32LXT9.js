import { r as o } from "./iframe-TLNNhryC.js";
import "./preload-helper-PPVm8Dsz.js";
var x = { exports: {} },
  c = {};
var b;
function M() {
  if (b) return c;
  b = 1;
  var n = Symbol.for("react.transitional.element"),
    a = Symbol.for("react.fragment");
  function i(m, r, s) {
    var l = null;
    if ((s !== void 0 && (l = "" + s), r.key !== void 0 && (l = "" + r.key), "key" in r)) {
      s = {};
      for (var u in r) u !== "key" && (s[u] = r[u]);
    } else s = r;
    return ((r = s.ref), { $$typeof: n, type: m, key: l, ref: r !== void 0 ? r : null, props: s });
  }
  return ((c.Fragment = a), (c.jsx = i), (c.jsxs = i), c);
}
var w;
function P() {
  return (w || ((w = 1), (x.exports = M())), x.exports);
}
var e = P();
function A(n, a) {
  return Promise.resolve({
    structuredContent: {
      mode:
        n === "convert_gregorian_to_imperial_datetime"
          ? "convert_gregorian_to_imperial"
          : n === "get_current_imperial_datetime"
            ? "get_current_imperial"
            : "convert_imperial_to_gregorian",
      request: a,
      error: "ローカルプレビューではMCP接続の代わりにモックを返しています。",
    },
    isError: !0,
  });
}
function f({ callTool: n, initialResult: a }) {
  const [i, m] = o.useState("g2i"),
    [r, s] = o.useState(a),
    [l, u] = o.useState(!1),
    [v, T] = o.useState("2026-02-16T00:00:00+00:00"),
    [y, N] = o.useState("+09:00"),
    [k, R] = o.useState("+00:00"),
    [h, q] = o.useState("1220-01-01T00:00:00+00:00"),
    [j, C] = o.useState("+09:00"),
    E = o.useMemo(() => {
      if (r?.structuredContent !== void 0) return JSON.stringify(r.structuredContent, null, 2);
      const t = r?.content?.find((d) => d.type === "text")?.text;
      return t !== void 0 ? t : "呼び出し結果がここに表示されます。";
    }, [r]),
    S = !!(r?.isError || r?.structuredContent?.error);
  async function _(t, d) {
    u(!0);
    try {
      const D = await (n ?? A)(t, d);
      s(D);
    } catch (g) {
      s({
        structuredContent: {
          mode: "get_current_imperial",
          request: d,
          error: g instanceof Error ? g.message : String(g),
        },
        isError: !0,
      });
    } finally {
      u(!1);
    }
  }
  return e.jsxs("main", {
    className: "widget-shell",
    children: [
      e.jsx("h1", { className: "title is-5", children: "帝國火星曆日時" }),
      e.jsx("p", { className: "mb-3 has-text-grey", children: "3つのtoolを1つのwidgetに統合しています。" }),
      e.jsx("div", {
        className: "tabs is-boxed is-small mb-3",
        children: e.jsxs("ul", {
          children: [
            e.jsx("li", {
              className: i === "g2i" ? "is-active" : "",
              children: e.jsx("button", { type: "button", onClick: () => m("g2i"), children: "Gregorian → 帝國" }),
            }),
            e.jsx("li", {
              className: i === "now" ? "is-active" : "",
              children: e.jsx("button", { type: "button", onClick: () => m("now"), children: "現在時刻" }),
            }),
            e.jsx("li", {
              className: i === "i2g" ? "is-active" : "",
              children: e.jsx("button", { type: "button", onClick: () => m("i2g"), children: "帝國 → Gregorian" }),
            }),
          ],
        }),
      }),
      i === "g2i" &&
        e.jsxs("section", {
          className: "box mb-3",
          children: [
            e.jsxs("div", {
              className: "field",
              children: [
                e.jsx("label", { className: "label is-small", children: "Gregorian日時 (ISO 8601)" }),
                e.jsx("div", {
                  className: "control",
                  children: e.jsx("input", {
                    className: "input is-small",
                    value: v,
                    onChange: (t) => T(t.target.value),
                  }),
                }),
              ],
            }),
            e.jsxs("div", {
              className: "field",
              children: [
                e.jsx("label", { className: "label is-small", children: "帝國タイムゾーン" }),
                e.jsx("div", {
                  className: "control",
                  children: e.jsx("input", {
                    className: "input is-small",
                    value: y,
                    onChange: (t) => N(t.target.value),
                  }),
                }),
              ],
            }),
            e.jsx("button", {
              className: "button is-link is-small" + (l ? " is-loading" : ""),
              type: "button",
              onClick: () => _("convert_gregorian_to_imperial_datetime", { gregorianDateTime: v, imperialTimezone: y }),
              children: "變換する",
            }),
          ],
        }),
      i === "now" &&
        e.jsxs("section", {
          className: "box mb-3",
          children: [
            e.jsxs("div", {
              className: "field",
              children: [
                e.jsx("label", { className: "label is-small", children: "タイムゾーン" }),
                e.jsx("div", {
                  className: "control",
                  children: e.jsx("input", {
                    className: "input is-small",
                    value: k,
                    onChange: (t) => R(t.target.value),
                  }),
                }),
              ],
            }),
            e.jsx("button", {
              className: "button is-link is-small" + (l ? " is-loading" : ""),
              type: "button",
              onClick: () => _("get_current_imperial_datetime", { timezone: k }),
              children: "取得する",
            }),
          ],
        }),
      i === "i2g" &&
        e.jsxs("section", {
          className: "box mb-3",
          children: [
            e.jsxs("div", {
              className: "field",
              children: [
                e.jsx("label", { className: "label is-small", children: "帝國日時 (YYYY-MM-DDTHH:mm:ss±HH:MM)" }),
                e.jsx("div", {
                  className: "control",
                  children: e.jsx("input", {
                    className: "input is-small",
                    value: h,
                    onChange: (t) => q(t.target.value),
                  }),
                }),
              ],
            }),
            e.jsxs("div", {
              className: "field",
              children: [
                e.jsx("label", { className: "label is-small", children: "Gregorianタイムゾーン" }),
                e.jsx("div", {
                  className: "control",
                  children: e.jsx("input", {
                    className: "input is-small",
                    value: j,
                    onChange: (t) => C(t.target.value),
                  }),
                }),
              ],
            }),
            e.jsx("button", {
              className: "button is-link is-small" + (l ? " is-loading" : ""),
              type: "button",
              onClick: () =>
                _("convert_imperial_to_gregorian_datetime", { imperialDateTimeFormatted: h, gregorianTimezone: j }),
              children: "變換する",
            }),
          ],
        }),
      e.jsxs("section", {
        className: "box" + (S ? " has-background-danger-light" : " has-background-link-light"),
        children: [
          e.jsx("p", { className: "has-text-weight-semibold mb-2", children: "結果" }),
          e.jsx("pre", {
            style: { margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "12px" },
            children: E,
          }),
        ],
      }),
    ],
  });
}
f.__docgenInfo = {
  description: "",
  methods: [],
  displayName: "MartianDatetimeWidget",
  props: {
    callTool: {
      required: !1,
      tsType: {
        name: "signature",
        type: "function",
        raw: "(name: string, args: Record<string, unknown>) => Promise<WidgetToolResult>",
        signature: {
          arguments: [
            { type: { name: "string" }, name: "name" },
            {
              type: {
                name: "Record",
                elements: [{ name: "string" }, { name: "unknown" }],
                raw: "Record<string, unknown>",
              },
              name: "args",
            },
          ],
          return: {
            name: "Promise",
            elements: [
              {
                name: "signature",
                type: "object",
                raw: `{
  structuredContent?: WidgetStructuredContent;
  content?: Array<{ type: string; text?: string }>;
  isError?: boolean;
}`,
                signature: {
                  properties: [
                    {
                      key: "structuredContent",
                      value: {
                        name: "signature",
                        type: "object",
                        raw: `{
  mode: ToolMode;
  request: Record<string, unknown>;
  response?: Record<string, unknown>;
  error?: string;
}`,
                        signature: {
                          properties: [
                            {
                              key: "mode",
                              value: {
                                name: "union",
                                raw: '"convert_gregorian_to_imperial" | "get_current_imperial" | "convert_imperial_to_gregorian"',
                                elements: [
                                  { name: "literal", value: '"convert_gregorian_to_imperial"' },
                                  { name: "literal", value: '"get_current_imperial"' },
                                  { name: "literal", value: '"convert_imperial_to_gregorian"' },
                                ],
                                required: !0,
                              },
                            },
                            {
                              key: "request",
                              value: {
                                name: "Record",
                                elements: [{ name: "string" }, { name: "unknown" }],
                                raw: "Record<string, unknown>",
                                required: !0,
                              },
                            },
                            {
                              key: "response",
                              value: {
                                name: "Record",
                                elements: [{ name: "string" }, { name: "unknown" }],
                                raw: "Record<string, unknown>",
                                required: !1,
                              },
                            },
                            { key: "error", value: { name: "string", required: !1 } },
                          ],
                        },
                        required: !1,
                      },
                    },
                    {
                      key: "content",
                      value: {
                        name: "Array",
                        elements: [
                          {
                            name: "signature",
                            type: "object",
                            raw: "{ type: string; text?: string }",
                            signature: {
                              properties: [
                                { key: "type", value: { name: "string", required: !0 } },
                                { key: "text", value: { name: "string", required: !1 } },
                              ],
                            },
                          },
                        ],
                        raw: "Array<{ type: string; text?: string }>",
                        required: !1,
                      },
                    },
                    { key: "isError", value: { name: "boolean", required: !1 } },
                  ],
                },
              },
            ],
            raw: "Promise<WidgetToolResult>",
          },
        },
      },
      description: "",
    },
    initialResult: {
      required: !1,
      tsType: {
        name: "signature",
        type: "object",
        raw: `{
  structuredContent?: WidgetStructuredContent;
  content?: Array<{ type: string; text?: string }>;
  isError?: boolean;
}`,
        signature: {
          properties: [
            {
              key: "structuredContent",
              value: {
                name: "signature",
                type: "object",
                raw: `{
  mode: ToolMode;
  request: Record<string, unknown>;
  response?: Record<string, unknown>;
  error?: string;
}`,
                signature: {
                  properties: [
                    {
                      key: "mode",
                      value: {
                        name: "union",
                        raw: '"convert_gregorian_to_imperial" | "get_current_imperial" | "convert_imperial_to_gregorian"',
                        elements: [
                          { name: "literal", value: '"convert_gregorian_to_imperial"' },
                          { name: "literal", value: '"get_current_imperial"' },
                          { name: "literal", value: '"convert_imperial_to_gregorian"' },
                        ],
                        required: !0,
                      },
                    },
                    {
                      key: "request",
                      value: {
                        name: "Record",
                        elements: [{ name: "string" }, { name: "unknown" }],
                        raw: "Record<string, unknown>",
                        required: !0,
                      },
                    },
                    {
                      key: "response",
                      value: {
                        name: "Record",
                        elements: [{ name: "string" }, { name: "unknown" }],
                        raw: "Record<string, unknown>",
                        required: !1,
                      },
                    },
                    { key: "error", value: { name: "string", required: !1 } },
                  ],
                },
                required: !1,
              },
            },
            {
              key: "content",
              value: {
                name: "Array",
                elements: [
                  {
                    name: "signature",
                    type: "object",
                    raw: "{ type: string; text?: string }",
                    signature: {
                      properties: [
                        { key: "type", value: { name: "string", required: !0 } },
                        { key: "text", value: { name: "string", required: !1 } },
                      ],
                    },
                  },
                ],
                raw: "Array<{ type: string; text?: string }>",
                required: !1,
              },
            },
            { key: "isError", value: { name: "boolean", required: !1 } },
          ],
        },
      },
      description: "",
    },
  },
};
const F = { title: "Widget/MartianDatetimeWidget", component: f };
function z(n, a) {
  return n === "get_current_imperial_datetime"
    ? {
        structuredContent: {
          mode: "get_current_imperial",
          request: a,
          response: {
            imperialDateTimeFormatted: "1239-08-20T12:34:56+00:00",
            gregorianDateTime: "2026-02-16T12:34:56.000Z",
          },
        },
      }
    : n === "convert_imperial_to_gregorian_datetime"
      ? {
          structuredContent: {
            mode: "convert_imperial_to_gregorian",
            request: a,
            response: { gregorianDateTime: "2026-02-16T09:00:00+09:00" },
          },
        }
      : {
          structuredContent: {
            mode: "convert_gregorian_to_imperial",
            request: a,
            response: { imperialDateTimeFormatted: "1239-08-20T10:00:00+09:00" },
          },
        };
}
const p = { args: { callTool: async (n, a) => (await new Promise((i) => setTimeout(i, 120)), z(n, a)) } };
p.parameters = {
  ...p.parameters,
  docs: {
    ...p.parameters?.docs,
    source: {
      originalSource: `{
  args: {
    callTool: async (name, args) => {
      await new Promise(resolve => setTimeout(resolve, 120));
      return mockResult(name, args);
    }
  }
}`,
      ...p.parameters?.docs?.source,
    },
  },
};
const J = ["Default"];
export { p as Default, J as __namedExportsOrder, F as default };
