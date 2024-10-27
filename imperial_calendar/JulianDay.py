"""ユリウス通日."""

import math
import typing as t


# __pragma__("skip")
def julian_day_to_julian_year(juld) -> float:
    """ユリウス通日をユリウス年表示に變換する."""
    julian_day_to_julian_year_intercept = 1721117.5
    tweaked_julian_day = juld.julian_day - julian_day_to_julian_year_intercept
    # ユリウス曆0年3月1日正子を0とする通算日數を計算。
    quadrennium = divmod(tweaked_julian_day, (365 * 4 + 1))
    if quadrennium[1] < 365:
        quadrennial_year = 0
    elif quadrennium[1] < 365 * 2:
        quadrennial_year = 1
    elif quadrennium[1] < 365 * 3:
        quadrennial_year = 2
    else:
        quadrennial_year = 3
    julian_year = quadrennium[0] * 4 + quadrennial_year
    annual_day = quadrennium[1] - quadrennial_year * 365
    if annual_day >= 306:  # 306は3月から12月の日數。過ぎると翌年。
        julian_year += 1
        annual_day -= 306
    elif julian_year % 4 == 0:
        annual_day += 31 + 29
    else:
        annual_day += 31 + 28
    if julian_year % 4 == 0:
        julian_year += annual_day / 366
    else:
        julian_year += annual_day / 365
    return julian_year


# __pragma__("noskip")


# __pragma__("skip")
def julian_day_to_gregorian_year(juld) -> float:
    """ユリウス通日をグレゴリオ年表示に變換する."""
    from imperial_calendar.GregorianDateTime import GregorianDateTime
    from imperial_calendar.transform.grdt_to_juld import grdt_to_juld
    from imperial_calendar.transform.juld_to_grdt import juld_to_grdt

    year = juld_to_grdt(juld).year
    january_1st = grdt_to_juld(GregorianDateTime(year, 1, 1, 0, 0, 0, None))
    next_january_1st = grdt_to_juld(GregorianDateTime(year + 1, 1, 1, 0, 0, 0, None))
    # 年内日數の小數表示
    annual_day = (juld.julian_day - january_1st.julian_day) / (
        next_january_1st.julian_day - january_1st.julian_day
    )
    return year + annual_day


# __pragma__("noskip")


class JulianDay(object):
    """ユリウス通日."""

    calendar_reform = 2299160.5

    def __init__(self, day: t.Union[float, int], second=0.0) -> None:
        """Init."""
        if isinstance(day, float):
            if second != 0.0:
                raise Exception(
                    "When you give the julian_day directly you cannot give second."
                )
            self.day: int = math.floor(day)
            self.second: float = (day % 1) * 60.0 * 60.0 * 24.0
        else:
            if second < 0.0 or 60.0 * 60.0 * 24.0 <= second:
                raise Exception(f"second is out of range: {second}")
            self.day = day
            self.second = second

    def __eq__(self, other) -> bool:
        """Eq."""
        if not isinstance(other, JulianDay):
            return False
        return self.day == self.day and math.isclose(
            self.second, self.second, abs_tol=0.5
        )

    def __repr__(self) -> str:
        """Representation."""
        return f"JulianDay({self.day, self.second})"

    # __pragma__("skip")
    @property
    def delta_t(self) -> float:
        """ユリウス通日からΔTを算出する."""
        if self.julian_day < self.calendar_reform:
            year_number = julian_day_to_julian_year(self)
        else:
            year_number = julian_day_to_gregorian_year(self)
        if year_number < -500:
            delta_u = (year_number - 1820) / 100
            return -20 + 32 * delta_u**2
        elif year_number < 500:
            delta_u = year_number / 100
            return (
                10583.6
                - 1014.41 * delta_u
                + 33.78311 * delta_u**2
                - 5.952053 * delta_u**3
                - 0.1798452 * delta_u**4
                + 0.022174192 * delta_u**5
                + 0.0090316521 * delta_u**6
            )
        elif year_number < 1600:
            delta_u = (year_number - 1000) / 100
            return (
                1574.2
                - 556.01 * delta_u
                + 71.23472 * delta_u**2
                + 0.319781 * delta_u**3
                - 0.8503463 * delta_u**4
                - 0.005050998 * delta_u**5
                + 0.0083572073 * delta_u**6
            )
        elif year_number < 1700:
            delta_u = year_number - 1600
            return 120 - 0.9808 * delta_u - 0.01532 * delta_u**2 + delta_u**3 / 7129
        elif year_number < 1800:
            delta_u = year_number - 1700
            return (
                8.83
                + 0.1603 * delta_u
                - 0.0059285 * delta_u**2
                + 0.00013336 * delta_u**3
                - delta_u**4 / 1174000
            )
        elif year_number < 1860:
            delta_u = year_number - 1800
            return (
                13.72
                - 0.332447 * delta_u
                + 0.0068612 * delta_u**2
                + 0.0041116 * delta_u**3
                - 0.00037436 * delta_u**4
                + 0.0000121272 * delta_u**5
                - 0.0000001699 * delta_u**6
                + 0.000000000875 * delta_u**7
            )
        elif year_number < 1900:
            delta_u = year_number - 1860
            return (
                7.62
                + 0.5737 * delta_u
                - 0.251754 * delta_u**2
                + 0.01680668 * delta_u**3
                - 0.0004473624 * delta_u**4
                + delta_u**5 / 233174
            )
        elif year_number < 1920:
            delta_u = year_number - 1900
            return (
                -2.79
                + 1.494119 * delta_u
                - 0.0598939 * delta_u**2
                + 0.0061966 * delta_u**3
                - 0.000197 * delta_u**4
            )
        elif year_number < 1941:
            delta_u = year_number - 1920
            return (
                21.20
                + 0.84493 * delta_u
                - 0.076100 * delta_u**2
                + 0.0020936 * delta_u**3
            )
        elif year_number < 1961:
            delta_u = year_number - 1950
            return 29.07 + 0.407 * delta_u - delta_u**2 / 233 + delta_u**3 / 2547
        elif year_number < 1986:
            delta_u = year_number - 1975
            return 45.45 + 1.067 * delta_u - delta_u**2 / 260 - delta_u**3 / 718
        elif year_number < 2005:
            delta_u = year_number - 2000
            return (
                63.86
                + 0.3345 * delta_u
                - 0.060734 * delta_u**2
                + 0.0017275 * delta_u**3
                + 0.000651814 * delta_u**4
                + 0.00002373599 * delta_u**5
            )
        elif year_number < 2050:
            delta_u = year_number - 2000
            return 63.795 + 0.1287 * delta_u + 0.0091 * delta_u**2
            # 2005-2050の近似式は自作。參考文獻に準拠した式をコメントアウトして置く。
            # 參考文獻: https://eclipse.gsfc.nasa.gov/SEhelp/deltatpoly2004.html
            # return 62.92 + \
            #     0.32217 * delta_u + \
            #     0.005589 * delta_u**2
        elif year_number < 2150:
            return (
                -20
                + 32 * ((year_number - 1820) / 100) ** 2
                - 0.5628 * (2150 - year_number)
            )
        else:
            delta_u = (year_number - 1820) / 100
            return -20 + 32 * delta_u**2

    # __pragma__("noskip")

    @property
    def julian_day(self) -> float:
        """秒を考慮したJulian Dayを計算する."""
        return self.day + (self.second / (60.0 * 60.0 * 24.0))
