#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const APP_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(APP_ROOT, '..');
const ARTIFACTS_ROOT = path.join(APP_ROOT, 'artifacts');
const NATIVE_LATEST_DIR = path.join(ARTIFACTS_ROOT, 'surface-native', 'latest');
const INDEX_PATH = path.join(REPO_ROOT, 'docs', 'screen-spec', 'data', 'screen-index.json');
const INDEX_JS_PATH = path.join(REPO_ROOT, 'docs', 'screen-spec', 'data', 'screen-index.js');
const SCREEN_SPEC_ROOT = path.join(REPO_ROOT, 'docs', 'screen-spec');

function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function pickNewest(paths) {
  if (paths.length === 0) return null;
  const sorted = [...paths].sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return sorted[0];
}

function findDetoxScreenshot(id, scenario) {
  const targetName = `flow-snapshots_${id}_${scenario}_part001.png`;
  const files = walkFiles(ARTIFACTS_ROOT).filter((file) => path.basename(file) === targetName);
  return pickNewest(files);
}

function findNativeScreenshot(id, scenario) {
  const expected = path.join(NATIVE_LATEST_DIR, `${id}_${scenario}.png`);
  if (fs.existsSync(expected)) return expected;
  return null;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyIfFound(source, destination) {
  if (!source) return false;
  ensureDir(path.dirname(destination));
  fs.copyFileSync(source, destination);
  return true;
}

function relFromRepo(filePath) {
  return path.relative(REPO_ROOT, filePath).replace(/\\/g, '/');
}

function buildIndexScript(indexPayload) {
  return `window.__SCREEN_SPEC_INDEX__ = ${JSON.stringify(indexPayload, null, 2)};\n`;
}

function main() {
  if (!fs.existsSync(INDEX_PATH)) {
    throw new Error(`screen index not found: ${INDEX_PATH}`);
  }

  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
  if (!Array.isArray(index.entries)) {
    throw new Error('screen-index.entries must be an array');
  }

  let copied = 0;
  let missing = 0;

  const nextEntries = index.entries.map((entry) => {
    const outputAbs = path.join(SCREEN_SPEC_ROOT, entry.imagePath);
    let source = null;

    if (entry.status === 'archived') {
      return {
        ...entry,
        lastSyncedAt: new Date().toISOString(),
        syncState: fs.existsSync(outputAbs) ? 'kept' : 'missing',
      };
    }

    if (entry.captureMode === 'xctest_simctl') {
      source = findNativeScreenshot(entry.id, entry.scenario);
    } else {
      source = findDetoxScreenshot(entry.id, entry.scenario);
    }

    const ok = copyIfFound(source, outputAbs);
    if (ok) copied += 1;
    if (!ok) missing += 1;

    return {
      ...entry,
      lastSyncedAt: new Date().toISOString(),
      syncState: ok ? 'copied' : 'missing',
      sourceImagePath: source ? relFromRepo(source) : null,
    };
  });

  const next = {
    ...index,
    updatedAt: new Date().toISOString().slice(0, 10),
    lastRefreshedAt: new Date().toISOString(),
    entries: nextEntries,
  };

  fs.writeFileSync(INDEX_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  fs.writeFileSync(INDEX_JS_PATH, buildIndexScript(next), 'utf8');

  console.log('[screen-spec] refresh completed');
  console.log(JSON.stringify({
    copied,
    missing,
    total: nextEntries.length,
  }, null, 2));
}

main();
