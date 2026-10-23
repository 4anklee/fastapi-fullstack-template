#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../backend"
# Use a separate local test database; process environment overrides .env.
export POSTGRES_DB="${POSTGRES_TEST_DB:-app_test}"
uv run bash scripts/prestart.sh
uv run bash scripts/tests-start.sh "$@"
