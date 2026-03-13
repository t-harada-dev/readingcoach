#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_PATH="ios/app.xcworkspace"
PROJECT_PATH="ios/app.xcodeproj"
SCHEME="app"
SIM_NAME="${IOS_SIMULATOR_NAME:-iPhone 17 Pro Max}"
APP_BUNDLE_ID="${APP_BUNDLE_ID:-com.anonymous.app}"
RUN_STAMP="$(date -u +'%Y-%m-%dT%H-%M-%SZ')"
OUTPUT_ROOT="artifacts/surface-native"
RUN_DIR="$OUTPUT_ROOT/$RUN_STAMP"
LATEST_DIR="$OUTPUT_ROOT/latest"

mkdir -p "$RUN_DIR" "$LATEST_DIR"

XCODE_CONTAINER_ARGS=()
if [[ -d "$WORKSPACE_PATH" ]]; then
  XCODE_CONTAINER_ARGS=(-workspace "$WORKSPACE_PATH")
elif [[ -f "$PROJECT_PATH/project.pbxproj" ]]; then
  XCODE_CONTAINER_ARGS=(-project "$PROJECT_PATH")
else
  echo "[surface-native] error: neither $WORKSPACE_PATH nor $PROJECT_PATH is available"
  exit 1
fi

if [[ -f "$PROJECT_PATH/project.pbxproj" ]] && grep -q "appUITests" "$PROJECT_PATH/project.pbxproj"; then
  echo "[surface-native] running xcodebuild test for appUITests"
  xcodebuild test \
    "${XCODE_CONTAINER_ARGS[@]}" \
    -scheme "$SCHEME" \
    -destination "platform=iOS Simulator,name=$SIM_NAME" \
    -only-testing:appUITests/SurfaceSnapshotUITests
else
  echo "[surface-native] appUITests target not found; running build only"
  xcodebuild build \
    "${XCODE_CONTAINER_ARGS[@]}" \
    -scheme "$SCHEME" \
    -destination "platform=iOS Simulator,name=$SIM_NAME"
fi

xcrun simctl boot "$SIM_NAME" >/dev/null 2>&1 || true

capture_one() {
  local id="$1"
  local scenario="$2"
  local out="$RUN_DIR/${id}_${scenario}.png"

  xcrun simctl terminate booted "$APP_BUNDLE_ID" >/dev/null 2>&1 || true
  xcrun simctl launch booted "$APP_BUNDLE_ID" -e2e_surface_snapshot "$id" >/dev/null
  sleep 2
  xcrun simctl io booted screenshot "$out" >/dev/null
  cp "$out" "$LATEST_DIR/${id}_${scenario}.png"
  echo "[surface-native] captured: $out"
}

capture_one SF-01 normal
capture_one SF-02 rehab
capture_one SF-03 normal
capture_one SF-04 rehab
capture_one SF-05 normal
capture_one SF-06 rehab
capture_one SF-07 rehab
capture_one SF-08 normal
capture_one SF-09 normal

echo "[surface-native] done"
echo "[surface-native] run_dir=$RUN_DIR"
echo "[surface-native] latest_dir=$LATEST_DIR"
