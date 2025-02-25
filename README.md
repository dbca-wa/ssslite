# SSSLite

Lightweight embeddable HTML spatial data pages for DBCA.

## Installation

Set up this project for development using [uv](https://docs.astral.sh/uv/)
to install and manage a Python virtual environment.
With uv installed, clone and cd into the project, then install like so:

    uv install

Activate the virtualenv like so:

    source .venv/bin/activate

To run Python commands in the activated virtualenv, thereafter run them like so:

    python manage.py

Manage new or updated project dependencies with uv also, like so:

    uv add newpackage==1.0

## Docker image

To build a new Docker image from the `Dockerfile`:

    docker image build -t ghcr.io/dbca-wa/ssslite .
