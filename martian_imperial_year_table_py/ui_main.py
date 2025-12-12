"""Main."""

from ui.components.App import App
import typing as t

__pragma__: t.Any = 0  # __:skip
createRoot: t.Any = 0  # __:skip
document: t.Any = 0  # __:skip
jsx: t.Any = 0  # __:skip
jsxs: t.Any = 0  # __:skip
window: t.Any = 0  # __:skip

__pragma__(  # noqa: F821
    "js",
    "{}",
    """
    const { jsx, jsxs } = require("react/jsx-runtime");
    const { createRoot } = require("react-dom/client");
    """,
)

if __name__ == "__main__":
    window.addEventListener(
        "DOMContentLoaded",
        lambda event: createRoot(document.getElementById("app")).render(jsxs(App, {})),
    )
