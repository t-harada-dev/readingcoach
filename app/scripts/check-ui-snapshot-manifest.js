#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const manifestPath = path.resolve(__dirname, '../e2e/snapshots/uiSnapshotManifest.v1.json');
const snapshotTargetsPath = path.resolve(__dirname, '../e2e/snapshots/snapshotTargets.json');

const allowedUiTypes = new Set(['screen', 'surface']);
const allowedModes = new Set(['detox_flow', 'detox_injected', 'xctest_simctl']);
const allowedStatus = new Set(['implemented']);
const allowedCaptureSources = new Set(['flow', 'injected', 'native_ui']);

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

  const duplicateTarget = new Set();
  for (const [index, target] of snapshotTargets.entries()) {
    const pointer = `snapshotTargets[${index}]`;
    for (const key of ['screenId', 'scenario', 'captureSource', 'suite']) {
      if (typeof target[key] !== 'string' || target[key].trim() === '') {
        fail(`${pointer}.${key} must be a non-empty string`);
      }
    }
    if (!allowedCaptureSources.has(target.captureSource)) {
      fail(`${pointer}.captureSource is invalid: ${target.captureSource}`);
    }
    const targetId = `${target.screenId}:${target.scenario}`;
    if (duplicateTarget.has(targetId)) {
      fail(`duplicate snapshot target: ${targetId}`);
    }
    duplicateTarget.add(targetId);
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
      fail(`${pointer}.baseline must be true`);
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
      fail(`unexpected targetId: ${entry.targetId}`);
    }
  }

  for (const targetId of requiredTargetIds) {
    if (!foundTargetIds.has(targetId)) {
      fail(`missing required targetId: ${targetId}`);
    }
  }

  if (foundTargetIds.size !== requiredTargetIds.size) {
    fail(`entry count mismatch: required=${requiredTargetIds.size}, found=${foundTargetIds.size}`);
  }

  console.log('[ui-snapshot-manifest] OK');
  console.log(JSON.stringify({
    scope: manifest?.scope?.mode ?? 'unknown',
    requiredTargets: requiredTargetIds.size,
    implementedTargets: foundTargetIds.size,
  }, null, 2));
}

main();
