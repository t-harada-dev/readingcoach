const { expect, element, by, waitFor } = require('detox');
const { launchAppUnsynced } = require('./helpers/launchApp');

describe('Due Retry Flow', () => {
  // TC-DUE-08 (app E2Eで検証可能な部分):
  // deferred(retry pending) では SC-23 を即表示しない。
  it('does not open due sheet while deferred retry is pending', async () => {
    await launchAppUnsynced({
      newInstance: true,
      delete: true,
      launchArgs: { e2e_state: 'deferred_retry_pending' },
    });

    await waitFor(element(by.id('focus-core-change-book'))).toBeVisible().withTimeout(15000);
    await expect(element(by.id('due-action-start'))).not.toBeVisible();
  });

  // TC-DUE-08 (retry_timer_fired 後の再 due を seed で代替):
  // retry_count=1 の due では SC-23 を再表示できる。
  it('opens due sheet when retry-fired-once state is injected', async () => {
    await launchAppUnsynced({
      newInstance: true,
      delete: true,
      launchArgs: { e2e_state: 'retry_fired_once' },
    });

    await waitFor(element(by.id('due-action-start'))).toBeVisible().withTimeout(20000);
    await expect(element(by.id('due-action-start'))).toBeVisible();
  });
});
