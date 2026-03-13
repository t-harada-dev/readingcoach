const { by, element, waitFor } = require('detox');
const { createSnapshotTracker } = require('../helpers/snapshot');
const { launchAppSynced } = require('../helpers/launchApp');

const tracker = createSnapshotTracker('onboarding');

async function launchOnboarding(extra = {}) {
  await launchAppSynced({
    newInstance: true,
    delete: true,
    launchArgs: {
      e2e_onboarding: '1',
      ...extra,
    },
  });
}

describe('Flow Snapshots: Onboarding', () => {
  afterAll(() => {
    tracker.assertCoverage();
  });

  it('captures SC-01 / normal', async () => {
    await launchOnboarding({ e2e_book_search_mode: 'success' });
    await waitFor(element(by.id('onboarding-search-input'))).toBeVisible().withTimeout(15000);
    await tracker.capture('SC-01', 'normal');
  });

  it('captures SC-02 / normal', async () => {
    await launchOnboarding({ e2e_onboarding_stage: 'time' });
    await waitFor(element(by.id('onboarding-time-screen'))).toBeVisible().withTimeout(15000);
    await tracker.capture('SC-02', 'normal');
  });

  it('captures SC-03 / normal', async () => {
    await launchOnboarding({
      e2e_onboarding_stage: 'notification',
      e2e_notification_permission: 'denied',
    });
    await waitFor(element(by.id('onboarding-notification-screen'))).toBeVisible().withTimeout(15000);
    await tracker.capture('SC-03', 'normal');
  });
});
