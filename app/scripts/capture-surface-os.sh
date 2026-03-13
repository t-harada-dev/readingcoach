#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_PATH="ios/app.xcworkspace"
PROJECT_PATH="ios/app.xcodeproj"
SCHEME="app"
SIM_NAME="${IOS_SIMULATOR_NAME:-iPhone 17 Pro Max}"
APP_BUNDLE_ID="${APP_BUNDLE_ID:-com.anonymous.app}"
RUN_STAMP="$(date -u +'%Y-%m-%dT%H-%M-%SZ')"
OUTPUT_ROOT="artifacts/surface-os"
RUN_DIR="$OUTPUT_ROOT/$RUN_STAMP"
LATEST_DIR="$OUTPUT_ROOT/latest"

mkdir -p "$RUN_DIR" "$LATEST_DIR"

XCODE_CONTAINER_ARGS=()
if [[ -d "$WORKSPACE_PATH" ]]; then
  XCODE_CONTAINER_ARGS=(-workspace "$WORKSPACE_PATH")
elif [[ -f "$PROJECT_PATH/project.pbxproj" ]]; then
  XCODE_CONTAINER_ARGS=(-project "$PROJECT_PATH")
else
  echo "[surface-os] error: neither $WORKSPACE_PATH nor $PROJECT_PATH is available"
  exit 1
fi

if [[ -f "$PROJECT_PATH/project.pbxproj" ]] && grep -q "appUITests" "$PROJECT_PATH/project.pbxproj"; then
  echo "[surface-os] running xcodebuild test for SurfaceOSPlacementUITests"
  xcodebuild test \
    "${XCODE_CONTAINER_ARGS[@]}" \
    -scheme "$SCHEME" \
    -destination "platform=iOS Simulator,name=$SIM_NAME" \
    -parallel-testing-enabled NO \
    -maximum-parallel-testing-workers 1 \
    -only-testing:appUITests/SurfaceOSPlacementUITests
else
  echo "[surface-os] appUITests target not found; running build only"
  xcodebuild build \
    "${XCODE_CONTAINER_ARGS[@]}" \
    -scheme "$SCHEME" \
    -destination "platform=iOS Simulator,name=$SIM_NAME"
fi

xcrun simctl boot "$SIM_NAME" >/dev/null 2>&1 || true

capture_one() {
  local key="$1"
  shift

  local out="$RUN_DIR/${key}.png"
  xcrun simctl terminate booted "$APP_BUNDLE_ID" >/dev/null 2>&1 || true
  xcrun simctl launch booted "$APP_BUNDLE_ID" "$@" >/dev/null
  sleep 2
  xcrun simctl io booted screenshot "$out" >/dev/null
  cp "$out" "$LATEST_DIR/${key}.png"
  echo "[surface-os] captured: $out"
}

capture_one widget_normal -e2e_surface_snapshot SF-01
capture_one widget_rehab -e2e_surface_snapshot SF-02
capture_one intent_start -e2e_state due_normal -e2e_surface_source app_intent -e2e_surface_action start
capture_one intent_start_5m -e2e_state due_rehab3 -e2e_surface_source app_intent -e2e_surface_action start_5m
capture_one intent_show_today_book -e2e_surface_source app_intent -e2e_surface_action show_today_book

echo "[surface-os] done"
echo "[surface-os] run_dir=$RUN_DIR"
echo "[surface-os] latest_dir=$LATEST_DIR"
