const { device, expect, element, by, waitFor } = require('detox');

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function launchRehabFast({ state = 'rehab3', sessionSeconds = '2' } = {}) {
  await device.launchApp({
    newInstance: true,
    delete: true,
    launchArgs: { e2e_state: state, e2e_session_seconds: sessionSeconds },
  });
  await device.disableSynchronization();
}

async function reachCompletion({ dismissProgressPrompt = false } = {}) {
  await waitFor(element(by.id('focus-core-primary-cta'))).toBeVisible().withTimeout(15000);
  await element(by.id('focus-core-primary-cta')).tap();
  await waitFor(element(by.id('active-session-screen'))).toBeVisible().withTimeout(10000);

  const deadline = Date.now() + 130000;
  while (Date.now() < deadline) {
    try {
      await expect(element(by.id('completion-screen'))).toBeVisible();
      return;
    } catch {
      // no-op
    }

    try {
      await expect(element(by.id('progress-prompt-screen'))).toBeVisible();
      if (!dismissProgressPrompt) return;
      await element(by.id('progress-prompt-later')).tap();
      await waitFor(element(by.id('completion-screen'))).toBeVisible().withTimeout(10000);
      return;
    } catch {
      // no-op
    }

    await sleep(1000);
  }
  throw new Error('Timed out waiting for completion or progress prompt');
}

async function ensureCompletionActionVisible(actionTestId) {
  try {
    await waitFor(element(by.id(actionTestId))).toBeVisible().withTimeout(3000);
    return;
  } catch {
    // no-op
  }

  try {
    await waitFor(element(by.id('progress-prompt-screen'))).toBeVisible().withTimeout(10000);
    await element(by.id('progress-prompt-later')).tap();
  } catch {
    // no-op
  }

  await waitFor(element(by.id(actionTestId))).toBeVisible().withTimeout(10000);
}

module.exports = {
  sleep,
  launchRehabFast,
  reachCompletion,
  ensureCompletionActionVisible,
};

