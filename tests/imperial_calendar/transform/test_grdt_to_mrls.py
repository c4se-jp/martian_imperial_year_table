"""Test conversions GregorianDateTime to Mars LS."""
from imperial_calendar import GregorianDateTime
from imperial_calendar.transform import grdt_to_juld, juld_to_tert, tert_to_mrls
import unittest


class Test_grdt_to_mrls(unittest.TestCase):
    """Test conversions GregorianDateTime to Mars LS."""

    def test_grdt_to_mrls(self):
        """
        Test conversions GregorianDateTime to Mars LS.

        cf.  天文年鑑編集委員会 (2018) "天文年鑑 2019年版" ISBN:978-4-416-71802-5 p.133
        """
        for (year, month, day), mrls in [
            ((2018, 12, 28), 314.1),
            ((2019, 1, 7), 319.8),
            ((2019, 1, 17), 325.4),
            ((2019, 1, 27), 331.0),
            ((2019, 2, 6), 336.4),
            ((2019, 2, 16), 341.7),
            ((2019, 2, 26), 347.0),
            ((2019, 3, 8), 352.2),
            ((2019, 3, 18), 357.2),
            ((2019, 3, 28), 2.2),
            ((2019, 4, 7), 7.2),
            ((2019, 4, 17), 12.0),
            ((2019, 4, 27), 16.8),
            ((2019, 5, 7), 21.5),
            ((2019, 5, 17), 26.2),
            ((2019, 5, 27), 30.8),
            ((2019, 6, 6), 35.3),
            ((2019, 6, 16), 39.8),
            ((2019, 6, 26), 44.3),
            ((2019, 7, 6), 48.8),
            ((2019, 7, 16), 53.2),
            ((2019, 7, 26), 57.6),
            ((2019, 8, 5), 62.0),
            ((2019, 8, 15), 66.3),
            ((2019, 8, 25), 70.7),
            ((2019, 9, 4), 75.1),
            ((2019, 9, 14), 79.4),
            ((2019, 9, 24), 83.8),
            ((2019, 10, 4), 88.2),
            ((2019, 10, 14), 92.6),
            ((2019, 10, 24), 97.1),
            ((2019, 11, 3), 101.5),
            ((2019, 11, 13), 106.0),
            ((2019, 11, 23), 110.6),
            ((2019, 12, 3), 115.2),
            ((2019, 12, 13), 119.8),
            ((2019, 12, 23), 124.5),
            ((2020, 1, 2), 129.3),
        ]:
            with self.subTest(year=year, month=month, day=day):
                grdt = GregorianDateTime(year, month, day, 0, 0, 0, "UTC")
                actual = tert_to_mrls(juld_to_tert(grdt_to_juld(grdt)))
                actual = round(actual - 0.01, 1)  # NOTE: 五捨六入
                self.assertEqual(mrls, actual)
