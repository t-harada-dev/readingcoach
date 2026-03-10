#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${APP_DIR}"

"${SCRIPT_DIR}/bootstrap-node.sh"
"${SCRIPT_DIR}/with-local-node.sh" npm ci
"${SCRIPT_DIR}/with-local-node.sh" npm run check
