"""Mars Sol Date."""

import math


class MarsSolDate(object):
    """Mars Sol Date."""

    def __init__(self, mars_sol_date: float) -> None:
        """Init."""
        self.mars_sol_date: float = mars_sol_date

    def __eq__(self, other) -> bool:
        """Eq."""
        if not isinstance(other, MarsSolDate):
            return False
        return math.floor(self.mars_sol_date) == math.floor(
            other.mars_sol_date
        ) and math.isclose(
            self.mars_sol_date % 1, other.mars_sol_date % 1, abs_tol=0.000005
        )

    def __repr__(self) -> str:
        """Representation."""
        return f"MarsSolDate({self.mars_sol_date})"
