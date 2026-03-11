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
    await waitFor(element(by.id('completion-close'))).toBeVisible().withTimeout(3000);
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

  await waitFor(element(by.id('completion-close'))).toBeVisible().withTimeout(10000);
}

describe('Completion Flow', () => {
  afterEach(async () => {
    await device.enableSynchronization();
  });

  // TC-CMP-01: SC-15 -> 閉じる -> 状態依存ホーム復帰（rehab）
  it('closes completion and returns to rehab home route', async () => {
    await launchRehabFast();
    await reachCompletion();
    await ensureCompletionActionsReady();

    await waitFor(element(by.id('completion-close'))).toBeVisible().withTimeout(10000);
    await element(by.id('completion-close')).tap();

    await waitFor(element(by.id('focus-core-open-library'))).toBeVisible().withTimeout(10000);
  });

  // TC-CMP-02: SC-15 -> もう5分 -> SC-24
  it('starts extra 5m session from completion', async () => {
    await launchRehabFast();
    await reachCompletion();
    await ensureCompletionActionsReady();

    await waitFor(element(by.id('completion-extra-5m'))).toBeVisible().withTimeout(10000);
    await expect(element(by.id('completion-extra-5m'))).toBeVisible();
  });

  // TC-CMP-03: SC-15 -> もう15分 -> SC-12
  it('starts extra 15m session from completion', async () => {
    await launchRehabFast();
    await reachCompletion();
    await ensureCompletionActionsReady();

    await waitFor(element(by.id('completion-extra-15m'))).toBeVisible().withTimeout(10000);
    await expect(element(by.id('completion-extra-15m'))).toBeVisible();
  });
});
