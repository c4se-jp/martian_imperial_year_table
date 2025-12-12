"""Test ImperialYear."""

from imperial_calendar.internal.ImperialYear import ImperialYear
import unittest


class TestImperialYear(unittest.TestCase):
    """Test ImperialYear."""

    def test_is_leap_year(self):
        """閏年か否か."""
        for year in [1, 10]:
            self.assertTrue(ImperialYear(year).is_leap_year())
        for year in [0, 2, 250]:
            self.assertFalse(ImperialYear(year).is_leap_year())

    def test_days(self):
        """この年の日數."""
        for year, days in [(0, 668), (2, 668), (1, 669), (10, 669), (250, 668)]:
            self.assertEqual(days, ImperialYear(year).days())
