"""Test main."""

import json
from web_main import app
import unittest
import urllib


class TestMain(unittest.TestCase):
    """Test main."""

    def setUp(self):
        """Set up."""
        self.app = app.test_client()

    def test_heartbeat(self):
        """Test heartbeat."""
        response = self.app.get("/ops/heartbeat")
        self.assertEqual(200, response.status_code)
        self.assertEqual(b"heartbeat:ok", response.data)

    def test_index(self):
        """Test index."""
        response = self.app.get("/")
        self.assertEqual(200, response.status_code)
        self.assertIn(
            b'<link rel="stylesheet" href="/static/css/bulma.min.css" />', response.data
        )

    def test_datetimes(self):
        """Test datetimes."""
        params = {
            "grdt_timezone": "+00:00",
            "imdt_timezone": "+00:00",
            "grdt": {
                "year": 1970,
                "month": 1,
                "day": 1,
                "hour": 0,
                "minute": 0,
                "second": 0,
            },
        }
        response = self.app.get(
            f"/api/datetimes?params={urllib.parse.quote(json.dumps(params))}"
        )
        self.assertEqual(200, response.status_code)
        self.assertTrue(json.loads(response.get_data(as_text=True)))
