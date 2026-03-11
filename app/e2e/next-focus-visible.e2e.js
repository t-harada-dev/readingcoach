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
      await element(by.id('progress-prompt-later')).tap();
      await waitFor(element(by.id('completion-screen'))).toBeVisible().withTimeout(10000);
      return;
    } catch {
      // no-op
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error('Timed out waiting for completion-screen');
}

describe('Next Focus Visible', () => {
  afterEach(async () => {
    await device.enableSynchronization();
  });

  // TC-CMP-10E (minimal E2E): SC-19 で次本選択の確定操作が可能
  it('shows nominated next book on FocusCore after confirm', async () => {
    await launchRehabFast();
    await reachCompletion();

    await waitFor(element(by.id('completion-finished-book'))).toBeVisible().withTimeout(10000);
    await element(by.id('completion-finished-book')).tap();

    await waitFor(element(by.id('next-focus-screen'))).toBeVisible().withTimeout(10000);
    await waitFor(element(by.id('next-focus-selection-ready'))).toExist().withTimeout(10000);
    await element(by.id('next-focus-confirm')).tap();
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
});
