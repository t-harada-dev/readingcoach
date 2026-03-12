#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const manifestPath = path.resolve(__dirname, '../e2e/snapshots/uiSnapshotManifest.v1.json');
const snapshotTargetsPath = path.resolve(__dirname, '../e2e/snapshots/snapshotTargets.json');

const allowedUiTypes = new Set(['screen']);
const allowedModes = new Set(['detox_flow', 'detox_injected']);
const allowedStatus = new Set(['implemented']);

function fail(message) {
  console.error(`[ui-snapshot-manifest] ERROR: ${message}`);
  process.exit(1);
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`file not found: ${filePath}`);
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`invalid JSON (${filePath}): ${error.message}`);
  }
}

function main() {
  const manifest = readJson(manifestPath);
  const snapshotTargets = readJson(snapshotTargetsPath);

  if (!Array.isArray(manifest.entries)) {
    fail('manifest.entries must be an array');
  }
  if (!Array.isArray(snapshotTargets)) {
    fail('snapshotTargets must be an array');
  }

  const requiredTargetIds = new Set(
    snapshotTargets.map((target) => `${target.screenId}:${target.scenario}`)
  );

  const foundTargetIds = new Set();
  for (const [index, entry] of manifest.entries.entries()) {
    const pointer = `entries[${index}]`;
    const required = ['targetId', 'uiId', 'uiType', 'variantId', 'captureMode', 'status', 'sourceRef', 'artifactKey'];

    for (const key of required) {
      if (typeof entry[key] !== 'string' || entry[key].trim() === '') {
        fail(`${pointer}.${key} must be a non-empty string`);
      }
    }
    if (entry.baseline !== true) {
      fail(`${pointer}.baseline must be true (core10 scope)`);
    }
    if (!allowedUiTypes.has(entry.uiType)) {
      fail(`${pointer}.uiType is invalid: ${entry.uiType}`);
    }
    if (!allowedModes.has(entry.captureMode)) {
      fail(`${pointer}.captureMode is invalid: ${entry.captureMode}`);
    }
    if (!allowedStatus.has(entry.status)) {
      fail(`${pointer}.status is invalid: ${entry.status}`);
    }

    if (foundTargetIds.has(entry.targetId)) {
      fail(`duplicate targetId: ${entry.targetId}`);
    }
    foundTargetIds.add(entry.targetId);

    if (!requiredTargetIds.has(entry.targetId)) {
      fail(`unexpected targetId for core10 scope: ${entry.targetId}`);
    }
  }

  for (const targetId of requiredTargetIds) {
    if (!foundTargetIds.has(targetId)) {
      fail(`missing required core10 targetId: ${targetId}`);
    }
  }

  if (foundTargetIds.size !== requiredTargetIds.size) {
    fail(`entry count mismatch: required=${requiredTargetIds.size}, found=${foundTargetIds.size}`);
  }

  console.log('[ui-snapshot-manifest] OK');
  console.log(JSON.stringify({
    scope: 'core10',
    requiredTargets: requiredTargetIds.size,
    implementedTargets: foundTargetIds.size,
  }, null, 2));
}

main();
