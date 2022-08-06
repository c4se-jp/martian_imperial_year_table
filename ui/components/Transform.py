"""Transform component."""
from imperial_calendar.GregorianDateTime import GregorianDateTime
from imperial_calendar.ImperialDateTime import ImperialDateTime
from imperial_calendar.ImperialSolNumber import ImperialSolNumber
from imperial_calendar.JulianDay import JulianDay
from imperial_calendar.MarsSolDate import MarsSolDate
from imperial_calendar.TerrestrialTime import TerrestrialTime
from ui.Api import Api
from ui.utils import RhfForm, current_grdt, merge_dict
import typing as t

React: t.Any = 0  # __:skip
ReactHelmet: t.Any = 0  # __:skip
ReactHookForm: t.Any = 0  # __:skip
__pragma__: t.Any = 0  # __:skip
js_undefined: t.Any = 0  # __:skip
jsx: t.Any = 0  # __:skip
jsxs: t.Any = 0  # __:skip

__pragma__(  # noqa: F821
    "js",
    "{}",
    """
    const React = require("react");
    const { jsx, jsxs } = require("react/jsx-runtime");
    const ReactHelmet = require("react-helmet");
    const ReactHookForm = require("react-hook-form");
    window.process = {"env": {"NODE_ENV": "production"}}
    """,
)


class TransformState:
    """<Transform />'s state."""

    def __init__(
        self,
        grdt: t.Optional[GregorianDateTime],
        juld: t.Optional[JulianDay],
        delta_t: t.Optional[float],
        tert: t.Optional[TerrestrialTime],
        mrls: t.Optional[float],
        mrsd: t.Optional[MarsSolDate],
        imsn: t.Optional[ImperialSolNumber],
        imdt: t.Optional[ImperialDateTime],
    ):
        """Init."""
        self.grdt = grdt or GregorianDateTime(1970, 1, 1, 0, 0, 0, "+00:00")
        self.juld = juld or JulianDay(2440587, 43200.0)
        self.delta_t = delta_t or 40.19294086136705
        self.tert = tert or TerrestrialTime(2440587.500465196)
        self.mrls = mrls or 295.3794638508962
        self.mrsd = mrsd or MarsSolDate(34127.295516404454)
        self.imsn = imsn or ImperialSolNumber(935321, 79532.61734358966)
        self.imdt = imdt or ImperialDateTime(1398, 23, 12, 22, 5, 33, "+00:00")

    def __repr__(self):
        """Repr."""
        return "TransformState({}, {}, {}, {}, {}, {}, {}, {})".format(
            self.grdt,
            self.juld,
            self.delta_t,
            self.tert,
            self.mrls,
            self.mrsd,
            self.imsn,
            self.imdt,
        )


SetTransformState = t.Callable[[TransformState], None]  # __:skip


async def sync_by_grdt(state: TransformState, set_state: SetTransformState):
    """Sync a datetime by the grdt."""
    response = await Api().get_datetimes(
        {
            "grdt_timezone": state.grdt.timezone,
            "imdt_timezone": state.imdt.timezone,
            "grdt": {
                "year": state.grdt.year,
                "month": state.grdt.month,
                "day": state.grdt.day,
                "hour": state.grdt.hour,
                "minute": state.grdt.minute,
                "second": state.grdt.second,
            },
        },
    )
    new_state = TransformState(
        state.grdt,
        response.juld,
        response.delta_t,
        response.tert,
        response.mrls,
        response.mrsd,
        response.imsn,
        response.imdt,
    )
    set_state(new_state)


async def sync_by_juld(state: TransformState, set_state: SetTransformState):
    """Sync a datetime by the juld."""
    response = await Api().get_datetimes(
        {
            "grdt_timezone": state.grdt.timezone,
            "imdt_timezone": state.imdt.timezone,
            "juld": {"day": state.juld.day, "second": state.juld.second},
        },
    )
    new_state = TransformState(
        response.grdt,
        state.juld,
        response.delta_t,
        response.tert,
        response.mrls,
        response.mrsd,
        response.imsn,
        response.imdt,
    )
    set_state(new_state)


