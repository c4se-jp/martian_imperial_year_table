"""帝國火星曆の日時."""

from imperial_calendar.internal.HolidayMars import HolidayMars  # __:skip
import re  # __:skip
import typing as t


# __pragma__("skip")
def parse_timezone(timezone: str) -> float:
    """Parse timezone to offset."""
    match = re.match(
        r"^(?P<sign>[-+])(?P<hours>\d{1,2}):(?P<minutes>\d{1,2})$", timezone
    )
    if match:
        if match.group("sign") == "-":
            sign = -1.0
        else:
            sign = 1.0
        return sign * (int(match.group("hours")) + (int(match.group("minutes")) / 60.0))
    raise Exception(f"Unknown timezone format: {timezone}")


# __pragma__("noskip")


class ImperialDateTime(object):
    """帝國火星曆の日時."""

    dummy = 42

    # __pragma__("skip")
    @classmethod
    def from_standard_naive(
        cls, imdt: "ImperialDateTime", timezone=str
    ) -> "ImperialDateTime":
        """From standard timezone naive ImperialDateTime."""
        from imperial_calendar.transform import imdt_to_imsn, imsn_to_imdt

        if not (imdt.timezone is None):
            raise Exception(f"This is not naive: {imdt.__dict__}")
        imsn = imdt_to_imsn(imdt)
        imsn.second += parse_timezone(timezone) * 60.0 * 60.0
        if imsn.second < 0:
            imsn.day -= 1
            imsn.second += 24.0 * 60.0 * 60.0
        elif imsn.second >= 24.0 * 60.0 * 60.0:
            imsn.day += 1
            imsn.second -= 24.0 * 60.0 * 60.0
        imdt = imsn_to_imdt(imsn)
        imdt.timezone = timezone
        return imdt

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
        return isinstance(other, ImperialDateTime) and self.__dict__ == other.__dict__

    # NOTE: Can't apply `@functools.total_ordering` because of Transcrypt.
    def __lt__(self, other: "ImperialDateTime") -> bool:
        """Less than."""
        me = self
        if me.timezone is not None:
            me = me.to_standard_naive()
        if other.timezone is not None:
            other = other.to_standard_naive()
        return me.year < other.year or (
            me.year == other.year
            and (
                me.month < other.month
                or (
                    me.month == other.month
                    and (
                        me.day < other.day
                        or (
                            me.day == other.day
                            and (
                                me.hour < other.hour
                                or (
                                    me.hour == other.hour
                                    and (
                                        me.minute < other.minute
                                        or (
                                            me.minute == other.minute
                                            and me.second < other.second
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        )

    def __repr__(self) -> str:
        """Representation."""
        return "ImperialDateTime({0},{1},{2},{3},{4},{5},{6})".format(
            self.year,
            self.month,
            self.day,
            self.hour,
            self.minute,
            self.second,
            repr(self.timezone),
        )

    def copy(self) -> "ImperialDateTime":
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
    def holiday(self) -> t.Optional[HolidayMars]:
        """Return the day is a holiday or not."""
        holiday = HolidayMars(self.year, self.month, self.day)
        if not holiday.is_holiday:
            return None
        return holiday

    # __pragma__("noskip")

    @property
    def japanese_month_name(self) -> str:
        """Give a translation to the Japanese (is almose equal to Kwaseg-go) month name."""
        return [
            "立春",
            "雨水",
            "啓蟄",
            "春分",
            "清明",
            "穀雨",
            "立夏",
            "小滿",
            "芒種",
            "夏至",
            "小暑",
            "大暑",
            "立秋",
            "處暑",
            "白露",
            "秋分",
            "寒露",
            "霜降",
            "立冬",
            "小雪",
            "大雪",
            "冬至",
            "小寒",
            "大寒",
        ][self.month - 1]

    # __pragma__("skip")
    @property
    def offset(self) -> float:
        """Parse timezone to offset."""
        if self.timezone is None:
            raise Exception(f"This is naive: {self.__dict__}")
        return parse_timezone(self.timezone)

    # __pragma__("noskip")

    # __pragma__("skip")
    def to_standard_naive(self) -> "ImperialDateTime":
        """Convert to naive ImperialDateTime as standard timezone."""
        from imperial_calendar.transform import imdt_to_imsn, imsn_to_imdt

        if self.timezone is None:
            raise Exception(f"This is naive: {self.__dict__}")
        imdt = self.copy()
        imdt.timezone = None
        imsn = imdt_to_imsn(imdt)
        imsn.second -= self.offset * 60.0 * 60.0
        if imsn.second < 0:
            imsn.day -= 1
            imsn.second += 24.0 * 60.0 * 60.0
        elif imsn.second >= 24.0 * 60.0 * 60.0:
            imsn.day += 1
            imsn.second -= 24.0 * 60.0 * 60.0
        return imsn_to_imdt(imsn)

    # __pragma__("noskip")
