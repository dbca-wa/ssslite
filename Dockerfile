# syntax=docker/dockerfile:1

# ---- Builder stage ----
FROM dhi.io/python:3.13-debian13-dev AS builder

RUN <<EOF
set -euxo pipefail
apt-get update
apt-get install -y --no-install-recommends \
  gcc \
  g++
EOF

WORKDIR /app
COPY --from=ghcr.io/astral-sh/uv:0.12 /uv /bin/
COPY pyproject.toml uv.lock ./
RUN uv sync --no-group dev --link-mode=copy --compile-bytecode --no-python-downloads --frozen

# ---- Runtime stage ----
FROM dhi.io/python:3.13-debian13-dev
LABEL org.opencontainers.image.authors=asi@dbca.wa.gov.au
LABEL org.opencontainers.image.source=https://github.com/dbca-wa/ssslite

# Environment variables
ENV PYTHONUNBUFFERED=1 \
  PYTHONDONTWRITEBYTECODE=1 \
  PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Copy installed virtualenv from builder
COPY --from=builder /app /app

# Copy the remaining project files to finish building the project
COPY --chown=nonroot:nonroot gunicorn.py bait.html ibp.html test.html todaysburns.html pyproject.toml ssslite.py ./
COPY --chown=nonroot:nonroot static ./static

# Image runs as the nonroot user
USER nonroot
EXPOSE 8080
CMD ["gunicorn", "ssslite", "--config", "gunicorn.py"]
