"""グレゴリオ曆の日時をユリウス通日に變換する."""

from imperial_calendar.GregorianDateTime import GregorianDateTime
from imperial_calendar.JulianDay import JulianDay
import math


def grdt_to_juld(grdt: GregorianDateTime) -> JulianDay:
    """グレゴリオ曆の日時をユリウス通日に變換する."""
    intercept_day = 1721088
    intercept_second = 0.5 * 24.0 * 60.0 * 60.0
    if grdt.month in [1, 2]:
        tweaked_year = grdt.year - 1
        tweaked_month = grdt.month + 12
    else:
        tweaked_year = grdt.year
        tweaked_month = grdt.month
    day = (
        math.floor(tweaked_year * 365.25)
        + math.floor(tweaked_year / 400.0)
        - math.floor(tweaked_year / 100.0)
        + math.floor((tweaked_month - 2) * 30.59)
        + grdt.day
        + intercept_day
    )
    second = (
        grdt.hour * 60.0 * 60.0 + grdt.minute * 60.0 + grdt.second + intercept_second
    )
    if second >= 24.0 * 60.0 * 60.0:
        day += 1
        second -= 24.0 * 60.0 * 60.0
    return JulianDay(day, second)
