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

describe('Progress Opt-in Flow', () => {
  afterEach(async () => {
    await device.enableSynchronization();
  });

  // TC-CMP-04: 初回完了かつ未設定時に SC-16 が表示される
  it('shows progress opt-in prompt on first completion', async () => {
    await launchRehabFast();
    await reachCompletion();

    await waitFor(element(by.id('progress-prompt-screen'))).toBeVisible().withTimeout(10000);
  });

  // TC-CMP-05: SC-16 -> 設定する -> SC-17
  it('navigates from prompt to setup', async () => {
    await launchRehabFast();
    await reachCompletion();

    await waitFor(element(by.id('progress-prompt-enable'))).toBeVisible().withTimeout(10000);
    await element(by.id('progress-prompt-enable')).tap();
    await waitFor(element(by.id('progress-setup-screen'))).toBeVisible().withTimeout(10000);
  });

  // TC-CMP-06: SC-16 -> あとで -> SC-15に戻る
  it('allows skipping progress opt-in', async () => {
    await launchRehabFast();
    await reachCompletion();

    await waitFor(element(by.id('progress-prompt-later'))).toBeVisible().withTimeout(10000);
    await element(by.id('progress-prompt-later')).tap();
    await waitFor(element(by.id('completion-screen'))).toBeVisible().withTimeout(10000);
  });

  // TC-CMP-07: SC-17 入力保存
  it('accepts progress setup save action', async () => {
    await launchRehabFast();
    await reachCompletion();

    await waitFor(element(by.id('progress-prompt-enable'))).toBeVisible().withTimeout(10000);
    await element(by.id('progress-prompt-enable')).tap();
    await waitFor(element(by.id('progress-setup-screen'))).toBeVisible().withTimeout(10000);

    const saveButton = element(by.id('progress-setup-save'));
    await waitFor(saveButton).toExist().withTimeout(10000);
    await saveButton.tap();
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
});
