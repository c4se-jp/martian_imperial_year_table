"""Utils for UI."""
from imperial_calendar.GregorianDateTime import GregorianDateTime
import typing as t

__new__: t.Any = 0  # __:skip
Date: t.Any = 0  # __:skip


class RhfForm:
    """ReactHookForm.Form."""

    def getValues(self) -> t.Dict[str, t.Any]:
        """Get the values from the form.

        An optimized helper for reading form values.
        The difference between watch and getValues is that getValues will not trigger re-renders or subscribe to input
        changes.
        """
        pass

    def register(self, name: str) -> t.Dict[str, t.Any]:
        """Register the input or select element to the form.

        This method allows you to register an input or select element and apply validation rules to React Hook Form.
        Validation rules are all based on the HTML standard and also allow for custom validation methods.
        """
        pass

    def setValue(self, name: str, value: t.Any) -> None:
        """Set the value to the form.

        This function allows you to dynamically set the value of a registered field.
        At the same time, it tries to avoid unnecessary re-rerenders.
        """
        pass


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
