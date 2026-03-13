const { by, element, waitFor } = require('detox');
const { createSnapshotTracker } = require('../helpers/snapshot');
const { launchAppUnsynced } = require('../helpers/launchApp');

const tracker = createSnapshotTracker('settings');

describe('Flow Snapshots: Settings', () => {
  afterAll(() => {
    tracker.assertCoverage();
  });

  it('captures SC-22 / normal', async () => {
    await launchAppUnsynced({
      newInstance: true,
      delete: true,
      launchArgs: {
        e2e_open_screen: 'settings',
      },
    });

    await waitFor(element(by.id('settings-save-time'))).toBeVisible().withTimeout(15000);
    await tracker.capture('SC-22', 'normal');
  });
});