async def sync_by_tert(state: TransformState, set_state: SetTransformState):
    """Sync a datetime by the tert."""
    response = await Api().get_datetimes(
        {
            "grdt_timezone": state.grdt.timezone,
            "imdt_timezone": state.imdt.timezone,
            "tert": {"terrestrial_time": state.tert.terrestrial_time},
        },
    )
    new_state = TransformState(
        response.grdt,
        response.juld,
        response.delta_t,
        state.tert,
        response.mrls,
        response.mrsd,
        response.imsn,
        response.imdt,
    )
    set_state(new_state)


async def sync_by_mrsd(state: TransformState, set_state: SetTransformState):
    """Sync a datetime by the mrsd."""
    response = await Api().get_datetimes(
        {
            "grdt_timezone": state.grdt.timezone,
            "imdt_timezone": state.imdt.timezone,
            "mrsd": {"mars_sol_date": state.mrsd.mars_sol_date},
        },
    )
    new_state = TransformState(
        response.grdt,
        response.juld,
        response.delta_t,
        response.tert,
        response.mrls,
        state.mrsd,
        response.imsn,
        response.imdt,
    )
    set_state(new_state)


async def sync_by_imsn(state: TransformState, set_state: SetTransformState):
    """Sync a datetime by the imsn."""
    response = await Api().get_datetimes(
        {
            "grdt_timezone": state.grdt.timezone,
            "imdt_timezone": state.imdt.timezone,
            "imsn": {"day": state.imsn.day, "second": state.imsn.second},
        },
    )
    new_state = TransformState(
        response.grdt,
        response.juld,
        response.delta_t,
        response.tert,
        response.mrls,
        response.mrsd,
        state.imsn,
        response.imdt,
    )
    set_state(new_state)


async def sync_by_imdt(state: TransformState, set_state: SetTransformState):
    """Sync a datetime by the imdt."""
    response = await Api().get_datetimes(
        {
            "grdt_timezone": state.grdt.timezone,
            "imdt_timezone": state.imdt.timezone,
            "imdt": {
                "year": state.imdt.year,
                "month": state.imdt.month,
                "day": state.imdt.day,
                "hour": state.imdt.hour,
                "minute": state.imdt.minute,
                "second": state.imdt.second,
            },
        },
    )
    new_state = TransformState(
        response.grdt,
        response.juld,
        response.delta_t,
        response.tert,
        response.mrls,
        response.mrsd,
        response.imsn,
        state.imdt,
    )
    set_state(new_state)


async def set_to_current(state: TransformState, set_state: SetTransformState):
    """Sync a datetime by the current grdt."""
    new_state = TransformState(
        current_grdt(),
        state.juld,
        state.delta_t,
        state.tert,
        state.mrls,
        state.mrsd,
        state.imsn,
        state.imdt,
    )
    await sync_by_grdt(new_state, set_state)


def SetToCurrent(props: dict):
    """Render a SetToCurrent component."""
    state: TransformState = props["state"]
    set_state: SetTransformState = props["set_state"]
    return jsxs(
        "div",
        {
            "children": [
                jsxs(
                    "button",
                    {
                        "children": ["現在日時"],
                        "className": "button is-dark",
                        "onClick": lambda event: set_to_current(state, set_state),
                    },
                ),
            ]
        },
    )


