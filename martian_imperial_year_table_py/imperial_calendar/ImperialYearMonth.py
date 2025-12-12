"""帝國火星曆の年月."""

from imperial_calendar.internal.ImperialMonth import ImperialMonth
from imperial_calendar.internal.ImperialYear import ImperialYear


class ImperialYearMonth(object):
    """帝國火星曆の年月."""

    def __init__(self, year: int, month: int):
        """Init."""
        self.month = month
        self.year = year

    def __eq__(self, other: object) -> bool:
        """Eq."""
        return isinstance(other, ImperialYearMonth) and self.__dict__ == other.__dict__

    def __repr__(self) -> str:
        """Repr."""
        return "ImperialYearMonth({}, {})".format(self.year, self.month)

    def days(self) -> int:
        """Return the days of the month."""
        days = ImperialMonth(self.month).days()
        if self.month == 24 and ImperialYear(self.year).is_leap_year():
            days += 1
        return days

    def next_month(self) -> "ImperialYearMonth":
        """Return the next month."""
        if self.month == 24:
            return ImperialYearMonth(self.year + 1, 1)
        return ImperialYearMonth(self.year, self.month + 1)

    def prev_month(self) -> "ImperialYearMonth":
        """Return the previous month."""
        if self.month == 1:
            return ImperialYearMonth(self.year - 1, 24)
        return ImperialYearMonth(self.year, self.month - 1)
