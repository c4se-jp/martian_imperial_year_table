"""グレゴリオ曆の日時."""

import typing as t

# __pragma__("skip")
from datetime import date, datetime, timedelta, timezone as tz_c, tzinfo
from holiday_jp import HolidayJp
from pytz import timezone as tz, utc
import re

# __pragma__("noskip")


# __pragma__("skip")
def parse_timezone(timezone: str) -> tzinfo:
    """Parse timezone to offset."""
    match = re.match(
        r"^(?P<sign>[-+])(?P<hours>\d{1,2}):(?P<minutes>\d{1,2})$", timezone
    )
    if match:
        if match.group("sign") == "-":
            sign = -1
        else:
            sign = 1
        return tz_c(
            sign
            * timedelta(
                hours=int(match.group("hours")), minutes=int(match.group("minutes"))
            )
        )
    return tz(timezone)


# __pragma__("noskip")


class GregorianDateTime(object):
    """グレゴリオ曆の日時."""

    dummy = 42

    # __pragma__("skip")
    @classmethod
    def from_utc_naive(
        cls, grdt: "GregorianDateTime", timezone: str
    ) -> "GregorianDateTime":
        """From UTC naive GregorianDateTime."""
        from imperial_calendar.transform import grdt_to_juld, juld_to_grdt

        if not (grdt.timezone is None):
            raise Exception(f"This is not naive: {grdt.__dict__}")
        parsed_tz = parse_timezone(timezone)
        if hasattr(parsed_tz, "localize") and callable(
            t.cast(t.Any, parsed_tz).localize
        ):
            dt = datetime(
                grdt.year,
                grdt.month,
                grdt.day,
                grdt.hour,
                grdt.minute,
                grdt.second,
                tzinfo=utc,
            )
            dt = dt.astimezone(parsed_tz)
            return cls(
                dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second, timezone
            )
        juld = grdt_to_juld(grdt)
        juld.second += (
            parsed_tz.utcoffset(datetime(1970, 1, 1, 0, 0, 0)) or timedelta(0)
        ).total_seconds()
        if juld.second < 0.0:
            juld.day -= 1
            juld.second += 24.0 * 60.0 * 60.0
        elif juld.second >= 24.0 * 60.0 * 60.0:
            juld.day += 1
            juld.second -= 24.0 * 60.0 * 60.0
        grdt = juld_to_grdt(juld)
        grdt.timezone = timezone
        return grdt

    # __pragma__("noskip")

    def __init__(
        self,
        year: int,
        month: int,
        day: int,
        hour: int,
        minute: int,
        second: int,
        timezone: t.Optional[str],
    ) -> None:
        """Init."""
        self.year: int = year
        self.month: int = month
        self.day: int = day
        self.hour: int = hour
        self.minute: int = minute
        self.second: int = second
        self.timezone: t.Optional[str] = timezone

    def __eq__(self, other: object) -> bool:
        """Eq."""
        return isinstance(other, GregorianDateTime) and self.__dict__ == other.__dict__

    def __repr__(self) -> str:
        """Representation."""
        return "GregorianDateTime({0},{1},{2},{3},{4},{5},{6})".format(
            self.year,
            self.month,
            self.day,
            self.hour,
            self.minute,
            self.second,
            repr(self.timezone),
        )

    def copy(self) -> "GregorianDateTime":
        """Shallow copy."""
        return self.__class__(
            self.year,
            self.month,
            self.day,
            self.hour,
            self.minute,
            self.second,
            self.timezone,
        )

    # __pragma__("skip")
    @property
    def is_holiday(self) -> bool:
        """Return the day is a holiday or not."""
        return HolidayJp(date(self.year, self.month, self.day)).is_holiday

    # __pragma__("noskip")

    # __pragma__("skip")
    @property
    def offset(self) -> float:
        """Offset hours from UTC."""
        if self.timezone is None:
            raise Exception(f"This is naive: {self.__dict__}")
        timezone = parse_timezone(self.timezone)
        if hasattr(timezone, "localize") and callable(t.cast(t.Any, timezone).localize):
            td = timezone.utcoffset(
                datetime(
                    self.year, self.month, self.day, self.hour, self.minute, self.second
                )
            ) or timedelta(0)
        else:
            td = timezone.utcoffset(datetime(1970, 1, 1, 0, 0, 0)) or timedelta(0)
        return td.total_seconds() / (60.0 * 60.0)

    # __pragma__("noskip")

    # __pragma__("skip")
    def to_utc_naive(self) -> "GregorianDateTime":
        """Convert to naive GregorianDateTime as UTC."""
        from imperial_calendar.transform import grdt_to_juld, juld_to_grdt

        if self.timezone is None:
            raise Exception(f"This is naive: {self.__dict__}")
        parsed_tz = parse_timezone(self.timezone)
        if hasattr(parsed_tz, "localize") and callable(
            t.cast(t.Any, parsed_tz).localize
        ):
            dt: datetime = t.cast(t.Any, parsed_tz).localize(
                datetime(
                    self.year, self.month, self.day, self.hour, self.minute, self.second
                )
            )
            dt = dt.astimezone(utc)
            return self.__class__(
                dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second, None
            )
        grdt = self.copy()
        grdt.timezone = None
        juld = grdt_to_juld(grdt)
        juld.second -= (
            parsed_tz.utcoffset(datetime(1970, 1, 1, 0, 0, 0)) or timedelta(0)
        ).total_seconds()
        if juld.second < 0.0:
            juld.day -= 1
            juld.second += 24.0 * 60.0 * 60.0
        elif juld.second >= 24.0 * 60.0 * 60.0:
            juld.day += 1
            juld.second -= 24.0 * 60.0 * 60.0
        return juld_to_grdt(juld)

    # __pragma__("noskip")

    @property
    def weekday(self) -> int:
        """Caliculate the ISO week day. Monday is 1 then Sunday is 7."""
        return date(self.year, self.month, self.day).isoweekday()
