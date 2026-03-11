const { device, expect, element, by, waitFor } = require('detox');

describe('Home Navigation', () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
    await device.disableSynchronization();
  });

  afterEach(async () => {
    await device.enableSynchronization();
  });

  // TC-HOME-04: SC-04 -> SC-20 (ライブラリ導線)
  it('opens Library from FocusCore', async () => {
    await waitFor(element(by.id('focus-core-open-library')))
      .toBeVisible()
      .withTimeout(10000);

    await element(by.id('focus-core-open-library')).tap();

    await waitFor(element(by.id('library-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });
});
