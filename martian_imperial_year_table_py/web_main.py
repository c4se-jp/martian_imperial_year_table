"""App."""

from datetime import timedelta
from flasgger import Swagger
from flasgger.utils import swag_from
from flask import Flask, Response, jsonify, render_template, request
from imperial_calendar import (
    GregorianDateTime,
    ImperialDateTime,
    ImperialSolNumber,
    JulianDay,
    MarsSolDate,
    TerrestrialTime,
)
from imperial_calendar.transform import (
    grdt_to_juld,
    imdt_to_imsn,
    imsn_to_imdt,
    imsn_to_mrsd,
    juld_to_grdt,
    juld_to_tert,
    mrsd_to_imsn,
    mrsd_to_tert,
    tert_to_juld,
    tert_to_mrls,
    tert_to_mrsd,
)
import os
from web.CalendarImage import CalendarImage
import json
import markdown
import typing as t


class Config(object):
    """Common config."""

    pass


class DevelopmentConfig(Config):
    """Development config."""

    SEND_FILE_MAX_AGE_DEFAULT = 0


class ProductionConfig(Config):
    """Production config."""

    SEND_FILE_MAX_AGE_DEFAULT = timedelta(minutes=5)


class TestingConfig(Config):
    """Testing config."""

    SEND_FILE_MAX_AGE_DEFAULT = 0
    TESTING = True


app = Flask(__name__)
env = os.getenv("ENV", "production")
if env == "development":
    app.config.from_object(DevelopmentConfig)
elif env == "production":
    app.config.from_object(ProductionConfig)
elif app.testing:
    app.config.from_object(TestingConfig)
else:
    raise Exception(f"Unknown FLASK_ENV: {app.env}")
Swagger(app)


@app.route("/ops/heartbeat")
def heartbeat() -> str:
    """Komachi heartbeat."""
    return "heartbeat:ok"


@app.route("/")
@app.route("/calendar")
@app.route("/description")
def index() -> str:
    """Index."""
    return render_template("index.html")


@app.route("/api/calendar.svg", methods=["GET"])
def calendar_svg() -> Response:
    """Render the caneldar of the month to a SVG."""
    params = json.loads(t.cast(str, request.args.get("params")))
    imdt = params["imdt"]
    imdt = ImperialDateTime(imdt["year"], imdt["month"], 1, 0, 0, 0, "+00:00")
    resp = Response(CalendarImage(imdt, params["grdt_timezone"]).draw_as_svg())
    resp.headers["Content-Type"] = "image/svg+xml"
    return resp


@app.route("/api/datetimes", methods=["GET"])
@swag_from("web.yml", validation=False)
def datetimes() -> Response:
    """Get datetimes."""
    params = json.loads(t.cast(str, request.args.get("params")))
    if "grdt" in params:
        _grdt = params["grdt"]
        grdt = GregorianDateTime(
            _grdt["year"],
            _grdt["month"],
            _grdt["day"],
            _grdt["hour"],
            _grdt["minute"],
            _grdt["second"],
            params["grdt_timezone"],
        )
        juld = grdt_to_juld(grdt.to_utc_naive())
        tert = juld_to_tert(juld)
        mrsd = tert_to_mrsd(tert)
        imsn = mrsd_to_imsn(mrsd)
        imdt = ImperialDateTime.from_standard_naive(
            imsn_to_imdt(imsn), params["imdt_timezone"]
        )
    elif "juld" in params:
        _juld = params["juld"]
        juld = JulianDay(_juld["day"], _juld["second"])
        grdt = GregorianDateTime.from_utc_naive(
            juld_to_grdt(juld), params["grdt_timezone"]
        )
        tert = juld_to_tert(juld)
        mrsd = tert_to_mrsd(tert)
        imsn = mrsd_to_imsn(mrsd)
        imdt = ImperialDateTime.from_standard_naive(
            imsn_to_imdt(imsn), params["imdt_timezone"]
        )
    elif "tert" in params:
        tert = TerrestrialTime(params["tert"]["terrestrial_time"])
        juld = tert_to_juld(tert)
        grdt = GregorianDateTime.from_utc_naive(
            juld_to_grdt(juld), params["grdt_timezone"]
        )
        mrsd = tert_to_mrsd(tert)
        imsn = mrsd_to_imsn(mrsd)
        imdt = ImperialDateTime.from_standard_naive(
            imsn_to_imdt(imsn), params["imdt_timezone"]
        )
    elif "mrsd" in params:
        mrsd = MarsSolDate(params["mrsd"]["mars_sol_date"])
        tert = mrsd_to_tert(mrsd)
        juld = tert_to_juld(tert)
        grdt = GregorianDateTime.from_utc_naive(
            juld_to_grdt(juld), params["grdt_timezone"]
        )
        imsn = mrsd_to_imsn(mrsd)
        imdt = ImperialDateTime.from_standard_naive(
            imsn_to_imdt(imsn), params["imdt_timezone"]
        )
    elif "imsn" in params:
        _imsn = params["imsn"]
        imsn = ImperialSolNumber(_imsn["day"], _imsn["second"])
        mrsd = imsn_to_mrsd(imsn)
        tert = mrsd_to_tert(mrsd)
        juld = tert_to_juld(tert)
        grdt = GregorianDateTime.from_utc_naive(
            juld_to_grdt(juld), params["grdt_timezone"]
        )
        imdt = ImperialDateTime.from_standard_naive(
            imsn_to_imdt(imsn), params["imdt_timezone"]
        )
    elif "imdt" in params:
        _imdt = params["imdt"]
        imdt = ImperialDateTime(
            _imdt["year"],
            _imdt["month"],
            _imdt["day"],
            _imdt["hour"],
            _imdt["minute"],
            _imdt["second"],
            params["imdt_timezone"],
        )
        imsn = imdt_to_imsn(imdt.to_standard_naive())
        mrsd = imsn_to_mrsd(imsn)
        tert = mrsd_to_tert(mrsd)
        juld = tert_to_juld(tert)
        grdt = GregorianDateTime.from_utc_naive(
            juld_to_grdt(juld), params["grdt_timezone"]
        )
    else:
        raise Exception(f"Unknown pattern of params: {params}")
    return jsonify(
        {
            "grdt": grdt.__dict__,
            "juld": juld.__dict__,
            "delta_t": juld.delta_t,
            "tert": tert.__dict__,
            "mrls": tert_to_mrls(tert),
            "mrsd": mrsd.__dict__,
            "imsn": imsn.__dict__,
            "imdt": imdt.__dict__,
        }
    )


@app.route("/api/description.html", methods=["GET"])
def description_html() -> Response:
    """Describe Martian Imperial Calendar."""
    with open("templates/description.md") as f:
        return jsonify(
            {"html": markdown.markdown(f.read(), extensions=[], output_format="html5")}
        )
