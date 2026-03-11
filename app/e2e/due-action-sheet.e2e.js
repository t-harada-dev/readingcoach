const { device, expect, element, by, waitFor } = require('detox');

async function launchDue(state) {
  await device.launchApp({
    newInstance: true,
    delete: true,
    launchArgs: { e2e_state: state },
  });
  await device.disableSynchronization();
}

describe('Due Action Sheet', () => {
  afterEach(async () => {
    await device.enableSynchronization();
  });

  // TC-DUE-02: due(normal) -> 開始 -> SC-12(15分)
  it('maps start to 15m in normal due state', async () => {
    await launchDue('due_normal');

    await waitFor(element(by.id('due-action-start'))).toBeVisible().withTimeout(20000);
    await element(by.id('due-action-start')).tap();

    await waitFor(element(by.id('active-session-screen'))).toBeVisible().withTimeout(10000);
    await expect(element(by.id('active-session-mode-15'))).toBeVisible();
  });

  // TC-DUE-03: due -> 5分だけ -> SC-24
  it('starts 5m session from due sheet', async () => {
    await launchDue('due_normal');

    await waitFor(element(by.id('due-action-start-5m'))).toBeVisible().withTimeout(20000);
    await element(by.id('due-action-start-5m')).tap();

    await waitFor(element(by.id('active-session-screen'))).toBeVisible().withTimeout(10000);
    await expect(element(by.id('active-session-mode-5'))).toBeVisible();
  });

  // TC-DUE-04: due -> 30分延期 -> active遷移しない
  it('snoozes 30m without starting a session', async () => {
    await launchDue('due_normal');

    await waitFor(element(by.id('due-action-snooze-30m'))).toBeVisible().withTimeout(20000);
    await element(by.id('due-action-snooze-30m')).tap();

    await waitFor(element(by.id('focus-core-open-library'))).toBeVisible().withTimeout(10000);
    await expect(element(by.id('active-session-screen'))).not.toBeVisible();
  });

  // TC-DUE-05: due(rehab3) -> 開始 -> SC-14(1分)
  it('maps start to 1m in rehab due state', async () => {
    await launchDue('due_rehab3');

    await waitFor(element(by.id('due-action-start'))).toBeVisible().withTimeout(20000);
    await element(by.id('due-action-start')).tap();

    await waitFor(element(by.id('active-session-screen'))).toBeVisible().withTimeout(10000);
    await expect(element(by.id('active-session-mode-1'))).toBeVisible();
  });

  // TC-DUE-06: due(restart7) -> 開始 -> SC-14(1分)
  it('maps start to 1m in restart due state', async () => {
    await launchDue('due_restart7');

    await waitFor(element(by.id('due-action-start'))).toBeVisible().withTimeout(20000);
    await element(by.id('due-action-start')).tap();

    await waitFor(element(by.id('active-session-screen'))).toBeVisible().withTimeout(10000);
    await expect(element(by.id('active-session-mode-1'))).toBeVisible();
  });

  // TC-DUE-07: 許可CTAのみ表示（禁止導線が混在しない）
  it('shows only allowed CTA group in due sheet', async () => {
    await launchDue('due_normal');

    await waitFor(element(by.id('due-action-start'))).toBeVisible().withTimeout(20000);
    await expect(element(by.id('due-action-start'))).toBeVisible();
    await expect(element(by.id('due-action-start-5m'))).toBeVisible();
    await expect(element(by.id('due-action-snooze-30m'))).toBeVisible();
    await expect(element(by.id('focus-core-open-library'))).not.toBeVisible();
    await expect(element(by.id('focus-core-change-book'))).not.toBeVisible();
  });
});
