"""GlobalNavigation component."""
import typing as t

React: t.Any = 0  # __:skip
ReactRouterDOM: t.Any = 0  # __:skip
__pragma__: t.Any = 0  # __:skip
jsx: t.Any = 0  # __:skip
jsxs: t.Any = 0  # __:skip

__pragma__(  # noqa: F821
    "js",
    "{}",
    """
    const React = require("react");
    const { jsx, jsxs } = require("react/jsx-runtime");
    const ReactRouterDOM = require("react-router-dom");
    """,
)


def GlobalNavigation(props: dict):
    """Render a GlobalNavigation component."""
    [is_active, set_is_active] = React.useState(False)
    return jsxs(
        "nav",
        {
            "aria-label": "main navigation",
            "children": [
                jsxs(
                    "div",
                    {
                        "children": [
                            jsxs(
                                "h1",
                                {
                                    "children": [
                                        jsxs(
                                            "img",
                                            {
                                                "alt": "帝國火星曆",
                                                "src": "/static/img/martian_empire.png",
                                            },
                                        )
                                    ],
                                    "className": "navbar-item",
                                },
                            ),
                            jsxs(
                                "a",
                                {
                                    "aria-expanded": "false",
                                    "aria-label": "menu",
                                    "children": [
                                        jsxs("span", {"aria-hidden": "true"}),
                                        jsxs("span", {"aria-hidden": "true"}),
                                        jsxs("span", {"aria-hidden": "true"}),
                                    ],
                                    "className": "navbar-burger {}".format(
                                        "is-active" if is_active else ""
                                    ),
                                    "onClick": lambda event: set_is_active(
                                        not is_active
                                    ),
                                    "role": "button",
                                },
                            ),
                        ],
                        "className": "navbar-brand",
                    },
                ),
                jsxs(
                    "div",
                    {
                        "children": [
                            jsxs(
                                "div",
                                {
                                    "children": [
                                        jsxs(
                                            ReactRouterDOM.NavLink,
                                            {
                                                "children": ["變換"],
                                                "className": lambda props: "is-active is-tab navbar-item"
                                                if props["isActive"]
                                                else "is-tab navbar-item",
                                                "end": None,
                                                "to": "/",
                                            },
                                        ),
                                        jsxs(
                                            ReactRouterDOM.NavLink,
                                            {
                                                "children": ["解説"],
                                                "className": lambda props: "is-active is-tab navbar-item"
                                                if props["isActive"]
                                                else "is-tab navbar-item",
                                                "to": "/description",
                                            },
                                        ),
                                        jsxs(
                                            ReactRouterDOM.NavLink,
                                            {
                                                "children": ["七曜表"],
                                                "className": lambda props: "is-active is-tab navbar-item"
                                                if props["isActive"]
                                                else "is-tab navbar-item",
                                                "to": "/calendar",
                                            },
                                        ),
                                    ],
                                    "className": "navbar-start",
                                },
                            ),
                            jsxs(
                                "div",
                                {
                                    "children": [
                                        jsxs(
                                            "a",
                                            {
                                                "children": [
                                                    jsxs(
                                                        "img",
                                                        {
                                                            "alt": "GitHub",
                                                            "src": "/static/img/GitHub-Mark-120px-plus.png",
                                                        },
                                                    )
                                                ],
                                                "className": "navbar-item",
                                                "href": "https://github.com/c4se-jp/martian_imperial_year_table",
                                                "title": "GitHub",
                                            },
                                        )
                                    ],
                                    "className": "navbar-end",
                                },
                            ),
                        ],
                        "className": "navbar-menu {}".format(
                            "is-active" if is_active else ""
                        ),
                    },
                ),
            ],
            "className": "navbar",
            "role": "navigation",
        },
    )
