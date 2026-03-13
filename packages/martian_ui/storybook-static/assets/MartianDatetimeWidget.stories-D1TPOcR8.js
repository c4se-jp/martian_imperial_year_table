import { c as X, r as o, R as je } from "./iframe-Dgzv9eZV.js";
import "./preload-helper-PPVm8Dsz.js";
var ne = { exports: {} },
  J = {};
var se;
function Re() {
  if (se) return J;
  se = 1;
  var e = Symbol.for("react.transitional.element"),
    t = Symbol.for("react.fragment");
  function r(n, a, s) {
    var c = null;
    if ((s !== void 0 && (c = "" + s), a.key !== void 0 && (c = "" + a.key), "key" in a)) {
      s = {};
      for (var m in a) m !== "key" && (s[m] = a[m]);
    } else s = a;
    return ((a = s.ref), { $$typeof: e, type: n, key: c, ref: a !== void 0 ? a : null, props: s });
  }
  return ((J.Fragment = t), (J.jsx = r), (J.jsxs = r), J);
}
var ue;
function Ae() {
  return (ue || ((ue = 1), (ne.exports = Re())), ne.exports);
}
var i = Ae();
function pe(e) {
  var t,
    r,
    n = "";
  if (typeof e == "string" || typeof e == "number") n += e;
  else if (typeof e == "object")
    if (Array.isArray(e)) {
      var a = e.length;
      for (t = 0; t < a; t++) e[t] && (r = pe(e[t])) && (n && (n += " "), (n += r));
    } else for (r in e) e[r] && (n && (n += " "), (n += r));
  return n;
}
function $() {
  for (var e, t, r = 0, n = "", a = arguments.length; r < a; r++)
    (e = arguments[r]) && (t = pe(e)) && (n && (n += " "), (n += t));
  return n;
}
function ae(e) {
  return (t) => {
    e.forEach((r) => {
      typeof r == "function" ? r(t) : r != null && (r.current = t);
    });
  };
}
var re, ce;
function Ee() {
  if (ce) return re;
  ce = 1;
  var e = "Expected a function",
    t = NaN,
    r = "[object Symbol]",
    n = /^\s+|\s+$/g,
    a = /^[-+]0x[0-9a-f]+$/i,
    s = /^0b[01]+$/i,
    c = /^0o[0-7]+$/i,
    m = parseInt,
    d = typeof X == "object" && X && X.Object === Object && X,
    f = typeof self == "object" && self && self.Object === Object && self,
    k = d || f || Function("return this")(),
    w = Object.prototype,
    x = w.toString,
    y = Math.max,
    R = Math.min,
    g = function () {
      return k.Date.now();
    };
  function _(u, l, p) {
    var v,
      j,
      S,
      N,
      I,
      z,
      F = 0,
      b = !1,
      T = !1,
      H = !0;
    if (typeof u != "function") throw new TypeError(e);
    ((l = E(l) || 0),
      h(p) &&
        ((b = !!p.leading),
        (T = "maxWait" in p),
        (S = T ? y(E(p.maxWait) || 0, l) : S),
        (H = "trailing" in p ? !!p.trailing : H)));
    function Z(C) {
      var D = v,
        V = j;
      return ((v = j = void 0), (F = C), (N = u.apply(V, D)), N);
    }
    function K(C) {
      return ((F = C), (I = setTimeout(M, l)), b ? Z(C) : N);
    }
    function ee(C) {
      var D = C - z,
        V = C - F,
        oe = l - D;
      return T ? R(oe, S - V) : oe;
    }
    function O(C) {
      var D = C - z,
        V = C - F;
      return z === void 0 || D >= l || D < 0 || (T && V >= S);
    }
    function M() {
      var C = g();
      if (O(C)) return B(C);
      I = setTimeout(M, ee(C));
    }
    function B(C) {
      return ((I = void 0), H && v ? Z(C) : ((v = j = void 0), N));
    }
    function U() {
      (I !== void 0 && clearTimeout(I), (F = 0), (v = z = j = I = void 0));
    }
    function ke() {
      return I === void 0 ? N : B(g());
    }
    function te() {
      var C = g(),
        D = O(C);
      if (((v = arguments), (j = this), (z = C), D)) {
        if (I === void 0) return K(z);
        if (T) return ((I = setTimeout(M, l)), Z(z));
      }
      return (I === void 0 && (I = setTimeout(M, l)), N);
    }
    return ((te.cancel = U), (te.flush = ke), te);
  }
  function h(u) {
    var l = typeof u;
    return !!u && (l == "object" || l == "function");
  }
  function A(u) {
    return !!u && typeof u == "object";
  }
  function q(u) {
    return typeof u == "symbol" || (A(u) && x.call(u) == r);
  }
  function E(u) {
    if (typeof u == "number") return u;
    if (q(u)) return t;
    if (h(u)) {
      var l = typeof u.valueOf == "function" ? u.valueOf() : u;
      u = h(l) ? l + "" : l;
    }
    if (typeof u != "string") return u === 0 ? u : +u;
    u = u.replace(n, "");
    var p = s.test(u);
    return p || c.test(u) ? m(u.slice(2), p ? 2 : 8) : a.test(u) ? t : +u;
  }
  return ((re = _), re);
}
Ee();
var Se = typeof window < "u" ? o.useLayoutEffect : o.useEffect;
function qe() {
  const e = o.useRef(!1);
  return (
    o.useEffect(
      () => (
        (e.current = !0),
        () => {
          e.current = !1;
        }
      ),
      [],
    ),
    o.useCallback(() => e.current, [])
  );
}
var le = { width: void 0, height: void 0 };
function Ie(e) {
  const { ref: t, box: r = "content-box" } = e,
    [{ width: n, height: a }, s] = o.useState(le),
    c = qe(),
    m = o.useRef({ ...le }),
    d = o.useRef(void 0);
  return (
    (d.current = e.onResize),
    o.useEffect(() => {
      if (!t.current || typeof window > "u" || !("ResizeObserver" in window)) return;
      const f = new ResizeObserver(([k]) => {
        const w =
            r === "border-box"
              ? "borderBoxSize"
              : r === "device-pixel-content-box"
                ? "devicePixelContentBoxSize"
                : "contentBoxSize",
          x = de(k, w, "inlineSize"),
          y = de(k, w, "blockSize");
        if (m.current.width !== x || m.current.height !== y) {
          const g = { width: x, height: y };
          ((m.current.width = x), (m.current.height = y), d.current ? d.current(g) : c() && s(g));
        }
      });
      return (
        f.observe(t.current, { box: r }),
        () => {
          f.disconnect();
        }
      );
    }, [r, t, c]),
    { width: n, height: a }
  );
}
function de(e, t, r) {
  return e[t]
    ? Array.isArray(e[t])
      ? e[t][0][r]
      : e[t][r]
    : t === "contentBoxSize"
      ? e.contentRect[r === "inlineSize" ? "width" : "height"]
      : void 0;
}
function Ne(e, t) {
  const r = o.useRef(e);
  (Se(() => {
    r.current = e;
  }, [e]),
    o.useEffect(() => {
      if (!t && t !== 0) return;
      const n = setTimeout(() => {
        r.current();
      }, t);
      return () => {
        clearTimeout(n);
      };
    }, [t]));
}
const ze = (e) =>
    i.jsx("svg", {
      width: "1em",
      height: "1em",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      ...e,
      children: i.jsx("path", {
        d: "M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM16.0755 7.93219C16.5272 8.25003 16.6356 8.87383 16.3178 9.32549L11.5678 16.0755C11.3931 16.3237 11.1152 16.4792 10.8123 16.4981C10.5093 16.517 10.2142 16.3973 10.0101 16.1727L7.51006 13.4227C7.13855 13.014 7.16867 12.3816 7.57733 12.0101C7.98598 11.6386 8.61843 11.6687 8.98994 12.0773L10.6504 13.9039L14.6822 8.17451C15 7.72284 15.6238 7.61436 16.0755 7.93219Z",
        fill: "currentColor",
      }),
    }),
  Me = (e) =>
    i.jsxs("svg", {
      width: "1em",
      height: "1em",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      ...e,
      children: [
        i.jsx("path", {
          d: "M13 12a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0v-4Zm-1-2.5A1.25 1.25 0 1 0 12 7a1.25 1.25 0 0 0 0 2.5Z",
        }),
        i.jsx("path", {
          fillRule: "evenodd",
          d: "M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z",
          clipRule: "evenodd",
        }),
      ],
    }),
  De = (e) =>
    i.jsxs("svg", {
      width: "1em",
      height: "1em",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      ...e,
      children: [
        i.jsx("path", {
          d: "M10.42 2.006a4 4 0 0 1 3.159 0c.674.29 1.188.822 1.667 1.456.474.627 1 1.473 1.653 2.523l3.542 5.696c.72 1.16 1.3 2.09 1.682 2.854.384.766.654 1.517.59 2.292a4 4 0 0 1-1.604 2.886c-.625.463-1.405.63-2.258.709-.85.078-1.945.078-3.311.078H8.46c-1.366 0-2.46 0-3.31-.078-.854-.078-1.634-.246-2.26-.71a4 4 0 0 1-1.603-2.885c-.064-.775.206-1.526.59-2.292.383-.764.961-1.694 1.682-2.854l3.542-5.696c.653-1.05 1.18-1.896 1.653-2.523.48-.634.993-1.166 1.667-1.456Zm2.37 1.838a2 2 0 0 0-1.58 0c-.192.083-.448.28-.86.825-.413.544-.891 1.312-1.577 2.415l-3.488 5.61c-.755 1.214-1.283 2.066-1.62 2.737-.34.678-.402 1.02-.385 1.232a2 2 0 0 0 .802 1.443c.171.127.494.255 1.25.324.748.069 1.75.07 3.18.07h6.976c1.43 0 2.432-.001 3.18-.07.756-.069 1.079-.197 1.25-.324a2 2 0 0 0 .802-1.443c.017-.212-.045-.554-.385-1.232-.337-.671-.865-1.523-1.62-2.737l-3.488-5.61c-.686-1.103-1.164-1.87-1.576-2.415-.413-.546-.67-.742-.861-.825",
        }),
        i.jsx("path", {
          d: "M12 7.5a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1M10.851 15a1.15 1.15 0 1 1 2.3 0 1.15 1.15 0 0 1-2.3 0",
        }),
      ],
    }),
  Fe = "_Alert_1tr02_1",
  Be = "_Content_1tr02_145",
  Le = "_Indicator_1tr02_156",
  Oe = "_Message_1tr02_159",
  We = "_Title_1tr02_162",
  Ge = "_Description_1tr02_168",
  Pe = "_Actions_1tr02_173",
  L = { Alert: Fe, Content: Be, Indicator: Le, Message: Oe, Title: We, Description: Ge, Actions: Pe },
  $e = ({
    color: e = "primary",
    variant: t = "outline",
    title: r,
    description: n,
    actions: a,
    actionsPlacement: s,
    indicator: c,
    className: m,
    actionsClassName: d,
    ref: f,
    ...k
  }) => {
    const w = o.useRef(null),
      x = o.useRef(null),
      [y, R] = o.useState("end"),
      { width: g } = Ie({ ref: w });
    return (
      o.useEffect(() => {
        const _ = x.current?.clientWidth ?? 0;
        if (_ && g) {
          const h = _ > g / 3 ? "bottom" : "end";
          R(h);
        }
      }, [g]),
      i.jsxs("div", {
        ref: ae([f, w]),
        className: $(L.Alert, m),
        "data-variant": t,
        "data-color": e,
        role: e === "danger" ? "alert" : void 0,
        "data-actions-placement": s ?? y,
        ...k,
        children: [
          c === !1 ? null : i.jsx("div", { className: L.Indicator, children: c ?? i.jsx(He, { color: e }) }),
          i.jsxs("div", {
            className: L.Content,
            children: [
              i.jsxs("div", {
                className: L.Message,
                children: [
                  r && i.jsx("div", { className: L.Title, children: r }),
                  n && i.jsx("div", { className: L.Description, children: n }),
                ],
              }),
              a && i.jsx("div", { className: $(L.Actions, d), ref: x, children: a }),
            ],
          }),
        ],
      })
    );
  },
  He = ({ color: e }) => {
    switch (e) {
      case "warning":
      case "caution":
      case "danger":
        return i.jsx(De, {});
      case "success":
        return i.jsx(ze, {});
      default:
        return i.jsx(Me, {});
    }
  },
  Ze = { DEV: !1, MODE: "production" },
  ve = typeof import.meta < "u" ? Ze : void 0,
  Ve = !!ve?.DEV,
  Je =
    (typeof navigator < "u" && /(jsdom|happy-dom)/i.test(navigator.userAgent)) ||
    typeof globalThis.happyDOM == "object",
  ye = ve?.MODE === "test" || Je,
  Ye = typeof window < "u",
  he = typeof document < "u",
  Ue = Ye && he,
  Xe = (e) => {
    const t = e.currentTarget;
    if (!(t instanceof HTMLElement)) return;
    const r = t.offsetWidth;
    let n = 0.985;
    (r <= 80 ? (n = 0.96) : r <= 150 ? (n = 0.97) : r <= 220 ? (n = 0.98) : r > 600 && (n = 0.995),
      t.style.setProperty("--scale", n.toString()));
  },
  me = (e, t) => {
    const r = () => {
      const c = setTimeout(e);
      return () => {
        clearTimeout(c);
      };
    };
    if (!Ue || typeof window.requestAnimationFrame != "function" || (he && document.visibilityState === "hidden"))
      return r();
    let a = 2,
      s = window.requestAnimationFrame(function c() {
        ((a -= 1), a === 0 ? e() : (s = window.requestAnimationFrame(c)));
      });
    return () => {
      typeof window.cancelAnimationFrame == "function" && window.cancelAnimationFrame(s);
    };
  },
  Qe = (e) =>
    Object.keys(e).reduce((r, n) => {
      const a = e[n];
      if (a || a === 0) {
        const s = n.startsWith("--") ? "" : "--",
          c = typeof a == "number" ? `${a}px` : a;
        r[`${s}${n}`] = c;
      }
      return r;
    }, {}),
  Ke = (e) => {
    const t = o.Children.toArray(e),
      r = [];
    let n = "";
    const a = () => {
      n !== "" && (r.push(n), (n = ""));
    };
    for (const s of t)
      if (!(s == null || typeof s == "boolean")) {
        if (typeof s == "string" || typeof s == "number") {
          n += String(s);
          continue;
        }
        (a(), r.push(s));
      }
    return (a(), r);
  },
  xe = (e) => {
    const t = Ke(e),
      r = o.Children.count(t);
    return o.Children.map(t, (n) => {
      if (typeof n == "string" && n.trim()) return r <= 1 ? n : i.jsx("span", { children: n });
      if (o.isValidElement(n)) {
        const a = n,
          { children: s, ...c } = a.props;
        return s != null ? o.cloneElement(a, c, xe(s)) : a;
      }
      return n;
    });
  };