def Grdt(props: dict):
    """Render a Grdt component."""
    form: RhfForm = props["form"]
    state: TransformState = props["state"]
    set_state: SetTransformState = props["set_state"]

    def on_click(event):
        values = form.getValues()
        grdt = GregorianDateTime(
            int(values["grdt"]["year"]),
            int(values["grdt"]["month"]),
            int(values["grdt"]["day"]),
            int(values["grdt"]["hour"]),
            int(values["grdt"]["minute"]),
            int(values["grdt"]["second"]),
            values["grdt"]["timezone"],
        )
        new_state = TransformState(
            grdt,
            state.juld,
            state.delta_t,
            state.tert,
            state.mrls,
            state.mrsd,
            state.imsn,
            state.imdt,
        )
        sync_by_grdt(new_state, set_state)

    form.setValue("grdt.year", state.grdt.year)
    form.setValue("grdt.month", state.grdt.month)
    form.setValue("grdt.day", state.grdt.day)
    form.setValue("grdt.hour", state.grdt.hour)
    form.setValue("grdt.minute", state.grdt.minute)
    form.setValue("grdt.second", state.grdt.second)
    form.setValue("grdt.timezone", state.grdt.timezone)
    return jsxs(
        "div",
        {
            "children": [
                jsxs(
                    "label",
                    {
                        "children": ["Gregorian Date Time"],
                        "className": "column is-2 label",
                    },
                ),
                jsxs(
                    "div",
                    {
                        "children": [
                            jsxs(
                                "input",
                                merge_dict(
                                    form.register("grdt.year"),
                                    {
                                        "className": "input",
                                        "style": {"width": "6em"},
                                        "type": "number",
                                    },
                                ),
                            ),
                            "-",
                            jsxs(
                                "input",
                                merge_dict(
                                    form.register("grdt.month"),
                                    {
                                        "className": "input",
                                        "max": 12,
                                        "min": 1,
                                        "style": {"width": "3.5em"},
                                        "type": "number",
                                    },
                                ),
                            ),
                            "-",
                            jsxs(
                                "input",
                                merge_dict(
                                    form.register("grdt.day"),
                                    {
                                        "className": "input",
                                        "max": 31,
                                        "min": 1,
                                        "style": {"width": "3.5em"},
                                        "type": "number",
                                    },
                                ),
                            ),
                            "T",
                            jsxs(
                                "input",
                                merge_dict(
                                    form.register("grdt.hour"),
                                    {
                                        "className": "input",
                                        "max": 23,
                                        "min": 0,
                                        "style": {"width": "3.5em"},
                                        "type": "number",
                                    },
                                ),
                            ),
                            ":",
                            jsxs(
                                "input",
                                merge_dict(
                                    form.register("grdt.minute"),
                                    {
                                        "className": "input",
                                        "max": 59,
                                        "min": 0,
                                        "style": {"width": "3.5em"},
                                        "type": "number",
                                    },
                                ),
                            ),
                            ":",
                            jsxs(
                                "input",
                                merge_dict(
                                    form.register("grdt.second"),
                                    {
                                        "className": "input",
                                        "max": 59,
                                        "min": 0,
                                        "style": {"width": "3.5em"},
                                        "type": "number",
                                    },
                                ),
                            ),
                            jsxs(
                                "input",
                                merge_dict(
                                    form.register("grdt.timezone"),
                                    {
                                        "className": "input",
                                        "style": {"width": "6em"},
                                        "type": "text",
                                    },
                                ),
                            ),
                            jsxs(
                                "button",
                                {
                                    "children": ["Sync"],
                                    "className": "button is-dark",
                                    "onClick": on_click,
                                },
                            ),
                        ],
                        "className": "column control",
                    },
                ),
            ],
            "className": "columns field",
        },
    )


