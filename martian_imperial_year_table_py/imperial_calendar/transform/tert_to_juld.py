"""地球時をユリウス通日に變換する."""

from imperial_calendar.JulianDay import JulianDay
from imperial_calendar.TerrestrialTime import TerrestrialTime
from imperial_calendar.transform.juld_to_tert import juld_to_tert


def tert_to_juld(tert: TerrestrialTime) -> JulianDay:
    """地球時をユリウス通日に變換する."""
    delta_t = JulianDay(tert.terrestrial_time).delta_t
    juld_prime = JulianDay(tert.terrestrial_time - delta_t / (24 * 60 * 60))
    tert_prime = juld_to_tert(juld_prime)
    return JulianDay(
        juld_prime.julian_day + tert.terrestrial_time - tert_prime.terrestrial_time
    )
