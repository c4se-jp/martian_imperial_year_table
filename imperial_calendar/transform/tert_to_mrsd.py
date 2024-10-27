"""地球時からMSDを算出する."""

from imperial_calendar.MarsSolDate import MarsSolDate
from imperial_calendar.TerrestrialTime import TerrestrialTime


def tert_to_mrsd(tert: TerrestrialTime) -> MarsSolDate:
    """地球時からMSDを算出する."""
    return MarsSolDate(
        (tert.terrestrial_time - 2451545 - 4.5) / 1.0274912517 + 44796 - 0.0009626
    )