def Juld(props: dict):
    """Render a Juld component."""
    form: RhfForm = props["form"]
    state: TransformState = props["state"]
    set_state: SetTransformState = props["set_state"]

    def on_click(event):
        values = form.getValues()
        juld = JulianDay(float(values["juld"]["julian_day"]))
        new_state = TransformState(
            state.grdt,
            juld,
            state.delta_t,
            state.tert,
            state.mrls,
            state.mrsd,
            state.imsn,
            state.imdt,
        )
        sync_by_juld(new_state, set_state)

    form.setValue("juld.julian_day", round(state.juld.julian_day, 5))
    return jsxs(
        "div",
        {
            "children": [
                jsxs(
                    "label",
                    {"children": ["Julian Day"], "className": "column is-2 label"},
                ),
                jsxs(
                    "div",
                    {
                        "children": [
                            jsxs(
                                "input",
                                merge_dict(
                                    form.register("juld.julian_day"),
                                    {
                                        "className": "input",
                                        "step": 0.00001,
                                        "style": {"width": "12em"},
                                        "type": "number",
                                    },
                                ),
                            ),
                            jsxs(
                                "button",
                                {
                                    "children": ["Sync"],
                                    "className": "button is-dark",
                                    "onClick": on_click,
                                },
                            ),
                        ],
                        "className": "column control",
                    },
                ),
            ],
            "className": "columns field",
        },
    )


def DeltaT(props: dict):
    """Render a DeltaT component."""
    form: RhfForm = props["form"]
    state: TransformState = props["state"]
    form.setValue("delta_t", round(state.delta_t, 5))
    return jsxs(
        "div",
        {
            "children": [
                jsxs("label", {"children": ["⊿t"], "className": "column is-2 label"}),
                jsxs(
                    "div",
                    {
                        "children": [
                            jsxs(
                                "input",
                                merge_dict(
                                    form.register("delta_t"),
                                    {
                                        "className": "input",
                                        "disabled": True,
                                        "step": 0.00001,
                                        "style": {"width": "12em"},
                                        "type": "number",
                                    },
                                ),
                            ),
                        ],
                        "className": "column control",
                    },
                ),
            ],
            "className": "columns field",
        },
    )


def Tert(props: dict):
    """Render a Tert component."""
    form: RhfForm = props["form"]
    state: TransformState = props["state"]
    set_state: SetTransformState = props["set_state"]

    def on_click(event):
        values = form.getValues()
        tert = TerrestrialTime(float(values["tert"]["terrestrial_time"]))
        new_state = TransformState(
            state.grdt,
            state.juld,
            state.delta_t,
            tert,
            state.mrls,
            state.mrsd,
            state.imsn,
            state.imdt,
        )
        sync_by_tert(new_state, set_state)

    form.setValue("tert.terrestrial_time", round(state.tert.terrestrial_time, 5))
    return jsxs(
        "div",
        {
            "children": [
                jsxs(
                    "label",
                    {
                        "children": ["Terrestrial Time"],
                        "className": "column is-2 label",
                    },
                ),
                jsxs(
                    "div",
                    {
                        "children": [
                            jsxs(
                                "input",
                                merge_dict(
                                    form.register("tert.terrestrial_time"),
                                    {
                                        "className": "input",
                                        "step": 0.00001,
                                        "style": {"width": "12em"},
                                        "type": "number",
                                    },
                                ),
                            ),
                            jsxs(
                                "button",
                                {
                                    "children": ["Sync"],
                                    "className": "button is-dark",
                                    "onClick": on_click,
                                },
                            ),
                        ],
                        "className": "column control",
                    },
                ),
            ],
            "className": "columns field",
        },
    )


def Mrls(props: dict):
    """Render a Mrls component."""
    form: RhfForm = props["form"]
    state: TransformState = props["state"]
    form.setValue("mrls", round(state.mrls, 5))
    return jsxs(
        "div",
        {
            "children": [
                jsxs(
                    "label",
                    {
                        "children": ["Areocentric Solar Longitude (Mars Ls)"],
                        "className": "column is-2 label",
                    },
                ),
                jsxs(
                    "div",
                    {
                        "children": [
                            jsxs(
                                "input",
                                merge_dict(
                                    form.register("mrls"),
                                    {
                                        "className": "input",
                                        "disabled": True,
                                        "step": 0.00001,
                                        "style": {"width": "12em"},
                                        "type": "number",
                                    },
                                ),
                            ),
                        ],
                        "className": "column control",
                    },
                ),
            ],
            "className": "columns field",
        },
    )


