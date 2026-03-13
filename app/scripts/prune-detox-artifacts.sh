#!/usr/bin/env bash
set -euo pipefail

ARTIFACT_DIR="${1:-artifacts}"
KEEP="${2:-10}"

if ! [[ "$KEEP" =~ ^[0-9]+$ ]]; then
  printf '[prune-detox-artifacts] ERROR: KEEP must be a non-negative integer, got "%s"\n' "$KEEP" >&2
  exit 1
fi

if [[ ! -d "$ARTIFACT_DIR" ]]; then
  printf '[prune-detox-artifacts] skip: directory not found: %s\n' "$ARTIFACT_DIR"
  exit 0
fi

if [[ "$KEEP" -eq 0 ]]; then
  find "$ARTIFACT_DIR" -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} +
  printf '[prune-detox-artifacts] done: kept 0 directories under %s\n' "$ARTIFACT_DIR"
  exit 0
fi

set +e
old_dirs="$(
  find "$ARTIFACT_DIR" -mindepth 1 -maxdepth 1 -type d -print0 \
    | xargs -0 ls -1dt \
    | tail -n "+$((KEEP + 1))"
)"
set -e

if [[ -z "${old_dirs:-}" ]]; then
  printf '[prune-detox-artifacts] done: nothing to prune (keep=%s)\n' "$KEEP"
  exit 0
fi

printf '%s\n' "$old_dirs" | while IFS= read -r dir; do
  [[ -n "$dir" ]] || continue
  rm -rf "$dir"
  printf '[prune-detox-artifacts] removed: %s\n' "$dir"
done

printf '[prune-detox-artifacts] done: pruned artifacts under %s (keep=%s)\n' "$ARTIFACT_DIR" "$KEEP"
