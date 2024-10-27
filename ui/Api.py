"""Client of Web API."""

from imperial_calendar.GregorianDateTime import GregorianDateTime
from imperial_calendar.ImperialDateTime import ImperialDateTime
from imperial_calendar.ImperialSolNumber import ImperialSolNumber
from imperial_calendar.JulianDay import JulianDay
from imperial_calendar.MarsSolDate import MarsSolDate
from imperial_calendar.TerrestrialTime import TerrestrialTime
import typing as t

JSON: t.Any = 0  # __:skip
encodeURIComponent: t.Any = 0  # __:skip
fetch: t.Any = 0  # __:skip


class GetDatetimesResponse:
    """Api.get_datetimes()'s response."""

    def __init__(
        self, json: t.Dict[str, t.Any], grdt_timezone: str, imdt_timezone: str
    ):
        """Init."""
        self.grdt = GregorianDateTime(
            json["grdt"]["year"],
            json["grdt"]["month"],
            json["grdt"]["day"],
            json["grdt"]["hour"],
            json["grdt"]["minute"],
            json["grdt"]["second"],
            grdt_timezone,
        )
        self.juld = JulianDay(json["juld"]["day"], json["juld"]["second"])
        self.delta_t = json["delta_t"]  # type: float
        self.tert = TerrestrialTime(json["tert"]["terrestrial_time"])
        self.mrls = json["mrls"]  # type: float
        self.mrsd = MarsSolDate(json["mrsd"]["mars_sol_date"])
        self.imsn = ImperialSolNumber(json["imsn"]["day"], json["imsn"]["second"])
        self.imdt = ImperialDateTime(
            json["imdt"]["year"],
            json["imdt"]["month"],
            json["imdt"]["day"],
            json["imdt"]["hour"],
            json["imdt"]["minute"],
            json["imdt"]["second"],
            imdt_timezone,
        )


class Api:
    """Client of Web API."""

    async def get_datetimes(self, params: t.Dict[str, t.Any]) -> GetDatetimesResponse:
        """Get datetimes."""
        response = await fetch(
            "/api/datetimes?params={}".format(
                encodeURIComponent(JSON.stringify(params))
            )
        )
        if not response.ok:
            raise Exception(f"{response.status}: {response.text()}")
        json = await response.json()
        return GetDatetimesResponse(
            json, params["grdt_timezone"], params["imdt_timezone"]
        )

    async def get_calendar_svg(self, params: t.Dict[str, t.Any]) -> str:
        """Get a calendar SVG of the month."""
        response = await fetch(
            "/api/calendar.svg?params={}".format(
                encodeURIComponent(JSON.stringify(params))
            )
        )
        if not response.ok:
            raise Exception(f"{response.status}: {response.text()}")
        return await response.text()

    async def get_description_html(self) -> t.Dict[str, t.Any]:
        """Get the description HTML."""
        response = await fetch("/api/description.html")
        if not response.ok:
            raise Exception(f"{response.status}: {response.text()}")
        return await response.json()
