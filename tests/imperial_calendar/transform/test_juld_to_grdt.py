"""Test conversions JulianDay to GregorianDateTime."""

from imperial_calendar import GregorianDateTime, JulianDay
from imperial_calendar.transform import juld_to_grdt
import unittest


class test_juld_to_grdt(unittest.TestCase):
    """Test conversions JulianDay to GregorianDateTime."""

    def test_transform_date(self):
        """
        日附を變換する.

        cf. https://ja.wikipedia.org/wiki/%E3%83%A6%E3%83%AA%E3%82%A6%E3%82%B9%E9%80%9A%E6%97%A5
        """
        for juld, grdt in [
            (JulianDay(2299161.0), GregorianDateTime(1582, 10, 15, 12, 0, 0, None)),
            (JulianDay(2345678.0), GregorianDateTime(1710, 2, 23, 12, 0, 0, None)),
            (JulianDay(2400000.5), GregorianDateTime(1858, 11, 17, 0, 0, 0, None)),
            (JulianDay(2451545.0), GregorianDateTime(2000, 1, 1, 12, 0, 0, None)),
            (JulianDay(2456789.0), GregorianDateTime(2014, 5, 11, 12, 0, 0, None)),
            (JulianDay(2567890.0), GregorianDateTime(2318, 7, 18, 12, 0, 0, None)),
            (JulianDay(3000000.0), GregorianDateTime(3501, 8, 15, 12, 0, 0, None)),
            (JulianDay(3456789.0), GregorianDateTime(4752, 4, 7, 12, 0, 0, None)),
            (JulianDay(4000000.0), GregorianDateTime(6239, 7, 12, 12, 0, 0, None)),
        ]:
            with self.subTest(juld=juld):
                self.assertEqual(grdt, juld_to_grdt(juld))
