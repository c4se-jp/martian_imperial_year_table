"""火星帝國の祝日."""

from functools import total_ordering
from imperial_calendar.ImperialYearMonth import ImperialYearMonth
import typing as t


class Internal(object):
    """Internal data expression."""

    name: str

    def __init__(self, name: str):
        """Init."""
        self.name = name

    def __eq__(self, other: object) -> bool:
        """Eq."""
        return isinstance(other, Internal) and self.__dict__ == other.__dict__

    def __repr__(self) -> str:
        """Representation."""
        return f"Internal({self.name})"


THolidays = t.Dict[int, t.Dict[int, t.Dict[int, t.Union[Internal, t.List[Internal]]]]]

HOLIDAYS: THolidays = {
    1425: {
        1: {
            1: Internal(name="四方節"),
            2: Internal(name="振替休日"),
            3: Internal(name="元始祭"),
            15: Internal(name="元宵節"),
            16: Internal(name="振替休日"),
        },
        3: {15: Internal(name="春季皇靈祭"), 16: Internal(name="振替休日")},
        5: {17: Internal(name="神武天皇祭")},
        6: {4: Internal(name="紀元節")},
        10: {13: Internal(name="夏至祭")},
        12: {26: Internal(name="大祓前日"), 27: Internal(name="夏越大祓")},
        13: {1: Internal(name="裏元日"), 2: Internal(name="振替休日")},
        16: {25: Internal(name="秋季皇靈祭")},
        17: {19: Internal(name="天長節")},
        18: {2: Internal(name="地久節")},
        20: {16: Internal(name="神嘗祭")},
        22: {1: Internal(name="新嘗祭"), 2: Internal(name="振替休日")},
        24: {
            26: Internal(name="大祓前々日"),
            27: Internal(name="大祓前日"),
            28: Internal(name="年越大祓"),
        },
    },
    1426: {
        1: {
            1: Internal(name="四方節"),
            2: Internal(name="振替休日"),
            3: Internal(name="元始祭"),
            15: Internal(name="元宵節"),
            16: Internal(name="振替休日"),
        },
        3: {14: Internal(name="春季皇靈祭"), 16: Internal(name="振替休日")},
        5: {17: Internal(name="神武天皇祭")},
        6: {4: Internal(name="紀元節")},
        10: {13: Internal(name="夏至祭")},
        12: {26: Internal(name="大祓前日"), 27: Internal(name="夏越大祓")},
        13: {1: Internal(name="裏元日"), 2: Internal(name="振替休日")},
        16: {24: Internal(name="秋季皇靈祭")},
        17: {19: Internal(name="天長節")},
        18: {2: Internal(name="地久節")},
        20: {16: Internal(name="神嘗祭")},
        22: {1: Internal(name="新嘗祭"), 2: Internal(name="振替休日")},
        24: {
            25: Internal(name="大祓前々日"),
            26: Internal(name="大祓前日"),
            27: Internal(name="年越大祓"),
        },
    },
    1427: {
        1: {
            1: Internal(name="四方節"),
            2: Internal(name="振替休日"),
            3: Internal(name="元始祭"),
            15: Internal(name="元宵節"),
            16: Internal(name="振替休日"),
        },
        3: {14: Internal(name="春季皇靈祭"), 16: Internal(name="振替休日")},
        5: {17: Internal(name="神武天皇祭")},
        6: {4: Internal(name="紀元節")},
        10: {13: Internal(name="夏至祭")},
        12: {26: Internal(name="大祓前日"), 27: Internal(name="夏越大祓")},
        13: {1: Internal(name="裏元日"), 2: Internal(name="振替休日")},
        16: {24: Internal(name="秋季皇靈祭")},
        17: {19: Internal(name="天長節")},
        18: {2: Internal(name="地久節")},
        20: {16: Internal(name="神嘗祭")},
        22: {1: Internal(name="新嘗祭"), 2: Internal(name="振替休日")},
        24: {
            26: Internal(name="大祓前々日"),
            27: Internal(name="大祓前日"),
            28: Internal(name="年越大祓"),
        },
    },
}


class Holidays(object):
    """Proxy HOLIDAYS constant for test."""

    holidays: THolidays = HOLIDAYS

    @classmethod
    def setUpForTest(cls, holidays: THolidays):
        """Override HOLIDAYS by given holidays."""
        cls.holidays = holidays

    @classmethod
    def tearDownForTest(cls):
        """Restore the HOLIDAYS."""
        cls.holidays = HOLIDAYS


@total_ordering
class HolidayMars(object):
    """火星帝國の祝日."""

    day: int
    internals: t.List[Internal]
    month: int
    year: int

    @classmethod
    def between(cls, lhs: "HolidayMars", rhs: "HolidayMars") -> t.List["HolidayMars"]:
        """List holidays on imdt in the period."""
        if lhs > rhs:
            return []
        holidays = []
        for year in range(
            max(lhs.year, min(Holidays.holidays.keys())),
            min(rhs.year, max(Holidays.holidays.keys())) + 1,
        ):
            for month in range(
                lhs.month if lhs.year == year else 1,
                (rhs.month if rhs.year == year else 24) + 1,
            ):
                if month in Holidays.holidays[year]:
                    for day in sorted(Holidays.holidays[year][month].keys()):
                        if day in range(
                            lhs.day if lhs.year == year and lhs.month == month else 1,
                            (
                                rhs.day
                                if rhs.year == year and rhs.month == month
                                else ImperialYearMonth(year, month).days()
                            )
                            + 1,
                        ):
                            holidays.append(cls(year, month, day))
        return holidays

    def __init__(self, year: int, month: int, day: int):
        """Init."""
        self.day = day
        self.internals = []
        self.month = month
        self.year = year
        if year in Holidays.holidays:
            hy = Holidays.holidays[year]
            if month in hy:
                hm = hy[month]
                if day in hm:
                    hd = hm[day]
                    if isinstance(hd, list):
                        self.internals = hd
                    else:
                        self.internals = [hd]

    def __eq__(self, other: object) -> bool:
        """Eq."""
        return isinstance(other, HolidayMars) and self.__dict__ == other.__dict__

    def __lt__(self, other: "HolidayMars") -> bool:
        """Less than."""
        return self.year < other.year or (
            self.year == other.year
            and (
                self.month < other.month
                or (self.month == other.month and self.day < other.day)
            )
        )

    def __repr__(self) -> str:
        """Representation."""
        return f"HolidayMars({self.year}, {self.month}, {self.day}, internal={repr(self.internals)})"

    @property
    def is_holiday(self) -> bool:
        """Return the day is a holiday on imdt or not."""
        return len(self.internals) != 0

    @property
    def names(self) -> t.List[str]:
        """Return the holiday name if the day is a holiday."""
        return [internal.name for internal in self.internals]
