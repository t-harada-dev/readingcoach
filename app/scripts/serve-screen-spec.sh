#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DOC_ROOT="$REPO_ROOT/docs/screen-spec"
HOST="${SCREEN_SPEC_HOST:-127.0.0.1}"
PORT="${SCREEN_SPEC_PORT:-4173}"

if ! command -v python3 >/dev/null 2>&1; then
  echo "[screen-spec-preview] error: python3 is required" >&2
  exit 1
fi

if [[ ! -d "$DOC_ROOT" ]]; then
  echo "[screen-spec-preview] error: docs directory not found: $DOC_ROOT" >&2
  exit 1
fi

echo "[screen-spec-preview] serving: $DOC_ROOT"
echo "[screen-spec-preview] url: http://$HOST:$PORT/"
echo "[screen-spec-preview] stop: Ctrl+C"

cd "$DOC_ROOT"
exec python3 -m http.server "$PORT" --bind "$HOST"
