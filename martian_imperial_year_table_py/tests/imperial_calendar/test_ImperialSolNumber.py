"""Test ImperialSolNumber."""

from imperial_calendar import ImperialSolNumber
import unittest


class TestImperialSolNumber(unittest.TestCase):
    """Test ImperialSolNumber."""

    def test_eq(self):
        """等値性."""
        self.assertEqual(ImperialSolNumber(0.0), ImperialSolNumber(0.0))
        self.assertNotEqual(ImperialSolNumber(0.0), ImperialSolNumber(0.1))