o.createContext(null);
const et = "_LoadingIndicator_7yl6f_1",
  tt = { LoadingIndicator: et },
  nt = ({ className: e, size: t, strokeWidth: r, style: n, ...a }) =>
    i.jsx("div", {
      ...a,
      className: $(tt.LoadingIndicator, e),
      style: n || Qe({ "indicator-size": t, "indicator-stroke": r }),
    }),
  rt = () => ye,
  fe = (e, t = !1, r = "TransitionGroup") => {
    const n = [];
    return (
      o.Children.forEach(e, (a) => {
        if (a && typeof a == "object" && "key" in a && a.key) n.push(a);
        else if (t) throw new Error(`Child elements of <${r} /> must include a \`key\``);
      }),
      n
    );
  },
  W = () => {},
  G = (e) => {
    const t = o.useRef(e);
    return ((t.current = e), o.useCallback((r) => t.current(r), []));
  };
function it(e, t, r, n) {
  const a = e.reduce((d, f) => ({ ...d, [f.key]: 1 }), {}),
    s = t.reduce((d, f) => ({ ...d, [f.component.key]: 1 }), {}),
    c = e.filter((d) => !s[d.key]).map(r),
    m = t.map((d) => ({
      ...d,
      component: e.find(({ key: f }) => f === d.component.key) || d.component,
      shouldRender: !!a[d.component.key],
    }));
  return n === "append" ? m.concat(c) : c.concat(m);
}
function at(e, t, r) {
  if ((ye || Ve) && t && r > 1) throw new Error(`Cannot use forwardRef with multiple children in <${e} />`);
}
const ot = "_TransitionGroupChild_1hv1z_1",
  st = { TransitionGroupChild: ot },
  _e = { enter: !1, enterActive: !1, exit: !1, exitActive: !1, interrupted: !1 },
  ut = (e) => ({ ..._e, enter: !e }),
  ct = (e, t) => {
    switch (t.type) {
      case "enter-before":
        return { enter: !0, enterActive: !1, exit: !1, exitActive: !1, interrupted: e.interrupted || e.exit };
      case "enter-active":
        return { enter: !0, enterActive: !0, exit: !1, exitActive: !1, interrupted: !1 };
      case "exit-before":
        return { enter: !1, enterActive: !1, exit: !0, exitActive: !1, interrupted: e.interrupted || e.enter };
      case "exit-active":
        return { enter: !1, enterActive: !1, exit: !0, exitActive: !0, interrupted: !1 };
      default:
        return _e;
    }
  },
  lt = ({
    ref: e,
    as: t,
    children: r,
    className: n,
    transitionId: a,
    style: s,
    preventMountTransition: c,
    shouldRender: m,
    enterDuration: d,
    exitDuration: f,
    removeChild: k,
    onEnter: w,
    onEnterActive: x,
    onEnterComplete: y,
    onExit: R,
    onExitActive: g,
    onExitComplete: _,
  }) => {
    const [h, A] = o.useReducer(ct, ut(c || !1)),
      q = o.useRef(!1),
      E = o.useRef(null),
      u = o.useRef(d);
    u.current = d;
    const l = o.useRef(f);
    l.current = f;
    const p = o.useRef(null),
      v = o.useCallback(
        (j) => {
          const S = E.current;
          if (!(!S || j === p.current))
            switch (((p.current = j), j)) {
              case "enter":
                w(S);
                break;
              case "enter-active":
                x(S);
                break;
              case "enter-complete":
                y(S);
                break;
              case "exit":
                R(S);
                break;
              case "exit-active":
                g(S);
                break;
              case "exit-complete":
                _(S);
                break;
            }
        },
        [w, x, y, R, g, _],
      );
    return (
      je.useLayoutEffect(() => {
        if (!m) {
          let N;
          (A({ type: "exit-before" }), v("exit"));
          const I = me(() => {
            (A({ type: "exit-active" }),
              v("exit-active"),
              (N = window.setTimeout(() => {
                (v("exit-complete"), k());
              }, l.current)));
          });
          return () => {
            (I(), N !== void 0 && clearTimeout(N));
          };
        }
        if (c && !q.current) {
          q.current = !0;
          return;
        }
        let j;
        (A({ type: "enter-before" }), v("enter"));
        const S = me(() => {
          (A({ type: "enter-active" }),
            v("enter-active"),
            (j = window.setTimeout(() => {
              (A({ type: "done" }), v("enter-complete"));
            }, u.current)));
        });
        return () => {
          (S(), j !== void 0 && clearTimeout(j));
        };
      }, [m, c, k, v]),
      o.useEffect(
        () => () => {
          q.current = !1;
        },
        [],
      ),
      i.jsx(t, {
        ref: ae([E, e]),
        className: $(n, st.TransitionGroupChild),
        "data-transition-id": a,
        style: s,
        "data-entering": h.enter ? "" : void 0,
        "data-entering-active": h.enterActive ? "" : void 0,
        "data-exiting": h.exit ? "" : void 0,
        "data-exiting-active": h.exitActive ? "" : void 0,
        "data-interrupted": h.interrupted ? "" : void 0,
        children: r,
      })
    );
  },
  dt = (e) => {
    const { enterMountDelay: t, preventMountTransition: r } = e,
      n = !r && t != null ? t : null,
      [a, s] = o.useState(n == null);
    return (Ne(() => s(!0), a ? null : n), a ? i.jsx(lt, { ...e }) : null);
  },
  mt = (e) => {
    const {
        ref: t,
        as: r = "span",
        children: n,
        className: a,
        transitionId: s,
        style: c,
        enterDuration: m = 0,
        exitDuration: d = 0,
        preventInitialTransition: f = !0,
        enterMountDelay: k,
        insertMethod: w = "append",
        disableAnimations: x = rt(),
      } = e,
      y = G(e.onEnter ?? W),
      R = G(e.onEnterActive ?? W),
      g = G(e.onEnterComplete ?? W),
      _ = G(e.onExit ?? W),
      h = G(e.onExitActive ?? W),
      A = G(e.onExitComplete ?? W);
    o.Children.forEach(n, (l) => {
      if (l && !l.key) throw new Error("Child elements of <TransitionGroup /> must include a `key`");
    });
    const q = o.useCallback(
        (l) => ({
          component: l,
          shouldRender: !0,
          removeChild: () => {
            u((p) => p.filter((v) => l.key !== v.component.key));
          },
          onEnter: y,
          onEnterActive: R,
          onEnterComplete: g,
          onExit: _,
          onExitActive: h,
          onExitComplete: A,
        }),
        [y, R, g, _, h, A],
      ),
      [E, u] = o.useState(() => fe(n).map((l) => ({ ...q(l), preventMountTransition: f })));
    return (
      o.useLayoutEffect(() => {
        u((l) => {
          const p = fe(n);
          return it(p, l, q, w);
        });
      }, [n, w, q]),
      at("TransitionGroup", t, o.Children.count(n)),
      x
        ? i.jsx(i.Fragment, {
            children: o.Children.map(n, (l) =>
              i.jsx(r, { ref: t, className: a, style: c, "data-transition-id": s, children: l }),
            ),
          })
        : i.jsx(i.Fragment, {
            children: E.map(({ component: l, ...p }) =>
              i.jsx(
                dt,
                {
                  ...p,
                  as: r,
                  className: a,
                  transitionId: s,
                  enterDuration: m,
                  exitDuration: d,
                  enterMountDelay: k,
                  style: c,
                  ref: t,
                  children: l,
                },
                l.key,
              ),
            ),
          })
    );
  },
  ft = "_Button_1864l_1",
  gt = "_ButtonInner_1864l_4",
  pt = "_ButtonLoader_1864l_749",
  ie = { Button: ft, ButtonInner: gt, ButtonLoader: pt },
  P = (e) => {
    const {
        type: t = "button",
        color: r = "primary",
        variant: n = "solid",
        pill: a = !0,
        uniform: s = !1,
        size: c = "md",
        iconSize: m,
        gutterSize: d,
        loading: f,
        selected: k,
        block: w,
        opticallyAlign: x,
        children: y,
        className: R,
        onClick: g,
        disabled: _,
        disabledTone: h,
        inert: A = f,
        ...q
      } = e,
      E = _ || A,
      u = o.useCallback(
        (l) => {
          _ || g?.(l);
        },
        [g, _],
      );
    return i.jsxs("button", {
      type: t,
      className: $(ie.Button, R),
      "data-color": r,
      "data-variant": n,
      "data-pill": a ? "" : void 0,
      "data-uniform": s ? "" : void 0,
      "data-size": c,
      "data-gutter-size": d,
      "data-icon-size": m,
      "data-loading": f ? "" : void 0,
      "data-selected": k ? "" : void 0,
      "data-block": w ? "" : void 0,
      "data-optically-align": x,
      onPointerEnter: Xe,
      disabled: E,
      "aria-disabled": E,
      tabIndex: E ? -1 : void 0,
      "data-disabled": _ ? "" : void 0,
      "data-disabled-tone": _ ? h : void 0,
      onClick: u,
      ...q,
      children: [
        i.jsx(mt, {
          className: ie.ButtonLoader,
          enterDuration: 250,
          exitDuration: 150,
          children: f && i.jsx(nt, {}, "loader"),
        }),
        i.jsx("span", { className: ie.ButtonInner, children: xe(y) }),
      ],
    });
  },
  vt = "_Container_1a6nz_1",
  yt = "_Input_1a6nz_229",
  ge = { Container: vt, Input: yt },
  Y = (e) => {
    const t = o.useRef(null),
      n = `search-ui-input-${o.useId()}`,
      {
        id: a,
        name: s,
        type: c = "text",
        variant: m = "outline",
        size: d = "md",
        gutterSize: f,
        className: k,
        autoComplete: w,
        disabled: x = !1,
        readOnly: y = !1,
        invalid: R = !1,
        allowAutofillExtensions: g = c === "password" || !!s,
        onFocus: _,
        onBlur: h,
        onAnimationStart: A,
        onAutofill: q,
        autoSelect: E,
        startAdornment: u,
        endAdornment: l,
        pill: p,
        opticallyAlign: v,
        ref: j,
        ...S
      } = e,
      N = (b) => {
        const T = t.current;
        if (
          !b.target ||
          !(b.target instanceof Element) ||
          !T ||
          T.contains(b.target) ||
          b.target.closest("button, [type='button'], [role='button'], [role='menuitem']")
        )
          return;
        (b.preventDefault(), document.activeElement !== T && T.focus());
        const { left: H, top: Z } = T.getBoundingClientRect(),
          { clientX: K, clientY: ee } = b,
          O = ee < Z || K < H;
        if (b.detail === 1)
          if (O) T.setSelectionRange(0, 0);
          else {
            const M = T.value.length;
            T.setSelectionRange(M, M);
          }
        else if (b.detail === 2) {
          const M = T.value.match(/\w+|[^\w\s]/g) || [],
            B = O ? M.at(0) : M.at(-1);
          if (B) {
            const U = O ? T.value.indexOf(B) : T.value.lastIndexOf(B);
            T.setSelectionRange(U, U + B.length);
          }
        } else T.select();
      },
      [I, z] = o.useState(!1);
    o.useEffect(() => {
      E && t.current?.select();
    }, [E]);
    const F = (b) => {
      (A?.(b), b.animationName === "native-autofill-in" && q?.());
    };
    return i.jsxs("div", {
      className: $(ge.Container, k),
      "data-variant": m,
      "data-size": d,
      "data-gutter-size": f,
      "data-focused": I,
      "data-disabled": x ? "" : void 0,
      "data-readonly": y ? "" : void 0,
      "data-invalid": R ? "" : void 0,
      "data-pill": p ? "" : void 0,
      "data-optically-align": v,
      "data-has-start-adornment": u ? "" : void 0,
      "data-has-end-adornment": l ? "" : void 0,
      onMouseDown: N,
      children: [
        u,
        i.jsx("input", {
          ...S,
          ref: ae([j, t]),
          id: a || (g ? void 0 : n),
          className: ge.Input,
          type: c,
          name: s,
          readOnly: y,
          disabled: x,
          onFocus: (b) => {
            (z(!0), _?.(b));
          },
          onBlur: (b) => {
            (z(!1), h?.(b));
          },
          onAnimationStart: F,
          "data-lpignore": g ? void 0 : !0,
          "data-1p-ignore": g ? void 0 : !0,
        }),
        l,
      ],
    });
  };
