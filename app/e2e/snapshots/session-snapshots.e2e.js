const { by, element, waitFor } = require('detox');
const { createSnapshotTracker } = require('../helpers/snapshot');
const { launchAppSynced, launchAppUnsynced } = require('../helpers/launchApp');

const tracker = createSnapshotTracker('session');

async function launchFocus(launchArgs = {}, options = {}) {
  const launch = options.synced ? launchAppSynced : launchAppUnsynced;
  await launch({
    newInstance: true,
    delete: true,
    launchArgs,
  });
}

describe('Flow Snapshots: Session', () => {
  afterAll(() => {
    tracker.assertCoverage();
  });

  it('captures SC-12 / normal', async () => {
    await launchFocus();

    await waitFor(element(by.id('focus-core-primary-cta'))).toBeVisible().withTimeout(15000);
    await element(by.id('focus-core-primary-cta')).tap();

    await waitFor(element(by.id('active-session-mode-15'))).toBeVisible().withTimeout(10000);
    await tracker.capture('SC-12', 'normal');
  });

  it('captures SC-13 / rehab (injected)', async () => {
    await launchFocus({
      e2e_state: 'rehab3',
      e2e_surface_source: 'app_intent',
      e2e_surface_action: 'start',
      e2e_force_start_mode: 'rehab_3m',
    });

    await waitFor(element(by.id('active-session-mode-3'))).toBeVisible().withTimeout(40000);
    await tracker.capture('SC-13', 'rehab');
  });

  it('captures SC-14 / rehab', async () => {
    await launchFocus({ e2e_state: 'rehab3' });

    await waitFor(element(by.id('focus-core-primary-cta'))).toBeVisible().withTimeout(15000);
    await element(by.id('focus-core-primary-cta')).tap();

    await waitFor(element(by.id('active-session-mode-1'))).toBeVisible().withTimeout(10000);
    await tracker.capture('SC-14', 'rehab');
  });

  it('captures SC-24 / normal', async () => {
    await launchFocus();

    await waitFor(element(by.id('focus-core-secondary-cta'))).toBeVisible().withTimeout(15000);
    await element(by.id('focus-core-secondary-cta')).tap();
    await waitFor(element(by.id('active-session-mode-5'))).toBeVisible().withTimeout(10000);
    await tracker.capture('SC-24', 'normal');
  });
});
