# AGENTS.md — SSSLite

Compact guidance for agent sessions working on this repo.

## What this is

A tiny [Bottle](https://bottlepy.org/) app (`ssslite.py`) that serves three static HTML spatial-data views for DBCA:
`/todaysburns`, `/ibp`, and `/bait`. The only dynamic route is `/query-slip/ibp`, which proxies a click-to-query call to the SLIP MapServer endpoint.

## Daily commands

- **Install dependencies:** `uv sync`
- **Run locally:** `uv run python ssslite.py` (serves on `0.0.0.0:8080`)
- **Lint:** `uv run ruff check .`
- **Add a dependency:** `uv add package==1.2.3`

There is no test runner installed and no test suite. Verification is `ruff check` plus a local run.

## Environment

- The app auto-loads `.env` from the current working directory if it exists (`ssslite.py`).
- `.env` is gitignored.
- Required for `/query-slip/ibp`:
  - `SLIP_URL_IBP`
  - `SLIP_USERNAME`
  - `SLIP_PASSWORD`
- An encrypted `.env.enc` exists at the repo root. Decrypt with `./decrypt-env-files-recursive.sh` (interactive password prompt; dry-run with `--dry-run`).

## Application wiring

- Entrypoint for Docker: `gunicorn ssslite --config gunicorn.py`
- Gunicorn binds `:8080`, 2 workers, probes on `/livez` and `/readyz`.
- Static files live next to the module root (`todaysburns.html`, `ibp.html`, `bait.html`) and in `static/`.
- Root `/` redirects to `/todaysburns`.

## Docker / release

- Build locally: `docker buildx bake`
- Build and push multi-arch: `docker buildx bake --push`
- The default registry/tag is `ghcr.io/dbca-wa/ssslite:latest`.
- Base image is `dhi.io/python:3.13-debian13-dev` (Docker Hardened Images). Dependabot uses Docker Hub credentials to scan it.
- **Release sync check:** bump the prod image tag in `kustomize/overlays/prod/kustomization.yml` to match `version` in `pyproject.toml`.

## Kubernetes / Kustomize

- Overlays: `kustomize/overlays/uat/` and `kustomize/overlays/prod/`.
- Each overlay needs a local `.env` file (SLIP URL, username, password) consumed by `secretGenerator`.
- Preview an overlay: `kustomize build kustomize/overlays/uat/ | less`
- Prod pins the image tag; UAT uses unpinned `latest` with `imagePullPolicy: Always`.
- Network policy is default-deny for ingress/egress; egress allow uses `CiliumNetworkPolicy` for FQDNs `*.slip.wa.gov.au` and `*.dbca.wa.gov.au`.

## CI / security

- `.github/workflows/multi-build.yml` builds and pushes the multi-arch image on push to `main`/`dev`/tags and on a weekday schedule, then runs a Trivy image scan.
- `.github/workflows/security-msdo-defender.yml` runs Bandit + CredScan on `main` PRs/pushes.
- Dependabot covers `uv`, GitHub Actions, and Docker.

## Style notes

- Ruff config in `pyproject.toml`: line length 120, ignores `E265`, `E501`, `E722`. Don't fight these.
- Python 3.13 required; `requires-python = ">=3.13,<4.0"`.

## Sources of truth

- Dependencies / Python version: `pyproject.toml` + `uv.lock`
- App config: `gunicorn.py`
- Docker build: `Dockerfile` + `docker-bake.hcl`
- K8s manifests: `kustomize/` (overlay `kustomization.yml` files, especially prod image tag)
- CI: `.github/workflows/`
