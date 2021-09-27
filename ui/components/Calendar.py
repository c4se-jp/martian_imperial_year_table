"""Calendar component."""
from imperial_calendar.GregorianDateTime import GregorianDateTime
from imperial_calendar.ImperialDateTime import ImperialDateTime
from imperial_calendar.ImperialYearMonth import ImperialYearMonth
from ui.Api import Api
from ui.utils import current_grdt
import typing as t

__pragma__: t.Any = 0  # __:skip
encodeURIComponent: t.Any = 0  # __:skip
js_undefined: t.Any = 0  # __:skip
JSON: t.Any = 0  # __:skip
React: t.Any = 0  # __:skip
ReactHelmet: t.Any = 0  # __:skip
ReactHookForm: t.Any = 0  # __:skip

__pragma__(  # noqa: F821
    "js",
    "{}",
    """
    const React = require("react");
    const ReactHelmet = require("react-helmet");
    const ReactHookForm = require("react-hook-form");
    window.process = {"env": {"NODE_ENV": "production"}}
    """,
)

INITIAL_DATETIME: t.Dict[str, t.Any] = {
    "grdt": GregorianDateTime(1970, 1, 1, 0, 0, 0, "+00:00"),
    "imdt": ImperialDateTime(1398, 23, 12, 22, 5, 33, "+00:00"),
}


def merge_dict(first: dict, second: dict) -> dict:
    """Merge 2 dict like `{**first, **second}`. This is because Transcrypt cannot actually tream kwargs."""
    result = {}
    result.update(first)
    result.update(second)
    return result


async def draw(form, ref) -> None:
    """Draw the calendar SVG."""
    grdt = current_grdt()
    values = form.getValues()
    params = {
        "grdt_timezone": grdt.timezone,
        "imdt": {
            "year": int(values["imdt"]["year"]),
            "month": int(values["imdt"]["month"]),
        },
    }
    svg = await Api().get_calendar_svg(params)
    html = '<a href="/api/calendar.svg?params={}">{}</a>'.format(
        encodeURIComponent(JSON.stringify(params)),
        svg,
    )
    ref.current.innerHTML = html


async def set_to_current(form, ref) -> None:
    """Draw a calendar at now."""
    grdt = current_grdt()
    form.setValue("grdt.timezone", grdt.timezone)
    response = await Api().get_datetimes(
        {
            "grdt_timezone": grdt.timezone,
            "imdt_timezone": "+00:00",
            "grdt": {
                "year": grdt.year,
                "month": grdt.month,
                "day": grdt.day,
                "hour": grdt.hour,
                "minute": grdt.minute,
                "second": grdt.second,
            },
        },
    )
    form.setValue("imdt.year", response["imdt"].year)
    form.setValue("imdt.month", response["imdt"].month)
    await draw(form, ref)


async def turn_to_next(form, ref) -> None:
    """Turn the calendar to the next month."""
    values = form.getValues()
    next_month = ImperialYearMonth(
        int(values["imdt"]["year"]), int(values["imdt"]["month"])
    ).next_month()
    form.setValue("imdt.year", next_month.year)
    form.setValue("imdt.month", next_month.month)
    await draw(form, ref)


async def turn_to_previous(form, ref) -> None:
    """Turn the calendar to the previous month."""
    values = form.getValues()
    prev_month = ImperialYearMonth(
        int(values["imdt"]["year"]), int(values["imdt"]["month"])
    ).prev_month()
    form.setValue("imdt.year", prev_month.year)
    form.setValue("imdt.month", prev_month.month)
    await draw(form, ref)


def Calendar(props: dict):
    """Render a Calendar component."""
    form = ReactHookForm.useForm(
        {
            "defaultValues": {
                "grdt": {
                    "timezone": INITIAL_DATETIME["grdt"].timezone,
                },
                "imdt": {
                    "year": INITIAL_DATETIME["imdt"].year,
                    "month": INITIAL_DATETIME["imdt"].month,
                },
            },
        },
    )
    ref = React.useRef()
    React.useEffect(lambda: set_to_current(form, ref) and js_undefined, [form, ref])
    return React.createElement(
        React.Fragment,
        {},
        React.createElement(
            ReactHelmet.Helmet,
            {},
            React.createElement("title", {}, "七曜表 | 帝國火星曆"),
        ),
        React.createElement(
            "div",
            {"onSubmit": lambda event: event.preventDefault()},
            React.createElement(
                "form",
                {},
                React.createElement(
                    "div",
                    {"className": "field is-grouped"},
                    React.createElement(
                        "label", {"className": "label"}, "Gregorian Date Time"
                    ),
                    React.createElement(
                        "input",
                        merge_dict(
                            form.register("grdt.timezone"),
                            {
                                "className": "input",
                                "disabled": True,
                                "style": {"width": "6em"},
                                "type": "text",
                            },
                        ),
                    ),
                ),
                React.createElement(
                    "div",
                    {"className": "field is-grouped"},
                    React.createElement(
                        "label", {"className": "label"}, "Imperial Date Time"
                    ),
                    React.createElement(
                        "input",
                        merge_dict(
                            form.register("imdt.year"),
                            {
                                "className": "input",
                                "style": {"width": "6em"},
                                "type": "number",
                            },
                        ),
                    ),
                    "-",
                    React.createElement(
                        "input",
                        merge_dict(
                            form.register("imdt.month"),
                            {
                                "className": "input",
                                "max": 24,
                                "min": 1,
                                "style": {"width": "3.5em"},
                                "type": "number",
                            },
                        ),
                    ),
                    React.createElement(
                        "button",
                        {
                            "className": "button is-dark",
                            "onClick": lambda event: draw(form, ref),
                        },
                        "Draw",
                    ),
                ),
                React.createElement(
                    "div",
                    {"className": "field is-grouped"},
                    React.createElement(
                        "button",
                        {
                            "className": "button is-dark",
                            "onClick": lambda event: turn_to_previous(form, ref),
                        },
                        "◀",
                    ),
                    React.createElement(
                        "button",
                        {
                            "className": "button is-dark",
                            "onClick": lambda event: turn_to_next(form, ref),
                        },
                        "▶",
                    ),
                ),
            ),
            React.createElement("div", {"ref": ref}),
        ),
    )
