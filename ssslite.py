import os
from pathlib import Path

from bottle import Bottle, redirect, static_file

application = Bottle()
PROJECT_DIR = str(Path(__file__).resolve().parents[0])


@application.route("/")
def index():
    # Redirect the root location to Today's Burns.
    return redirect("todaysburns")


@application.route("/todaysburns")
def todaysburns():
    return static_file("todaysburns.html", root=PROJECT_DIR)


@application.route("/ibp")
def ibp():
    return static_file("ibp.html", root=PROJECT_DIR)


@application.route("/favicon.ico")
def favicon():
    return static_file("favicon.ico", root=os.path.join(PROJECT_DIR, "static"))


@application.route("/static/<filepath:path>")
def serve_static(filepath):
    return static_file(filepath, root=os.path.join(PROJECT_DIR, "static"))


@application.error(404)
def error404(error):
    return "Not found"


if __name__ == "__main__":
    from bottle import run

    run(application, host="0.0.0.0", port=8080)
