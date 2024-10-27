"""地球時 (テレストリアルタイム)."""

import math


class TerrestrialTime(object):
    """地球時 (テレストリアルタイム)."""

    def __init__(self, terrestrial_time: float) -> None:
        """Init."""
        self.terrestrial_time: float = terrestrial_time

    def __eq__(self, other) -> bool:
        """Eq."""
        if not isinstance(other, TerrestrialTime):
            return False
        return math.floor(self.terrestrial_time) == math.floor(
            other.terrestrial_time
        ) and math.isclose(
            self.terrestrial_time % 1, other.terrestrial_time % 1, abs_tol=0.000005
        )

    def __repr__(self) -> str:
        """Representation."""
        return f"TerrestrialTime({self.terrestrial_time})"
