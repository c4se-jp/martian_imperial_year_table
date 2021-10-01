"""Calendar component."""
from imperial_calendar.ImperialYearMonth import ImperialYearMonth
from ui.Api import Api
from ui.utils import RhfForm, current_grdt, merge_dict
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


class CalendarState:
    """<Calendar />'s state."""

    def __init__(
        self,
        grdt_timezone: t.Optional[str],
        imperial_year_month: t.Optional[ImperialYearMonth],
    ):
        """Init."""
        self.grdt_timezone = grdt_timezone or "+00:00"  # type: str
        self.imperial_year_month = imperial_year_month or ImperialYearMonth(
            1398, 23
        )  # type: ImperialYearMonth

    def __repr__(self) -> str:
        """Repr."""
        return "CalendarState({}, {})".format(
            self.grdt_timezone, self.imperial_year_month
        )


SetCalendarState = t.Callable[[CalendarState], None]  # __:skip


async def draw(state: CalendarState, ref) -> None:
    """Draw the calendar SVG."""
    params = {
        "grdt_timezone": state.grdt_timezone,
        "imdt": {
            "year": state.imperial_year_month.year,
            "month": state.imperial_year_month.month,
        },
    }
    svg = await Api().get_calendar_svg(params)
    html = '<a href="/api/calendar.svg?params={}">{}</a>'.format(
        encodeURIComponent(JSON.stringify(params)),
        svg,
    )
    ref.current.innerHTML = html


async def set_by_form(
    state: CalendarState, set_state: SetCalendarState, form: RhfForm, ref
) -> None:
    """Draw a calendar at the form values."""
    values = form.getValues()
    new_state = CalendarState(
        values["grdt"]["timezone"],
        ImperialYearMonth(int(values["imdt"]["year"]), int(values["imdt"]["month"])),
    )
    set_state(new_state)
    await draw(new_state, ref)


async def set_to_current(
    state: CalendarState, set_state: SetCalendarState, ref
) -> None:
    """Draw a calendar at now."""
    grdt = current_grdt()
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
    new_state = CalendarState(
        grdt.timezone, ImperialYearMonth(response.imdt.year, response.imdt.month)
    )
    set_state(new_state)
    await draw(new_state, ref)


async def turn_to_next(state: CalendarState, set_state: SetCalendarState, ref) -> None:
    """Turn the calendar to the next month."""
    next_month = state.imperial_year_month.next_month()
    new_state = CalendarState(state.grdt_timezone, next_month)
    set_state(new_state)
    await draw(new_state, ref)


async def turn_to_previous(
    state: CalendarState, set_state: SetCalendarState, ref
) -> None:
    """Turn the calendar to the previous month."""
    prev_month = state.imperial_year_month.prev_month()
    new_state = CalendarState(state.grdt_timezone, prev_month)
    set_state(new_state)
    await draw(new_state, ref)


def Calendar(props: dict):
    """Render a Calendar component."""
    state: CalendarState
    set_state: SetCalendarState
    [state, set_state] = React.useState(CalendarState(None, None))
    form: RhfForm = ReactHookForm.useForm()
    # NOTE: <Transform /> の form と構造を揃へてある
    form.setValue("grdt.timezone", state.grdt_timezone)
    form.setValue("imdt.year", state.imperial_year_month.year)
    form.setValue("imdt.month", state.imperial_year_month.month)
    ref = React.useRef()
    React.useEffect(
        lambda: set_to_current(state, set_state, ref) and js_undefined, [form, ref]
    )
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
                            "onClick": lambda event: set_by_form(
                                state, set_state, form, ref
                            ),
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
                            "onClick": lambda event: turn_to_previous(
                                state, set_state, ref
                            ),
                        },
                        "◀",
                    ),
                    React.createElement(
                        "button",
                        {
                            "className": "button is-dark",
                            "onClick": lambda event: turn_to_next(
                                state, set_state, ref
                            ),
                        },
                        "▶",
                    ),
                ),
            ),
            React.createElement("div", {"ref": ref}),
        ),
    )
