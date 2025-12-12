"""
ユリウス通日をグレゴリオ曆の日時に變換する.

cf. http://astronomy.webcrow.jp/time/julianday-gregoriancalendar.html
"""

from imperial_calendar.GregorianDateTime import GregorianDateTime
from imperial_calendar.JulianDay import JulianDay
import math


def juld_to_grdt(juld: JulianDay) -> GregorianDateTime:
    """ユリウス通日をグレゴリオ曆の日時に變換する."""
    A = math.floor(juld.julian_day + 68569.5)
    B = juld.julian_day + 0.5
    a = math.floor(A / 36524.25)
    b = A - math.floor(36524.25 * a + 0.75)
    c = math.floor((b + 1) / 365.25025)
    d = b - math.floor(365.25 * c) + 31
    e = math.floor(d / 30.59)
    f = math.floor(e / 11.0)
    u = 100 * (a - 49) + c + f
    v = e - 12 * f + 2
    w = d - math.floor(30.59 * e) + (B % 1)
    (hour, minute) = divmod(round(juld.second), 60 * 60)
    hour = (hour + 12) % 24
    (minute, second) = divmod(minute, 60)
    return GregorianDateTime(u, v, math.floor(w), hour, minute, second, None)
