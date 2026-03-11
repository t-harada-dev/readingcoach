const { device, expect, element, by, waitFor } = require('detox');

async function launchRehabFast() {
  await device.launchApp({
    newInstance: true,
    delete: true,
    launchArgs: { e2e_state: 'rehab3', e2e_session_seconds: '2' },
  });
  await device.disableSynchronization();
}

async function reachCompletion() {
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
      return;
    } catch {
      // no-op
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error('Timed out waiting for completion or progress prompt');
}

async function ensureCompletionActionsReady() {
  try {
    await waitFor(element(by.id('completion-finished-book'))).toBeVisible().withTimeout(3000);
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

  await waitFor(element(by.id('completion-finished-book'))).toBeVisible().withTimeout(10000);
}

describe('Finished Book Flow', () => {
  afterEach(async () => {
    await device.enableSynchronization();
  });

  // TC-CMP-09: 読了 -> 次本指名導線（SC-19）へ遷移
  it('moves from finished-book action to next-focus nomination', async () => {
    await launchRehabFast();
    await reachCompletion();
    await ensureCompletionActionsReady();

    await waitFor(element(by.id('completion-finished-book'))).toBeVisible().withTimeout(10000);
    await element(by.id('completion-finished-book')).tap();

    await waitFor(element(by.id('next-focus-screen'))).toBeVisible().withTimeout(10000);
    await waitFor(element(by.id('next-focus-confirm'))).toBeVisible().withTimeout(10000);
  });
});
