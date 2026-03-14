const { by, element, expect, waitFor } = require('detox');
const { launchAppUnsynced } = require('./helpers/launchApp');

async function launchTimeChange(launchArgs = {}) {
  await launchAppUnsynced({
    newInstance: true,
    delete: true,
    launchArgs: {
      e2e_state: 'normal',
      e2e_open_screen: 'time_change',
      ...launchArgs,
    },
  });
}

async function waitForAny(ids, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    for (const id of ids) {
      try {
        await waitFor(element(by.id(id))).toExist().withTimeout(800);
        return id;
      } catch {
        // try next candidate
      }
    }
  }
  throw new Error(`none of expected elements appeared: ${ids.join(', ')}`);
}

describe('Time Change Flow', () => {
  it('TC-01: opens time change screen', async () => {
    await launchTimeChange();
    await waitFor(element(by.id('time-change-screen'))).toExist().withTimeout(15000);
    await waitFor(element(by.id('time-change-confirm'))).toBeVisible().withTimeout(10000);
  });

  it('TC-02: applies preset buttons to hour/minute inputs', async () => {
    await launchTimeChange();
    await waitFor(element(by.id('time-change-preset-7'))).toBeVisible().withTimeout(10000);
    await element(by.id('time-change-preset-7')).tap();
    await expect(element(by.id('time-change-hour-input'))).toHaveText('7');
    await expect(element(by.id('time-change-minute-input'))).toHaveText('00');

    await element(by.id('time-change-preset-22')).tap();
    await expect(element(by.id('time-change-hour-input'))).toHaveText('22');
    await expect(element(by.id('time-change-minute-input'))).toHaveText('00');
  });

  it('TC-03: confirms and returns to home', async () => {
    await launchTimeChange();
    await waitFor(element(by.id('time-change-confirm'))).toBeVisible().withTimeout(10000);
    await element(by.id('time-change-confirm')).tap();
    await waitForAny(
      ['focus-core-screen', 'due-action-sheet-screen', 'settings-screen', 'time-change-screen'],
      30000
    );
  });
});
