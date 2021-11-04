"""GlobalNavigation component."""
import typing as t

__pragma__: t.Any = 0  # __:skip
React: t.Any = 0  # __:skip
ReactRouterDOM: t.Any = 0  # __:skip

__pragma__(  # noqa: F821
    "js",
    "{}",
    """
    const React = require("react");
    const ReactRouterDOM = require("react-router-dom");
    """,
)


def GlobalNavigation(props: dict):
    """Render a GlobalNavigation component."""
    [is_active, set_is_active] = React.useState(False)
    return React.createElement(
        "nav",
        {"aria-label": "main navigation", "className": "navbar", "role": "navigation"},
        React.createElement(
            "div",
            {"className": "navbar-brand"},
            React.createElement(
                "h1",
                {"className": "navbar-item"},
                React.createElement(
                    "img", {"alt": "帝國火星曆", "src": "/static/img/martian_empire.png"}
                ),
            ),
            React.createElement(
                "a",
                {
                    "aria-expanded": "false",
                    "aria-label": "menu",
                    "className": "navbar-burger {}".format(
                        "is-active" if is_active else ""
                    ),
                    "onClick": lambda event: set_is_active(not is_active),
                    "role": "button",
                },
                React.createElement("span", {"aria-hidden": "true"}, ""),
                React.createElement("span", {"aria-hidden": "true"}, ""),
                React.createElement("span", {"aria-hidden": "true"}, ""),
            ),
        ),
        React.createElement(
            "div",
            {"className": "navbar-menu {}".format("is-active" if is_active else "")},
            React.createElement(
                "div",
                {"className": "navbar-start"},
                React.createElement(
                    ReactRouterDOM.NavLink,
                    {
                        "className": lambda props: "is-active is-tab navbar-item"
                        if props["isActive"]
                        else "is-tab navbar-item",
                        "end": None,
                        "to": "/",
                    },
                    "變換",
                ),
                React.createElement(
                    ReactRouterDOM.NavLink,
                    {
                        "className": lambda props: "is-active is-tab navbar-item"
                        if props["isActive"]
                        else "is-tab navbar-item",
                        "to": "/description",
                    },
                    "解説",
                ),
                React.createElement(
                    ReactRouterDOM.NavLink,
                    {
                        "className": lambda props: "is-active is-tab navbar-item"
                        if props["isActive"]
                        else "is-tab navbar-item",
                        "to": "/calendar",
                    },
                    "七曜表",
                ),
            ),
            React.createElement(
                "div",
                {"className": "navbar-end"},
                React.createElement(
                    "a",
                    {
                        "className": "navbar-item",
                        "href": "https://github.com/c4se-jp/martian_imperial_year_table",
                        "title": "GitHub",
                    },
                    React.createElement(
                        "img",
                        {
                            "alt": "GitHub",
                            "src": "/static/img/GitHub-Mark-120px-plus.png",
                        },
                    ),
                ),
            ),
        ),
    )
