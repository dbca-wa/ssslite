# syntax=docker/dockerfile:1
FROM dhi.io/python:3.13-debian13-dev AS build-stage
LABEL org.opencontainers.image.authors=asi@dbca.wa.gov.au
LABEL org.opencontainers.image.source=https://github.com/dbca-wa/ssslite

# Install system packages required to install the project
RUN apt-get update -y \
  # Python package dependencies: gunicorn_h1c requires gcc
  && apt-get install -y --no-install-recommends gcc g++ \
  # Run shared library linker after installing packages
  && ldconfig \
  && rm -rf /var/lib/apt/lists/*

# Copy and configure uv, to install dependencies
COPY --from=ghcr.io/astral-sh/uv:0.11 /uv /bin/
WORKDIR /app
# Install project dependencies
COPY pyproject.toml uv.lock ./
RUN uv sync --no-group dev --link-mode=copy --compile-bytecode --no-python-downloads --frozen \
  # Remove uv and lockfile after use
  && rm -rf /bin/uv \
  && rm uv.lock

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PATH="/app/.venv/bin:$PATH"

# Copy the remaining project files to finish building the project
COPY gunicorn.py ibp.html todaysburns.html pyproject.toml ssslite.py ./
COPY static ./static

# Image runs as the nonroot user
EXPOSE 8080
CMD ["gunicorn", "ssslite", "--config", "gunicorn.py"]
