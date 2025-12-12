"""Test HolidayMars."""

from imperial_calendar.internal.HolidayMars import HolidayMars, Holidays, Internal
import unittest


class TestHolidayMars(unittest.TestCase):
    """Test HolidayMars."""

    @classmethod
    def tearDownClass(cls):
        """Restore the HOLIDAYS."""
        Holidays.tearDownForTest()

    def test_between(self):
        """該当期間中の祝日一覧."""
        Holidays.setUpForTest(
            {
                1425: {
                    1: {
                        1: Internal(name="僞1"),
                        3: Internal(name="僞2"),
                        5: Internal(name="僞3"),
                    }
                }
            }
        )
        for expected, start, end in [
            [
                [
                    HolidayMars(1425, 1, 1),
                    HolidayMars(1425, 1, 3),
                    HolidayMars(1425, 1, 5),
                ],
                HolidayMars(1425, 1, 1),
                HolidayMars(1425, 1, 5),
            ],
            [
                [HolidayMars(1425, 1, 3), HolidayMars(1425, 1, 5)],
                HolidayMars(1425, 1, 2),
                HolidayMars(1425, 1, 5),
            ],
            [
                [HolidayMars(1425, 1, 1), HolidayMars(1425, 1, 3)],
                HolidayMars(1425, 1, 1),
                HolidayMars(1425, 1, 4),
            ],
        ]:
            with self.subTest(start=start, end=end):
                self.assertEqual(expected, HolidayMars.between(start, end))
        Holidays.setUpForTest(
            {1425: {1: {26: Internal(name="僞1")}, 2: {2: Internal(name="僞2")}}}
        )
        expected, start, end = (
            [HolidayMars(1425, 1, 26), HolidayMars(1425, 2, 2)],
            HolidayMars(1425, 1, 26),
            HolidayMars(1425, 2, 2),
        )
        with self.subTest(start=start, end=end):
            self.assertEqual(expected, HolidayMars.between(start, end))
        Holidays.setUpForTest(
            {
                1425: {24: {26: Internal(name="僞1")}},
                1426: {1: {1: Internal(name="僞2")}},
            }
        )
        expected, start, end = (
            [HolidayMars(1425, 24, 26), HolidayMars(1426, 1, 1)],
            HolidayMars(1425, 24, 26),
            HolidayMars(1426, 1, 1),
        )
        with self.subTest(start=start, end=end):
            self.assertEqual(expected, HolidayMars.between(start, end))

    def test_is_holiday(self):
        """その日が祝日であるか否か."""
        Holidays.setUpForTest({1425: {1: {1: Internal(name="僞1")}}})
        self.assertTrue(HolidayMars(1425, 1, 1).is_holiday)
        self.assertFalse(HolidayMars(1425, 1, 2).is_holiday)
        Holidays.setUpForTest(
            {1425: {1: {2: [Internal(name="僞1"), Internal(name="僞2")]}}}
        )
        self.assertFalse(HolidayMars(1425, 1, 1).is_holiday)
        self.assertTrue(HolidayMars(1425, 1, 2).is_holiday)

    def test_lt(self):
        """より小さい."""
        lhs, rhs = HolidayMars(2, 2, 2), HolidayMars(2, 2, 2)
        with self.subTest(lhs=lhs, rhs=rhs):
            self.assertFalse(lhs < rhs)
        for lhs, rhs in [
            [HolidayMars(1, 2, 2), HolidayMars(2, 2, 2)],
            [HolidayMars(2, 1, 2), HolidayMars(2, 2, 2)],
            [HolidayMars(2, 2, 1), HolidayMars(2, 2, 2)],
        ]:
            with self.subTest(lhs=lhs, rhs=rhs):
                self.assertTrue(lhs < rhs)
        for lhs, rhs in [
            [HolidayMars(2, 1, 2), HolidayMars(1, 2, 2)],
            [HolidayMars(2, 2, 1), HolidayMars(2, 1, 2)],
        ]:
            with self.subTest(lhs=lhs, rhs=rhs):
                self.assertFalse(lhs < rhs)

    def test_names(self):
        """祝日の呼び名."""
        Holidays.setUpForTest({1425: {3: {3: Internal(name="僞1")}}})
        self.assertEqual(["僞1"], HolidayMars(1425, 3, 3).names)
        Holidays.setUpForTest(
            {1425: {3: {3: [Internal(name="僞1"), Internal(name="僞2")]}}}
        )
        self.assertEqual(["僞1", "僞2"], HolidayMars(1425, 3, 3).names)
