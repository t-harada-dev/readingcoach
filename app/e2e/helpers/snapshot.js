const { device } = require('detox');
const snapshotTargets = require('../snapshots/snapshotTargets.json');

function targetKey(screenId, scenario) {
  return `${screenId}:${scenario}`;
}

function toStepToken(step) {
  const normalized = Number.isInteger(step) && step > 0 ? step : 1;
  return String(normalized).padStart(3, '0');
}

function buildScreenshotName(screenId, scenario, step = 1) {
  return `flow-snapshots/${screenId}_${scenario}_part${toStepToken(step)}`;
}

function createSnapshotTracker(suite) {
  if (!suite) {
    throw new Error('suite is required');
  }

  const suiteTargets = snapshotTargets.filter((target) => target.suite === suite);
  if (suiteTargets.length === 0) {
    throw new Error(`No snapshot targets defined for suite=${suite}`);
  }

  const expected = new Map();
  for (const target of suiteTargets) {
    expected.set(targetKey(target.screenId, target.scenario), target);
  }

  const captured = new Set();

  return {
    targets: suiteTargets,
    async capture(screenId, scenario, step = 1) {
      const key = targetKey(screenId, scenario);
      if (!expected.has(key)) {
        throw new Error(`Unexpected capture target: ${key} (suite=${suite})`);
      }

      captured.add(key);
      await device.takeScreenshot(buildScreenshotName(screenId, scenario, step));
    },
    assertCoverage() {
      const missing = suiteTargets.filter((target) => !captured.has(targetKey(target.screenId, target.scenario)));
      if (missing.length === 0) return;

      const missingList = missing
        .map((target) => `${target.screenId}/${target.scenario}[${target.captureSource}]`)
        .join(', ');
      throw new Error(`Missing snapshot captures for suite=${suite}: ${missingList}`);
    },
  };
}

module.exports = {
  buildScreenshotName,
  createSnapshotTracker,
};
