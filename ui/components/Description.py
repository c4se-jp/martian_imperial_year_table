"""Description component."""
from ui.Api import Api
import typing as t

__pragma__: t.Any = 0  # __:skip
js_undefined: t.Any = 0  # __:skip
React: t.Any = 0  # __:skip
ReactHelmet: t.Any = 0  # __:skip

__pragma__(  # noqa: F821
    "js",
    "{}",
    """
    const React = require("react");
    const ReactHelmet = require("react-helmet");
    """,
)


async def fetch_description(html: str, set_html) -> None:
    """Fetch the description from the Web API."""
    if html is not None:
        return
    description = await Api().get_description_html()
    set_html(description.html)


def use_description() -> str:
    """Provide a hook to fetch thr description."""
    [html, set_html] = React.useState(None)
    React.useEffect(lambda: fetch_description(html, set_html) and js_undefined)
    return html


def draw_description(html: str, ref) -> None:
    """Draw the description HTML."""
    if html is not None:
        ref.current.innerHTML = html


def Description(props: dict):
    """Render a Description component."""
    html = use_description()
    ref = React.useRef()
    React.useEffect(lambda: draw_description(html, ref), [html, ref])
    return React.createElement(
        React.Fragment,
        {},
        React.createElement(
            ReactHelmet.Helmet,
            {},
            React.createElement("title", {}, "解説 | 帝國火星曆"),
        ),
        React.createElement(
            "div", {"className": "content section", "ref": ref}, "讀み込み中"
        ),
    )
