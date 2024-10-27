"""ErrorBoundary component."""

import typing as t

__pragma__: t.Any = 0  # __:skip
console: t.Any = 0  # __:skip
createReactClass: t.Any = 0  # __:skip
jsx: t.Any = 0  # __:skip
jsxs: t.Any = 0  # __:skip

__pragma__(  # noqa: F821
    "js",
    "{}",
    """
    const { jsx, jsxs } = require("react/jsx-runtime");
    const createReactClass = require("create-react-class");
    """,
)


def renderErrorBoundary():
    """Render a component."""
    this: t.Any = 0  # __:skip
    if this.state.has_error:
        return jsxs("a", {"children": ["再讀み込み"], "href": "/"})
    return this.props.children


ErrorBoundary = createReactClass(
    {
        "componentDidCatch": lambda error, errorInfo: console.error(error, errorInfo),
        "displayName": "ErrorBoundary",
        "getInitialState": lambda: {"has_error": False},
        "render": renderErrorBoundary,
        "statics": {"getDerivedStateFromError": lambda error: {"has_error": True}},
    }
)


def supervise(*children):
    """Supervise children components & give a fallback UI."""
    return jsx(ErrorBoundary, {"children": [*children]})