function we({
  gregorianDateTime: e,
  imperialTimezone: t,
  onConvert: r,
  onGregorianDateTimeChange: n,
  onImperialTimezoneChange: a,
  running: s,
}) {
  return i.jsx("section", {
    className: "mt-4 rounded-xl border border-subtle p-3",
    children: i.jsxs("div", {
      className: "grid gap-3",
      children: [
        i.jsxs("label", {
          className: "text-sm text-secondary",
          children: [
            "グレゴリオ曆日時 (ISO 8601)",
            i.jsx(Y, {
              className: "mt-1",
              onChange: (c) => n(c.target.value),
              size: "sm",
              style: { width: "100%" },
              value: e,
            }),
          ],
        }),
        i.jsxs("label", {
          className: "text-sm text-secondary",
          children: [
            "帝國火星曆タイムゾーン",
            i.jsx(Y, {
              className: "mt-1",
              onChange: (c) => a(c.target.value),
              size: "sm",
              style: { width: "100%" },
              value: t,
            }),
          ],
        }),
        i.jsx("div", {
          children: i.jsx(P, { color: "primary", size: "sm", loading: s, onClick: r, children: "變換する" }),
        }),
      ],
    }),
  });
}
we.__docgenInfo = {
  description: "",
  methods: [],
  displayName: "Grdt2ImdtTab",
  props: {
    gregorianDateTime: { required: !0, tsType: { name: "string" }, description: "" },
    imperialTimezone: { required: !0, tsType: { name: "string" }, description: "" },
    onConvert: {
      required: !0,
      tsType: {
        name: "signature",
        type: "function",
        raw: "() => void",
        signature: { arguments: [], return: { name: "void" } },
      },
      description: "",
    },
    onGregorianDateTimeChange: {
      required: !0,
      tsType: {
        name: "signature",
        type: "function",
        raw: "(value: string) => void",
        signature: { arguments: [{ type: { name: "string" }, name: "value" }], return: { name: "void" } },
      },
      description: "",
    },
    onImperialTimezoneChange: {
      required: !0,
      tsType: {
        name: "signature",
        type: "function",
        raw: "(value: string) => void",
        signature: { arguments: [{ type: { name: "string" }, name: "value" }], return: { name: "void" } },
      },
      description: "",
    },
    running: { required: !0, tsType: { name: "boolean" }, description: "" },
  },
};
function Te({ currentTimezone: e, onCurrentTimezoneChange: t, onFetch: r, running: n }) {
  return i.jsx("section", {
    className: "mt-4 rounded-xl border border-subtle p-3",
    children: i.jsxs("div", {
      className: "grid gap-3",
      children: [
        i.jsxs("label", {
          className: "text-sm text-secondary",
          children: [
            "火星曆タイムゾーン",
            i.jsx(Y, {
              className: "mt-1",
              onChange: (a) => t(a.target.value),
              size: "sm",
              style: { width: "100%" },
              value: e,
            }),
          ],
        }),
        i.jsx("div", {
          children: i.jsx(P, { color: "primary", size: "sm", loading: n, onClick: r, children: "取得する" }),
        }),
      ],
    }),
  });
}
Te.__docgenInfo = {
  description: "",
  methods: [],
  displayName: "NowTab",
  props: {
    currentTimezone: { required: !0, tsType: { name: "string" }, description: "" },
    onCurrentTimezoneChange: {
      required: !0,
      tsType: {
        name: "signature",
        type: "function",
        raw: "(value: string) => void",
        signature: { arguments: [{ type: { name: "string" }, name: "value" }], return: { name: "void" } },
      },
      description: "",
    },
    onFetch: {
      required: !0,
      tsType: {
        name: "signature",
        type: "function",
        raw: "() => void",
        signature: { arguments: [], return: { name: "void" } },
      },
      description: "",
    },
    running: { required: !0, tsType: { name: "boolean" }, description: "" },
  },
};
function Ce({
  gregorianTimezone: e,
  imperialDateTimeFormatted: t,
  onConvert: r,
  onGregorianTimezoneChange: n,
  onImperialDateTimeFormattedChange: a,
  running: s,
}) {
  return i.jsx("section", {
    className: "mt-4 rounded-xl border border-subtle p-3",
    children: i.jsxs("div", {
      className: "grid gap-3",
      children: [
        i.jsxs("label", {
          className: "text-sm text-secondary",
          children: [
            "帝國火星曆日時 (YYYY-MM-DDTHH:mm:ss±HH:MM)",
            i.jsx(Y, {
              className: "mt-1",
              onChange: (c) => a(c.target.value),
              size: "sm",
              style: { width: "100%" },
              value: t,
            }),
          ],
        }),
        i.jsxs("label", {
          className: "text-sm text-secondary",
          children: [
            "グレゴリオ曆タイムゾーン",
            i.jsx(Y, {
              className: "mt-1",
              onChange: (c) => n(c.target.value),
              size: "sm",
              style: { width: "100%" },
              value: e,
            }),
          ],
        }),
        i.jsx("div", {
          children: i.jsx(P, { color: "primary", size: "sm", loading: s, onClick: r, children: "變換する" }),
        }),
      ],
    }),
  });
}
Ce.__docgenInfo = {
  description: "",
  methods: [],
  displayName: "Imdt2GrdtTab",
  props: {
    gregorianTimezone: { required: !0, tsType: { name: "string" }, description: "" },
    imperialDateTimeFormatted: { required: !0, tsType: { name: "string" }, description: "" },
    onConvert: {
      required: !0,
      tsType: {
        name: "signature",
        type: "function",
        raw: "() => void",
        signature: { arguments: [], return: { name: "void" } },
      },
      description: "",
    },
    onGregorianTimezoneChange: {
      required: !0,
      tsType: {
        name: "signature",
        type: "function",
        raw: "(value: string) => void",
        signature: { arguments: [{ type: { name: "string" }, name: "value" }], return: { name: "void" } },
      },
      description: "",
    },
    onImperialDateTimeFormattedChange: {
      required: !0,
      tsType: {
        name: "signature",
        type: "function",
        raw: "(value: string) => void",
        signature: { arguments: [{ type: { name: "string" }, name: "value" }], return: { name: "void" } },
      },
      description: "",
    },
    running: { required: !0, tsType: { name: "boolean" }, description: "" },
  },
};
function ht(e, t) {
  return Promise.resolve({
    structuredContent: {
      mode:
        e === "convert_gregorian_to_imperial_datetime"
          ? "convert_gregorian_to_imperial"
          : e === "get_current_imperial_datetime"
            ? "get_current_imperial"
            : "convert_imperial_to_gregorian",
      request: t,
      error: "ローカルプレビューではMCP接続の代わりにモックを返しています。",
    },
    isError: !0,
  });
}
function be({ callTool: e, initialResult: t, subscribeToolResult: r }) {
  const [n, a] = o.useState("now"),
    [s, c] = o.useState(t),
    [m, d] = o.useState(!1),
    [f, k] = o.useState("2026-01-01T00:00:00+09:00"),
    [w, x] = o.useState("+00:00"),
    [y, R] = o.useState("+00:00"),
    [g, _] = o.useState("1428-01-01T00:00:00+00:00"),
    [h, A] = o.useState("+09:00"),
    q = o.useMemo(() => {
      if (s?.structuredContent !== void 0) return JSON.stringify(s.structuredContent, null, 2);
      const l = s?.content?.find((p) => p.type === "text")?.text;
      return l !== void 0 ? l : "呼び出し結果がここに表示されます。";
    }, [s]),
    E = !!(s?.isError || s?.structuredContent?.error);
  o.useEffect(() => {
    r !== void 0 && r((l) => c(l));
  }, [r]);
  async function u(l, p) {
    d(!0);
    try {
      const j = await (e ?? ht)(l, p);
      c(j);
    } catch (v) {
      c({
        structuredContent: {
          mode: "get_current_imperial",
          request: p,
          error: v instanceof Error ? v.message : String(v),
        },
        isError: !0,
      });
    } finally {
      d(!1);
    }
  }
  return i.jsxs("main", {
    className: "mx-auto w-full max-w-full rounded-2xl border border-default bg-surface p-4",
    children: [
      i.jsx("h1", { className: "heading-md", children: "帝國火星曆" }),
      i.jsx("p", { className: "text-sm text-secondary", children: "火星曆と地球曆を相互に變換できます。" }),
      i.jsxs("div", {
        className: "mt-4 grid grid-cols-3 gap-3",
        children: [
          i.jsx(P, {
            block: !0,
            color: n === "grdt2imdt" ? "primary" : "secondary",
            onClick: () => a("grdt2imdt"),
            size: "sm",
            variant: n === "grdt2imdt" ? "solid" : "soft",
            children: "地球曆 → 火星曆",
          }),
          i.jsx(P, {
            block: !0,
            color: n === "now" ? "primary" : "secondary",
            onClick: () => a("now"),
            size: "sm",
            variant: n === "now" ? "solid" : "soft",
            children: "現在時刻",
          }),
          i.jsx(P, {
            block: !0,
            color: n === "imdt2grdt" ? "primary" : "secondary",
            onClick: () => a("imdt2grdt"),
            size: "sm",
            variant: n === "imdt2grdt" ? "solid" : "soft",
            children: "火星曆 →地球曆",
          }),
        ],
      }),
      n === "grdt2imdt" &&
        i.jsx(we, {
          gregorianDateTime: f,
          imperialTimezone: w,
          onConvert: () => u("convert_gregorian_to_imperial_datetime", { gregorianDateTime: f, imperialTimezone: w }),
          onGregorianDateTimeChange: k,
          onImperialTimezoneChange: x,
          running: m,
        }),
      n === "now" &&
        i.jsx(Te, {
          currentTimezone: y,
          onCurrentTimezoneChange: R,
          onFetch: () => u("get_current_imperial_datetime", { timezone: y }),
          running: m,
        }),
      n === "imdt2grdt" &&
        i.jsx(Ce, {
          gregorianTimezone: h,
          imperialDateTimeFormatted: g,
          onConvert: () =>
            u("convert_imperial_to_gregorian_datetime", { imperialDateTimeFormatted: g, gregorianTimezone: h }),
          onGregorianTimezoneChange: A,
          onImperialDateTimeFormattedChange: _,
          running: m,
        }),
      i.jsx("section", {
        className: "mt-4",
        children: i.jsx($e, {
          color: E ? "danger" : "info",
          description: i.jsx("pre", { className: "m-0 whitespace-pre-wrap break-all text-xs", children: q }),
          title: "結果",
          variant: "soft",
        }),
      }),
    ],
  });
}
be.__docgenInfo = {
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
  content?: Array<{ type: string; text?: string }>;
  isError?: boolean;
  structuredContent?: WidgetStructuredContent;
}`,
                signature: {
                  properties: [
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
                    {
                      key: "structuredContent",
                      value: {
                        name: "signature",
                        type: "object",
                        raw: `{
  error?: string;
  mode: ToolMode;
  request: Record<string, unknown>;
  response?: Record<string, unknown>;
}`,
                        signature: {
                          properties: [
                            { key: "error", value: { name: "string", required: !1 } },
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
                          ],
                        },
                        required: !1,
                      },
                    },
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
  content?: Array<{ type: string; text?: string }>;
  isError?: boolean;
  structuredContent?: WidgetStructuredContent;
}`,
        signature: {
          properties: [
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
            {
              key: "structuredContent",
              value: {
                name: "signature",
                type: "object",
                raw: `{
  error?: string;
  mode: ToolMode;
  request: Record<string, unknown>;
  response?: Record<string, unknown>;
}`,
                signature: {
                  properties: [
                    { key: "error", value: { name: "string", required: !1 } },
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
                  ],
                },
                required: !1,
              },
            },
          ],
        },
      },
      description: "",
    },
    subscribeToolResult: {
      required: !1,
      tsType: {
        name: "signature",
        type: "function",
        raw: "(listener: (result: WidgetToolResult) => void) => void",
        signature: {
          arguments: [
            {
              type: {
                name: "signature",
                type: "function",
                raw: "(result: WidgetToolResult) => void",
                signature: {
                  arguments: [
                    {
                      type: {
                        name: "signature",
                        type: "object",
                        raw: `{
  content?: Array<{ type: string; text?: string }>;
  isError?: boolean;
  structuredContent?: WidgetStructuredContent;
}`,
                        signature: {
                          properties: [
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
                            {
                              key: "structuredContent",
                              value: {
                                name: "signature",
                                type: "object",
                                raw: `{
  error?: string;
  mode: ToolMode;
  request: Record<string, unknown>;
  response?: Record<string, unknown>;
}`,
                                signature: {
                                  properties: [
                                    { key: "error", value: { name: "string", required: !1 } },
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
                                  ],
                                },
                                required: !1,
                              },
                            },
                          ],
                        },
                      },
                      name: "result",
                    },
                  ],
                  return: { name: "void" },
                },
              },
              name: "listener",
            },
          ],
          return: { name: "void" },
        },
      },
      description: "",
    },
  },
};
const Tt = { title: "Widget/MartianDatetimeWidget", component: be };
function xt(e, t) {
  return e === "get_current_imperial_datetime"
    ? {
        structuredContent: {
          mode: "get_current_imperial",
          request: t,
          response: {
            imperialDateTimeFormatted: "1239-08-20T12:34:56+00:00",
            gregorianDateTime: "2026-02-16T12:34:56.000Z",
          },
        },
      }
    : e === "convert_imperial_to_gregorian_datetime"
      ? {
          structuredContent: {
            mode: "convert_imperial_to_gregorian",
            request: t,
            response: { gregorianDateTime: "2026-02-16T09:00:00+09:00" },
          },
        }
      : {
          structuredContent: {
            mode: "convert_gregorian_to_imperial",
            request: t,
            response: { imperialDateTimeFormatted: "1239-08-20T10:00:00+09:00" },
          },
        };
}
const Q = { args: { callTool: async (e, t) => (await new Promise((r) => setTimeout(r, 120)), xt(e, t)) } };
Q.parameters = {
  ...Q.parameters,
  docs: {
    ...Q.parameters?.docs,
    source: {
      originalSource: `{
  args: {
    callTool: async (name, args) => {
      await new Promise(resolve => setTimeout(resolve, 120));
      return mockResult(name, args);
    }
  }
}`,
      ...Q.parameters?.docs?.source,
    },
  },
};
const Ct = ["Default"];
export { Q as Default, Ct as __namedExportsOrder, Tt as default };
