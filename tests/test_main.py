from martian_date_time import MartianDateTime
from sol_number import SolNumber
from main import (
    martian_date_time_to_sol_number,
    sol_number_to_martian_date_time
)
import unittest


class TestSolNumberToMartianDateTime(unittest.TestCase):
    def test_sol_number_to_martian_date_time(self):
        for (martian_date_time, sol_number) in [(MartianDateTime(1, 1, 1, 6, 14, 25), SolNumber(668.26002)),
                                                (MartianDateTime(1987, 6, 7, 12, 40, 30), SolNumber(1328642.52813)),
                                                (MartianDateTime(3, 4, 5, 6, 7, 8), SolNumber(2093.25496)),
                                                (MartianDateTime(-1, 24, 28, 0, 0, 0), SolNumber(-1.0))]:
            self.assertEqual(martian_date_time, sol_number_to_martian_date_time(sol_number))
            self.assertEqual(sol_number, martian_date_time_to_sol_number(martian_date_time))
