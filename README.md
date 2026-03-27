# SSSLite

Lightweight embeddable HTML spatial data pages for DBCA.

## Installation

Dependencies for this project are managed using [uv](https://docs.astral.sh/uv/).
With uv installed, change into the project directory and run:

    uv sync

Activate the virtualenv like so:

    source .venv/bin/activate

Run Python commands in the activated virtualenv like so:

    python ssslite.py

Manage new or updated project dependencies with uv like so:

    uv add newpackage==1.0

## Docker image

To build a new Docker image from the `Dockerfile`:

    docker image build -t ghcr.io/dbca-wa/ssslite .
    docker container run --rm --publish 8080:8080 ghcr.io/dbca-wa/ssslite
