"""Utils for UI."""
from imperial_calendar.GregorianDateTime import GregorianDateTime
import typing as t

__new__: t.Any = 0  # __:skip
Date: t.Any = 0  # __:skip


def current_grdt() -> GregorianDateTime:
    """Get the current grdt on the Web browser."""
    now = __new__(Date)  # noqa
    offset = now.getTimezoneOffset()
    if offset <= 0:
        sign = "+"
    else:
        sign = "-"
    grdt_timezone = "{0}{1}:{2}".format(
        sign,
        "0{}".format(abs(offset) // 60)[-2:],
        "0{}".format(abs(offset) % 60)[-2:],
    )
    return GregorianDateTime(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        grdt_timezone,
    )


def merge_dict(first: dict, second: dict) -> dict:
    """Merge 2 dict like `{**first, **second}`. This is because Transcrypt cannot actually treat kwargs."""
    result = {}
    result.update(first)
    result.update(second)
    return result