def Mrsd(props: dict):
    """Render a Mrsd component."""
    form: RhfForm = props["form"]
    state: TransformState = props["state"]
    set_state: SetTransformState = props["set_state"]

    def on_click(event):
        values = form.getValues()
        mrsd = MarsSolDate(float(values["mrsd"]["mars_sol_date"]))
        new_state = TransformState(
            state.grdt,
            state.juld,
            state.delta_t,
            state.tert,
            state.mrls,
            mrsd,
            state.imsn,
            state.imdt,
        )
        sync_by_mrsd(new_state, set_state)

    form.setValue("mrsd.mars_sol_date", round(state.mrsd.mars_sol_date, 5))
    return jsxs(
        "div",
        {
            "children": [
                jsxs(
                    "label",
                    {"children": ["Mars Sol Date"], "className": "column is-2 label"},
                ),
                jsxs(
                    "div",
                    {
                        "children": [
                            jsxs(
                                "input",
                                merge_dict(
                                    form.register("mrsd.mars_sol_date"),
                                    {
                                        "className": "input",
                                        "step": 0.00001,
                                        "style": {"width": "12em"},
                                        "type": "number",
                                    },
                                ),
                            ),
                            jsxs(
                                "button",
                                {
                                    "children": ["Sync"],
                                    "className": "button is-dark",
                                    "onClick": on_click,
                                },
                            ),
                        ],
                        "className": "column control",
                    },
                ),
            ],
            "className": "columns field",
        },
    )


def Imsn(props: dict):
    """Render a Imsn component."""
    form: RhfForm = props["form"]
    state: TransformState = props["state"]
    set_state: SetTransformState = props["set_state"]

    def on_click(event):
        values = form.getValues()
        imsn = ImperialSolNumber(float(values["imsn"]["imperial_sol_number"]))
        new_state = TransformState(
            state.grdt,
            state.juld,
            state.delta_t,
            state.tert,
            state.mrls,
            state.mrsd,
            imsn,
            state.imdt,
        )
        sync_by_imsn(new_state, set_state)

    form.setValue("imsn.imperial_sol_number", round(state.imsn.imperial_sol_number, 5))
    return jsxs(
        "div",
        {
            "children": [
                jsxs(
                    "label",
                    {
                        "children": ["Imperial Sol Number"],
                        "className": "column is-2 label",
                    },
                ),
                jsxs(
                    "div",
                    {
                        "children": [
                            jsxs(
                                "input",
                                merge_dict(
                                    form.register("imsn.imperial_sol_number"),
                                    {
                                        "className": "input",
                                        "step": 0.00001,
                                        "style": {"width": "12em"},
                                        "type": "number",
                                    },
                                ),
                            ),
                            jsxs(
                                "button",
                                {
                                    "children": [
                                        "Sync",
                                    ],
                                    "className": "button is-dark",
                                    "onClick": on_click,
                                },
                            ),
                        ],
                        "className": "column control",
                    },
                ),
            ],
            "className": "columns field",
        },
    )


