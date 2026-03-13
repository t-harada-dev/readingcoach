#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

log() {
  printf '[e2e-build-ios] %s\n' "$*"
}

fail() {
  printf '[e2e-build-ios] ERROR: %s\n' "$*" >&2
  exit 1
}

log "Preflight checks..."
xcode-select -p >/dev/null 2>&1 || fail "xcode-select -p failed. Xcode command line tools are not configured."
xcodebuild -version >/dev/null 2>&1 || fail "xcodebuild -version failed. Xcode installation may be broken."

set +e
simctl_output="$(xcrun simctl list devices 2>&1)"
simctl_exit="$?"
set -e
[[ "$simctl_exit" -eq 0 ]] || fail "xcrun simctl list devices failed.
$simctl_output"

shopt -s nullglob
workspace_candidates=(ios/*.xcworkspace)
shopt -u nullglob

workspace=""
if [[ "${#workspace_candidates[@]}" -eq 0 ]]; then
  fail "No .xcworkspace found under ios/."
elif [[ "${#workspace_candidates[@]}" -eq 1 ]]; then
  workspace="${workspace_candidates[0]}"
elif [[ -d ios/app.xcworkspace ]]; then
  workspace="ios/app.xcworkspace"
else
  fail "Multiple workspaces found and ios/app.xcworkspace does not exist: ${workspace_candidates[*]}"
fi

[[ -f "$workspace/contents.xcworkspacedata" ]] || fail "Workspace metadata missing: $workspace/contents.xcworkspacedata"
log "Using workspace: $workspace"

log "Running xcodebuild..."
xcodebuild \
  -workspace "$workspace" \
  -scheme app \
  -configuration Release \
  -sdk iphonesimulator \
  -derivedDataPath ios/build
