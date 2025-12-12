"""帝國火星曆の通算日."""

import math
import typing as t


class ImperialSolNumber(object):
    """帝國火星曆の通算日."""

    def __init__(self, day: t.Union[float, int], second=0.0) -> None:
        """Init."""
        if isinstance(day, float):
            if second != 0.0:
                raise Exception(
                    "When you give the imperial_sol_number directly you cannot give second."
                )
            self.day: int = math.floor(day)
            self.second: float = (day % 1) * 60.0 * 60.0 * 24.0
        else:
            if second < 0.0 or 60.0 * 60.0 * 24.0 <= second:
                raise Exception(f"second is out of range: {second}")
            self.day = day
            self.second = second

    def __eq__(self, other) -> bool:
        """Eq."""
        if not isinstance(other, ImperialSolNumber):
            return False
        return math.floor(self.imperial_sol_number) == math.floor(
            other.imperial_sol_number
        ) and math.isclose(
            self.imperial_sol_number % 1,
            other.imperial_sol_number % 1,
            abs_tol=0.000005,
        )

    def __repr__(self) -> str:
        """Representation."""
        return f"ImperialSolNumber({self.day}, {self.second})"

    @property
    def imperial_sol_number(self) -> float:
        """秒を考慮したImperial Sol Numberを計算する."""
        return self.day + (self.second / (60.0 * 60.0 * 24.0))