def Imdt(props: dict):
    """Render a Imdt component."""
    form: RhfForm = props["form"]
    state: TransformState = props["state"]
    set_state: SetTransformState = props["set_state"]

    def on_click(event):
        values = form.getValues()
        imdt = ImperialDateTime(
            int(values["imdt"]["year"]),
            int(values["imdt"]["month"]),
            int(values["imdt"]["day"]),
            int(values["imdt"]["hour"]),
            int(values["imdt"]["minute"]),
            int(values["imdt"]["second"]),
            values["imdt"]["timezone"],
        )
        new_state = TransformState(
            state.grdt,
            state.juld,
            state.delta_t,
            state.tert,
            state.mrls,
            state.mrsd,
            state.imsn,
            imdt,
        )
        sync_by_imdt(new_state, set_state)

    form.setValue("imdt.year", state.imdt.year)
    form.setValue("imdt.month", state.imdt.month)
    form.setValue("imdt.day", state.imdt.day)
    form.setValue("imdt.hour", state.imdt.hour)
    form.setValue("imdt.minute", state.imdt.minute)
    form.setValue("imdt.second", state.imdt.second)
    form.setValue("imdt.timezone", state.imdt.timezone)
    return jsxs(
        "div",
        {
            "children": [
                jsxs(
                    "label",
                    {
                        "children": [
                            "Imperial Date Time",
                        ],
                        "className": "column is-2 label",
                    },
                ),
                jsxs(
                    "div",
                    {
                        "children": [
                            jsxs(
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
                            jsxs(
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
                            "-",
                            jsxs(
                                "input",
                                merge_dict(
                                    form.register("imdt.day"),
                                    {
                                        "className": "input",
                                        "max": 28,
                                        "min": 1,
                                        "style": {"width": "3.5em"},
                                        "type": "number",
                                    },
                                ),
                            ),
                            "T",
                            jsxs(
                                "input",
                                merge_dict(
                                    form.register("imdt.hour"),
                                    {
                                        "className": "input",
                                        "max": 23,
                                        "min": 0,
                                        "style": {"width": "3.5em"},
                                        "type": "number",
                                    },
                                ),
                            ),
                            ":",
                            jsxs(
                                "input",
                                merge_dict(
                                    form.register("imdt.minute"),
                                    {
                                        "className": "input",
                                        "max": 59,
                                        "min": 0,
                                        "style": {"width": "3.5em"},
                                        "type": "number",
                                    },
                                ),
                            ),
                            ":",
                            jsxs(
                                "input",
                                merge_dict(
                                    form.register("imdt.second"),
                                    {
                                        "className": "input",
                                        "max": 59,
                                        "min": 0,
                                        "style": {"width": "3.5em"},
                                        "type": "number",
                                    },
                                ),
                            ),
                            jsxs(
                                "input",
                                merge_dict(
                                    form.register("imdt.timezone"),
                                    {
                                        "className": "input",
                                        "style": {"width": "6em"},
                                        "type": "text",
                                    },
                                ),
                            ),
                            jsxs(
                                "button",
                                {
                                    "children": ["Sync"],
                                    "className": "button is-dark",
                                    "onClick": on_click,
                                },
                            ),
                        ],
                        "className": "column control",
                    },
                ),
            ],
            "className": "columns field",
        },
    )


def Transform(props: dict):
    """Render a Transform component."""
    state: TransformState
    set_state: SetTransformState
    [state, set_state] = React.useState(
        TransformState(None, None, None, None, None, None, None, None)
    )
    form: RhfForm
    form = ReactHookForm.useForm()
    React.useEffect(lambda: set_to_current(state, set_state) and js_undefined, [])
    return jsxs(
        React.Fragment,
        {
            "children": [
                jsxs(
                    ReactHelmet.Helmet,
                    {"children": [jsxs("title", {"children": ["變換 | 帝國火星曆"]})]},
                ),
                jsxs(
                    "form",
                    {
                        "children": [
                            jsxs(
                                SetToCurrent, {"state": state, "set_state": set_state}
                            ),
                            jsxs(
                                Grdt,
                                {"form": form, "state": state, "set_state": set_state},
                            ),
                            jsxs(
                                Juld,
                                {"form": form, "state": state, "set_state": set_state},
                            ),
                            jsxs(DeltaT, {"form": form, "state": state}),
                            jsxs(
                                Tert,
                                {"form": form, "state": state, "set_state": set_state},
                            ),
                            jsxs(Mrls, {"form": form, "state": state}),
                            jsxs(
                                Mrsd,
                                {"form": form, "state": state, "set_state": set_state},
                            ),
                            jsxs(
                                Imsn,
                                {"form": form, "state": state, "set_state": set_state},
                            ),
                            jsxs(
                                Imdt,
                                {"form": form, "state": state, "set_state": set_state},
                            ),
                        ],
                        "onSubmit": lambda event: event.preventDefault(),
                    },
                ),
            ]
        },
    )
