const { expect, element, by, waitFor } = require('detox');
const { launchAppSynced } = require('./helpers/launchApp');

async function launchDue(state) {
  await launchAppSynced({
    newInstance: true,
    delete: true,
    launchArgs: { e2e_state: state },
  });
}

async function startFromDue({ state, startButtonId, modeTestId }) {
  await launchDue(state);
  await waitFor(element(by.id(startButtonId))).toBeVisible().withTimeout(20000);

  for (let i = 0; i < 3; i += 1) {
    await element(by.id(startButtonId)).tap();
    try {
      await waitFor(element(by.id(modeTestId))).toExist().withTimeout(4000);
      return;
    } catch {
      // Retry to absorb occasional unsynced tap drops or transition delays.
    }
  }

  await waitFor(element(by.id(modeTestId))).toExist().withTimeout(15000);
}

describe('Due Action Sheet', () => {
  // TC-DUE-02: due(normal) -> 開始 -> SC-12(15分)
  it('maps start to 15m in normal due state', async () => {
    await startFromDue({
      state: 'due_normal',
      startButtonId: 'due-action-start',
      modeTestId: 'active-session-mode-15',
    });
    await expect(element(by.id('active-session-mode-15'))).toExist();
  });

  // TC-DUE-03: due -> 5分だけ -> SC-24
  it('starts 5m session from due sheet', async () => {
    await startFromDue({
      state: 'due_normal',
      startButtonId: 'due-action-start-5m',
      modeTestId: 'active-session-mode-5',
    });
    await expect(element(by.id('active-session-mode-5'))).toExist();
  });

  // TC-DUE-04: due -> 30分延期 -> active遷移しない
  it('snoozes 30m without starting a session', async () => {
    await launchDue('due_normal');

    await waitFor(element(by.id('due-action-snooze-30m'))).toBeVisible().withTimeout(20000);
    await element(by.id('due-action-snooze-30m')).tap();

    await waitFor(element(by.id('due-action-start'))).not.toBeVisible().withTimeout(10000);
    await expect(element(by.id('active-session-mode-15'))).not.toExist();
    await expect(element(by.id('active-session-mode-5'))).not.toExist();
    await expect(element(by.id('active-session-mode-1'))).not.toExist();
  });

  // TC-DUE-05: due(rehab3) -> 開始 -> SC-14(1分)
  it('maps start to 1m in rehab due state', async () => {
    await startFromDue({
      state: 'due_rehab3',
      startButtonId: 'due-action-start',
      modeTestId: 'active-session-mode-1',
    });
    await expect(element(by.id('active-session-mode-1'))).toExist();
  });

  // TC-DUE-06: due(restart7) -> 開始 -> SC-14(1分)
  it('maps start to 1m in restart due state', async () => {
    await startFromDue({
      state: 'due_restart7',
      startButtonId: 'due-action-start',
      modeTestId: 'active-session-mode-1',
    });
    await expect(element(by.id('active-session-mode-1'))).toExist();
  });

  // TC-DUE-07: 許可CTAのみ表示（禁止導線が混在しない）
  it('shows only allowed CTA group in due sheet', async () => {
    await launchDue('due_normal');

    await waitFor(element(by.id('due-action-start'))).toBeVisible().withTimeout(20000);
    await expect(element(by.id('due-action-start'))).toBeVisible();
    await expect(element(by.id('due-action-start-5m'))).toBeVisible();
    await expect(element(by.id('due-action-snooze-30m'))).toBeVisible();
    await expect(element(by.id('focus-core-change-book'))).not.toBeVisible();
  });
});
