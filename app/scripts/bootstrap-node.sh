#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

NODE_VERSION="${NODE_VERSION:-20.19.4}"
OS="$(uname -s)"
ARCH="$(uname -m)"

case "${OS}" in
  Darwin) PLATFORM_OS="darwin" ;;
  Linux) PLATFORM_OS="linux" ;;
  *)
    echo "Unsupported OS: ${OS}" >&2
    exit 1
    ;;
esac

case "${ARCH}" in
  arm64|aarch64) PLATFORM_ARCH="arm64" ;;
  x86_64|amd64) PLATFORM_ARCH="x64" ;;
  *)
    echo "Unsupported architecture: ${ARCH}" >&2
    exit 1
    ;;
esac

DIST_NAME="node-v${NODE_VERSION}-${PLATFORM_OS}-${PLATFORM_ARCH}"
ARCHIVE_NAME="${DIST_NAME}.tar.gz"
DIST_URL="https://nodejs.org/dist/v${NODE_VERSION}/${ARCHIVE_NAME}"

TOOLS_DIR="${APP_DIR}/.tools"
CACHE_DIR="${TOOLS_DIR}/cache"
INSTALL_DIR="${TOOLS_DIR}/${DIST_NAME}"
ARCHIVE_PATH="${CACHE_DIR}/${ARCHIVE_NAME}"
CURRENT_LINK="${TOOLS_DIR}/node-current"

mkdir -p "${CACHE_DIR}"

if [ ! -f "${ARCHIVE_PATH}" ]; then
  echo "Downloading ${DIST_URL}"
  curl -fsSL "${DIST_URL}" -o "${ARCHIVE_PATH}"
fi

if [ ! -d "${INSTALL_DIR}" ]; then
  echo "Extracting ${ARCHIVE_NAME}"
  tar -xzf "${ARCHIVE_PATH}" -C "${TOOLS_DIR}"
fi

ln -sfn "${INSTALL_DIR}" "${CURRENT_LINK}"

echo "Local Node installed: ${CURRENT_LINK}/bin/node"
export PATH="${CURRENT_LINK}/bin:${PATH}"
"${CURRENT_LINK}/bin/node" -v
"${CURRENT_LINK}/bin/npm" -v
