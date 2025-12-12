"""帝國火星曆の年."""


class ImperialYear(object):
    """帝國火星曆の年."""

    def __init__(self, year: int) -> None:
        """Init."""
        self.year: int = year

    def is_leap_year(self) -> bool:
        """閏年か否か."""
        year = self.year
        return year % 2 == 1 or year % 10 == 0 and year % 250 != 0

    def days(self) -> int:
        """この年の日數."""
        if self.is_leap_year():
            return 669
        else:
            return 668
