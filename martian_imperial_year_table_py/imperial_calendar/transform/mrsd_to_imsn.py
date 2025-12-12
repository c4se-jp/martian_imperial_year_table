"""MSDを帝國火星日に變換する."""

from imperial_calendar.ImperialSolNumber import ImperialSolNumber
from imperial_calendar.MarsSolDate import MarsSolDate


def mrsd_to_imsn(mrsd: MarsSolDate) -> ImperialSolNumber:
    """MSDを帝國火星日に變換する."""
    return ImperialSolNumber(mrsd.mars_sol_date - 0.375 + 901195)
