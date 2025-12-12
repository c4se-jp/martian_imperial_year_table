"""Test conversions ImperialDateTime to ImperialSolNumber."""

from imperial_calendar import ImperialDateTime, ImperialSolNumber
from imperial_calendar.transform import imdt_to_imsn
import unittest


class Test_imdt_to_imsn(unittest.TestCase):
    """Test conversions ImperialDateTime to ImperialSolNumber."""

    def test_imdt_to_imsn(self):
        """Test conversions ImperialDateTime to ImperialSolNumber."""
        for imdt, imsn in [
            (ImperialDateTime(0, 1, 1, 0, 0, 0, None), ImperialSolNumber(0.0)),
            (ImperialDateTime(1000, 1, 1, 0, 0, 0, None), ImperialSolNumber(668596.0)),
            (ImperialDateTime(1, 1, 1, 6, 14, 25, None), ImperialSolNumber(668.26001)),
            (
                ImperialDateTime(1987, 6, 7, 12, 40, 30, None),
                ImperialSolNumber(1328646, 45630.0),
            ),
            (ImperialDateTime(3, 4, 5, 6, 7, 8, None), ImperialSolNumber(2093.25495)),
            (ImperialDateTime(-1, 24, 28, 0, 0, 0, None), ImperialSolNumber(-1.0)),
        ]:
            with self.subTest(imdt=imdt):
                self.assertEqual(imsn, imdt_to_imsn(imdt))
