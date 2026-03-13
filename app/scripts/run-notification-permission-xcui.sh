#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-short}"
WORKSPACE_PATH="ios/app.xcworkspace"
PROJECT_PATH="ios/app.xcodeproj"
SCHEME="app"
SIM_NAME="${IOS_SIMULATOR_NAME:-iPhone 17 Pro Max}"

XCODE_CONTAINER_ARGS=()
if [[ -d "$WORKSPACE_PATH" ]]; then
  XCODE_CONTAINER_ARGS=(-workspace "$WORKSPACE_PATH")
elif [[ -f "$PROJECT_PATH/project.pbxproj" ]]; then
  XCODE_CONTAINER_ARGS=(-project "$PROJECT_PATH")
else
  echo "[permission-xcui] error: neither $WORKSPACE_PATH nor $PROJECT_PATH is available"
  exit 1
fi

if [[ ! -f "$PROJECT_PATH/project.pbxproj" ]] || ! grep -q "appUITests" "$PROJECT_PATH/project.pbxproj"; then
  echo "[permission-xcui] appUITests target not found; skipping"
  exit 0
fi

SHORT_TESTS=(
  "-only-testing:appUITests/NotificationPermissionUITests/testPermission01_FirstLaunchAllow_ContinuesFlow"
  "-only-testing:appUITests/NotificationPermissionUITests/testPermission02_FirstLaunchDeny_ContinuesFlow"
  "-only-testing:appUITests/NotificationPermissionUITests/testPermission03_DeniedState_FallbackFlow"
)

FULL_TESTS=(
  "-only-testing:appUITests/NotificationPermissionUITests"
)

ARGS=("${FULL_TESTS[@]}")
if [[ "$MODE" == "short" ]]; then
  ARGS=("${SHORT_TESTS[@]}")
fi

echo "[permission-xcui] running mode=$MODE"
xcodebuild test \
  "${XCODE_CONTAINER_ARGS[@]}" \
  -scheme "$SCHEME" \
  -destination "platform=iOS Simulator,name=$SIM_NAME" \
  -parallel-testing-enabled NO \
  -maximum-parallel-testing-workers 1 \
  "${ARGS[@]}"
