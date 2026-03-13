const { by, element, waitFor } = require('detox');
const { createSnapshotTracker } = require('../helpers/snapshot');
const { launchAppUnsynced } = require('../helpers/launchApp');

const tracker = createSnapshotTracker('home');

async function launchHome(launchArgs = {}) {
  await launchAppUnsynced({
    newInstance: true,
    delete: true,
    launchArgs,
  });
}

describe('Flow Snapshots: Home', () => {
  afterAll(() => {
    tracker.assertCoverage();
  });

  it('captures SC-04 / normal', async () => {
    await launchHome();

    await waitFor(element(by.id('focus-core-primary-cta'))).toBeVisible().withTimeout(15000);
    await tracker.capture('SC-04', 'normal');
  });

  it('captures SC-05 / heavy_day (injected)', async () => {
    await launchHome({ e2e_state: 'heavy_day' });

    await waitFor(element(by.id('focus-core-resolve-book'))).toBeVisible().withTimeout(15000);
    await tracker.capture('SC-05', 'heavy_day');
  });

  it('captures SC-06 / rehab (injected)', async () => {
    await launchHome({ e2e_state: 'rehab3' });

    await waitFor(element(by.id('focus-core-primary-cta'))).toBeVisible().withTimeout(15000);
    await tracker.capture('SC-06', 'rehab');
  });

  it('captures SC-07 / long_absence (injected)', async () => {
    await launchHome({ e2e_state: 'rehab7' });

    await waitFor(element(by.id('restart-recovery-screen'))).toBeVisible().withTimeout(15000);
    await tracker.capture('SC-07', 'long_absence');
  });

  it('captures SC-23 / due (injected)', async () => {
    await launchHome({ e2e_state: 'due_normal' });

    await waitFor(element(by.id('due-action-start'))).toBeVisible().withTimeout(30000);
    await tracker.capture('SC-23', 'due');
  });
});
