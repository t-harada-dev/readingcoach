const { expect, element, by, waitFor } = require('detox');
const { launchAppUnsynced } = require('./launchApp');

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function launchRehabFast({ state = 'rehab3', sessionSeconds = '2' } = {}) {
  await launchAppUnsynced({
    newInstance: true,
    delete: true,
    launchArgs: { e2e_state: state, e2e_session_seconds: sessionSeconds },
  });
}

async function startSessionFromHome() {
  await waitFor(element(by.id('focus-core-primary-cta'))).toBeVisible().withTimeout(15000);

  for (let i = 0; i < 3; i += 1) {
    try {
      await element(by.id('focus-core-primary-cta')).tap();
      await waitFor(element(by.id('active-session-screen'))).toBeVisible().withTimeout(10000);
      return;
    } catch {
      // Ensure the CTA is inside hittable area on compact simulator heights.
      try {
        await element(by.id('focus-core-scroll')).scrollTo('bottom');
      } catch {
        // no-op
      }
      await sleep(300);
    }
  }

  await waitFor(element(by.id('focus-core-primary-cta'))).toBeVisible().withTimeout(10000);
  await element(by.id('focus-core-primary-cta')).tap();
  await waitFor(element(by.id('active-session-screen'))).toBeVisible().withTimeout(10000);
}

async function reachCompletion({ dismissProgressPrompt = false, sessionStarted = false } = {}) {
  if (!sessionStarted) {
    await startSessionFromHome();
  }

  const deadline = Date.now() + 90000;
  while (Date.now() < deadline) {
    try {
      await expect(element(by.id('completion-message'))).toBeVisible();
      return;
    } catch {
      // no-op
    }

    try {
      await expect(element(by.id('progress-prompt-screen'))).toBeVisible();
      if (!dismissProgressPrompt) return;
      await element(by.id('progress-prompt-later')).tap();
      await waitFor(element(by.id('completion-message'))).toBeVisible().withTimeout(15000);
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
  startSessionFromHome,
  reachCompletion,
  ensureCompletionActionVisible,
};
