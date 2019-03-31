"""Test MartianMonth."""

from martian_month import MartianMonth
import unittest


class TestMartianMonth(unittest.TestCase):
    """Test MartianMonth."""

    def test_days(self):
        """この月の日數."""
        for (month, days) in [(1, 28), (2, 28), (3, 28), (4, 28), (5, 28), (6, 27), (7, 28), (8, 28), (9, 28),
                              (10, 28), (11, 28), (12, 27), (13, 28), (14, 28), (15, 28), (16, 28), (17, 28),
                              (18, 27), (19, 28), (20, 28), (21, 28), (22, 28), (23, 28), (24, 27)]:
            self.assertEqual(days, MartianMonth(month).days())
