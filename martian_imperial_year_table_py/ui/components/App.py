"""Root React component."""

from ui.components.Calendar import Calendar
from ui.components.Description import Description
from ui.components.ErrorBoundary import supervise
from ui.components.GlobalNavigation import GlobalNavigation
from ui.components.Transform import Transform
import typing as t

ReactRouterDOM: t.Any = 0  # __:skip
__pragma__: t.Any = 0  # __:skip
jsx: t.Any = 0  # __:skip
jsxs: t.Any = 0  # __:skip

__pragma__(  # noqa: F821
    "js",
    "{}",
    """
    const { jsx , jsxs } = require("react/jsx-runtime");
    const ReactRouterDOM = require("react-router-dom");
    """,
)


def App(props):
    """Root React component."""
    return supervise(
        jsxs(
            ReactRouterDOM.BrowserRouter,
            {
                "children": [
                    supervise(jsxs(GlobalNavigation, {})),
                    supervise(
                        jsxs(
                            ReactRouterDOM.Routes,
                            {
                                "children": [
                                    jsxs(
                                        ReactRouterDOM.Route,
                                        {
                                            "path": "/",
                                            "element": jsxs(Transform, {}),
                                        },
                                    ),
                                    jsxs(
                                        ReactRouterDOM.Route,
                                        {
                                            "path": "/description",
                                            "element": jsxs(Description, {}),
                                        },
                                    ),
                                    jsxs(
                                        ReactRouterDOM.Route,
                                        {
                                            "path": "/calendar",
                                            "element": jsxs(Calendar, {}),
                                        },
                                    ),
                                ],
                            },
                        ),
                    ),
                ],
            },
        ),
    )
