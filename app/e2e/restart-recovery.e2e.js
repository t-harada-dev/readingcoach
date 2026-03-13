const { by, element, waitFor } = require('detox');
const { launchAppUnsynced } = require('./helpers/launchApp');

async function launchRestartRecovery(extra = {}) {
  await launchAppUnsynced({
    newInstance: true,
    delete: true,
    launchArgs: {
      e2e_state: 'rehab7',
      ...extra,
    },
  });
}

describe('Restart Recovery Flow', () => {
  it('RR-01: shows restart recovery screen in long-absence state', async () => {
    await launchRestartRecovery();
    await waitFor(element(by.id('restart-recovery-screen'))).toBeVisible().withTimeout(15000);
  });

  it('RR-02: shows ignition 1m CTA', async () => {
    await launchRestartRecovery();
    await waitFor(element(by.id('restart-start-ignition'))).toBeVisible().withTimeout(15000);
  });

  it('RR-03: navigates to settings via change-time CTA', async () => {
    await launchRestartRecovery();
    await waitFor(element(by.id('restart-recovery-change-time'))).toBeVisible().withTimeout(10000);
    await element(by.id('restart-recovery-change-time')).tap();
    await waitFor(element(by.id('settings-screen'))).toBeVisible().withTimeout(15000);
  });

  it('RR-04: navigates to library via change-book CTA', async () => {
    await launchRestartRecovery();
    await waitFor(element(by.id('restart-change-book'))).toBeVisible().withTimeout(10000);
    await element(by.id('restart-change-book')).tap();
    await waitFor(element(by.id('library-add-book'))).toExist().withTimeout(15000);
  });
});
