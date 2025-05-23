# syntax=docker/dockerfile:1
# Prepare the base environment.
FROM python:3.12-slim-bookworm AS builder_base_ssslite

# This approximately follows this guide: https://hynek.me/articles/docker-uv/
# Which creates a standalone environment with the dependencies.
# - Silence uv complaining about not being able to use hard links,
# - tell uv to byte-compile packages for faster application startups,
# - prevent uv from accidentally downloading isolated Python builds,
# - pick a Python,
# - and finally declare `/app` as the target for `uv sync`.
ENV UV_LINK_MODE=copy \
  UV_COMPILE_BYTECODE=1 \
  UV_PYTHON_DOWNLOADS=never \
  UV_PROJECT_ENVIRONMENT=/app/.venv

COPY --from=ghcr.io/astral-sh/uv:0.6 /uv /uvx /bin/

# Since there's no point in shipping lock files, we move them
# into a directory that is NOT copied into the runtime image.
# The trailing slash makes COPY create `/_lock/` automagically.
COPY pyproject.toml uv.lock /_lock/

# Synchronize dependencies.
# This layer is cached until uv.lock or pyproject.toml change.
RUN --mount=type=cache,target=/root/.cache \
  cd /_lock && \
  uv sync \
  --frozen \
  --no-group dev

##################################################################################

FROM python:3.12-alpine
LABEL org.opencontainers.image.authors=asi@dbca.wa.gov.au
LABEL org.opencontainers.image.source=https://github.com/dbca-wa/ssslite

# Install system updates
RUN apk upgrade --no-cache

# Create a non-root user to run the application.
RUN addgroup -g 1000 app \
  && adduser -H -D -u 1000 -G app app

# Install the project.
WORKDIR /app
COPY --from=builder_base_ssslite --chown=app:app /app /app
# Make sure we use the virtualenv by default
ENV PATH="/app/.venv/bin:$PATH"
# Run Python unbuffered
ENV PYTHONUNBUFFERED=1

COPY gunicorn.py ibp.html todaysburns.html pyproject.toml ssslite.py ./
COPY static ./static
USER app
EXPOSE 8080
CMD ["gunicorn", "ssslite", "--config", "gunicorn.py"]
