"""定數."""

from imperial_calendar.internal.ImperialMonth import ImperialMonth
from imperial_calendar.internal.ImperialYear import ImperialYear


def sums(lst):
    """listを、先頭からの總和のlistに變換する."""
    s = 0
    sums = []
    for item in lst:
        s += item
        sums.append(s)
    return sums


imperial_year_to_imsn_table = [0]
for year in range(0, 999):
    imperial_year_to_imsn_table.insert(year + 1, ImperialYear(year).days())
imperial_millennium_days = (
    sum(imperial_year_to_imsn_table) + ImperialYear(999).days()
)  # type: int
imperial_year_to_imsn_table = sums(imperial_year_to_imsn_table)

imperial_month_to_imsn_table = [0]
for month in range(1, 24):
    imperial_month_to_imsn_table.insert(month, ImperialMonth(month).days())
imperial_month_to_imsn_table = sums(imperial_month_to_imsn_table)
