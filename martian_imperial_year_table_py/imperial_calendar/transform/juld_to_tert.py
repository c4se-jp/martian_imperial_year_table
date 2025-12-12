"""ユリウス通日を地球時に變換する."""

from imperial_calendar.JulianDay import JulianDay
from imperial_calendar.TerrestrialTime import TerrestrialTime


def juld_to_tert(juld: JulianDay) -> TerrestrialTime:
    """ユリウス通日を地球時に變換する."""
    return TerrestrialTime(juld.julian_day + juld.delta_t / (24 * 60 * 60))
