"""Test conversions ImperialSolNumber to ImperialDateTime."""
from imperial_calendar import ImperialDateTime, ImperialSolNumber
from imperial_calendar.transform import imsn_to_imdt
import unittest


class Test_imsn_to_imdt(unittest.TestCase):
    """Test conversions ImperialSolNumber to ImperialDateTime."""

    def test_imsn_to_imdt(self):
        """Test conversions ImperialSolNumber to ImperialDateTime."""
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
            with self.subTest(imsn=imsn):
                self.assertEqual(imdt, imsn_to_imdt(imsn))
