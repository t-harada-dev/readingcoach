#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$ROOT_DIR/app"
DEFAULT_SIMULATOR="iPhone 17 Pro Max"
REQUESTED_SIMULATOR="${1:-}"

log() {
  printf '[run-ios] %s\n' "$*"
}

error_exit() {
  local code="$1"
  shift
  printf '[run-ios] ERROR: %s\n' "$*" >&2
  exit "$code"
}

device_line_for_udid() {
  local udid="$1"
  printf '%s\n' "$SIMCTL_DEVICES_OUTPUT" | awk -v udid="$udid" '
    index($0, udid) > 0 { print; exit }
  '
}

resolve_udid_by_exact_name() {
  local name="$1"
  printf '%s\n' "$SIMCTL_DEVICES_OUTPUT" | awk -v name="$name" '
    /\((Booted|Shutdown)\)[[:space:]]*$/ {
      line=$0
      sub(/^[[:space:]]+/, "", line)
      device=line
      sub(/[[:space:]]+\([0-9A-F-]+\)[[:space:]]+\((Booted|Shutdown)\)[[:space:]]*$/, "", device)
      if (device != name) next

      if (!match(line, /\([0-9A-F-]+\)/)) next
      udid=substr(line, RSTART + 1, RLENGTH - 2)
      print udid
      exit
    }
  '
}

resolve_first_available_iphone() {
  printf '%s\n' "$SIMCTL_DEVICES_OUTPUT" | awk '
    /\((Booted|Shutdown)\)[[:space:]]*$/ {
      line=$0
      sub(/^[[:space:]]+/, "", line)
      device=line
      sub(/[[:space:]]+\([0-9A-F-]+\)[[:space:]]+\((Booted|Shutdown)\)[[:space:]]*$/, "", device)
      if (device !~ /^iPhone[[:space:]]/) next

      if (!match(line, /\([0-9A-F-]+\)/)) next
      udid=substr(line, RSTART + 1, RLENGTH - 2)
      print udid
      exit
    }
  '
}

cd "$APP_DIR"

xcode-select -p >/dev/null 2>&1 || error_exit 2 "xcode-select -p failed."
set +e
SIMCTL_DEVICES_OUTPUT="$(xcrun simctl list devices available 2>&1)"
simctl_exit="$?"
set -e
[[ "$simctl_exit" -eq 0 ]] || error_exit 2 "xcrun simctl list devices available failed.
$SIMCTL_DEVICES_OUTPUT"

simulator_udid=""
simulator_name=""
if [[ -n "$REQUESTED_SIMULATOR" ]]; then
  simulator_udid="$(resolve_udid_by_exact_name "$REQUESTED_SIMULATOR")"
  [[ -n "$simulator_udid" ]] || error_exit 2 "Simulator '$REQUESTED_SIMULATOR' not found."
  simulator_name="$REQUESTED_SIMULATOR"
else
  simulator_udid="$(resolve_udid_by_exact_name "$DEFAULT_SIMULATOR")"
  if [[ -n "$simulator_udid" ]]; then
    simulator_name="$DEFAULT_SIMULATOR"
  else
    simulator_udid="$(resolve_first_available_iphone)"
    [[ -n "$simulator_udid" ]] || error_exit 2 "No available iPhone simulator found."
    simulator_name="$(device_line_for_udid "$simulator_udid" | sed -E 's/^[[:space:]]+(.+)[[:space:]]+\([0-9A-F-]+\).*/\1/')"
  fi
fi

[[ -n "$simulator_name" ]] || error_exit 2 "Failed to resolve simulator name."
log "Using simulator: $simulator_name ($simulator_udid)"

device_line="$(device_line_for_udid "$simulator_udid")"
if [[ "$device_line" == *"(Booted)"* ]]; then
  log "Simulator already booted."
else
  log "Booting simulator..."
  xcrun simctl boot "$simulator_udid" >/dev/null 2>&1 || error_exit 2 "Failed to boot simulator $simulator_udid."
fi
xcrun simctl bootstatus "$simulator_udid" -b >/dev/null 2>&1 || error_exit 2 "Simulator bootstatus failed for $simulator_udid."

log "Building iOS app (Debug)..."
set +e
xcodebuild \
  -workspace ios/app.xcworkspace \
  -scheme app \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination "id=$simulator_udid" \
  -derivedDataPath ios/build \
  build
build_exit="$?"
set -e
[[ "$build_exit" -eq 0 ]] || error_exit 3 "xcodebuild failed with exit code $build_exit."

app_path="ios/build/Build/Products/Debug-iphonesimulator/app.app"
if [[ ! -d "$app_path" ]]; then
  app_path="$(find ios/build/Build/Products -type d -name 'app.app' | head -n 1)"
fi
[[ -n "${app_path:-}" && -d "$app_path" ]] || error_exit 3 "Built .app not found under ios/build/Build/Products."

if ! curl -fsS http://127.0.0.1:8081/status | grep -q 'packager-status:running'; then
  printf '\n[run-ios] Metro is not running on 127.0.0.1:8081.\n' >&2
  printf '[run-ios] Start it in another terminal:\n' >&2
  printf '[run-ios]   cd app && npm start\n\n' >&2
  exit 4
fi

bundle_id="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$app_path/Info.plist" 2>/dev/null || true)"
[[ -n "$bundle_id" ]] || error_exit 5 "Failed to read CFBundleIdentifier from $app_path/Info.plist."

log "Installing app..."
set +e
xcrun simctl install "$simulator_udid" "$app_path"
install_exit="$?"
set -e
[[ "$install_exit" -eq 0 ]] || error_exit 5 "simctl install failed with exit code $install_exit."

log "Launching app ($bundle_id)..."
set +e
xcrun simctl launch "$simulator_udid" "$bundle_id"
launch_exit="$?"
set -e
[[ "$launch_exit" -eq 0 ]] || error_exit 5 "simctl launch failed with exit code $launch_exit."

log "Done."
