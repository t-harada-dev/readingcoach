#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
NODE_BIN_DIR="${APP_DIR}/.tools/node-current/bin"

if [ ! -x "${NODE_BIN_DIR}/node" ] || [ ! -x "${NODE_BIN_DIR}/npm" ]; then
  echo "Local Node not found. Run: ./scripts/bootstrap-node.sh" >&2
  exit 1
fi

if [ "$#" -eq 0 ]; then
  echo "Usage: ./scripts/with-local-node.sh <command> [args...]" >&2
  exit 1
fi

export PATH="${NODE_BIN_DIR}:${PATH}"
exec "$@"
