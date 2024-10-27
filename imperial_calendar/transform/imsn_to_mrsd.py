"""帝國火星日からMSDを算出する."""

from imperial_calendar.ImperialSolNumber import ImperialSolNumber
from imperial_calendar.MarsSolDate import MarsSolDate


def imsn_to_mrsd(imsn: ImperialSolNumber) -> MarsSolDate:
    """帝國火星日からMSDを算出する."""
    return MarsSolDate(imsn.imperial_sol_number + 0.375 - 901195)
