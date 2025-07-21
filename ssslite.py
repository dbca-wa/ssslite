import json
import os
from pathlib import Path

import requests
from bottle import Bottle, redirect, request, response, static_file

dot_env = os.path.join(os.getcwd(), ".env")
if os.path.exists(dot_env):
    from dotenv import load_dotenv

    load_dotenv()
application = Bottle()
PROJECT_DIR = str(Path(__file__).resolve().parents[0])


@application.route("/")
def index():
    # Redirect the root location to Today's Burns.
    return redirect("todaysburns")


@application.route("/todaysburns")
def todaysburns():
    """Return the Today's Burns spatial view. Browsers and proxies should avoid caching this response."""
    response = static_file("todaysburns.html", root=PROJECT_DIR)
    response.set_header("Cache-Control", "no-store")  # Caches should not store this response to maintain currency.
    return response


@application.route("/ibp")
def ibp():
    """Return the Indicative Burn Planning view."""
    return static_file("ibp.html", root=PROJECT_DIR)


@application.route("/query-slip/ibp")
def query_slip_ibp():
    """Query the SLIP MapServer endpoint for any feature intersecting the x,y query params passed in via the request."""
    url = f"{os.getenv('SLIP_URL_IBP')}/query"
    auth = (os.getenv("SLIP_USERNAME"), os.getenv("SLIP_PASSWORD"))
    x = request.query.x
    y = request.query.y
    params = {
        "f": "geojson",
        "outFields": "*",
        "returnGeometry": True,
        "geometry": f"{x},{y}",
        "geometryType": "esriGeometryPoint",
        "spatialRel": "esriSpatialRelIntersects",
    }
    resp = requests.get(url, auth=auth, params=params)
    resp.raise_for_status()
    data = resp.json()
    response.content_type = "application/json"
    response.set_header("Cache-Control", "no-store")  # Caches should avoid storing this response.
    if "features" in data and len(data["features"]) > 0:
        # Remove surrounding double-quotes from purpose field.
        for feature in data["features"]:
            feature["properties"]["purpose"] = feature["properties"]["purpose"].replace('"', "")
        return json.dumps(data)
    else:
        return "{}"


@application.route("/favicon.ico")
def favicon():
    return static_file("favicon.ico", root=os.path.join(PROJECT_DIR, "static"))


@application.route("/static/<filepath:path>")
def serve_static(filepath):
    return static_file(filepath, root=os.path.join(PROJECT_DIR, "static"))


@application.route("/livez")
@application.route("/readyz")
def liveness():
    return "OK"


@application.error(404)
def error404(error):
    return "Not found"


if __name__ == "__main__":
    from bottle import run

    run(application, host="0.0.0.0", port=8080)
