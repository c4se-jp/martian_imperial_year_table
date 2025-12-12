"""Test ImperialYearMonth."""

from imperial_calendar.ImperialYearMonth import ImperialYearMonth
import unittest


class TestImperialYearMonth(unittest.TestCase):
    """Test ImperialYearMonth."""

    def test_days(self):
        """月の日數."""
        for expected, month in [
            [28, ImperialYearMonth(1245, 24)],
            [27, ImperialYearMonth(1246, 24)],
        ]:
            with self.subTest(month=month):
                self.assertEqual(expected, month.days())

    def test_next_month(self):
        """翌月."""
        for expected, month in [
            [ImperialYearMonth(1425, 2), ImperialYearMonth(1425, 1)],
            [ImperialYearMonth(1426, 1), ImperialYearMonth(1425, 24)],
        ]:
            with self.subTest(month=month):
                self.assertEqual(expected, month.next_month())

    def test_prev_month(self):
        """先月."""
        for expected, month in [
            [ImperialYearMonth(1425, 1), ImperialYearMonth(1425, 2)],
            [ImperialYearMonth(1424, 24), ImperialYearMonth(1425, 1)],
        ]:
            with self.subTest(month=month):
                self.assertEqual(expected, month.prev_month())
