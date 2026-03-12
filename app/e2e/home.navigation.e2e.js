const { expect, element, by, waitFor } = require('detox');
const { launchAppUnsynced } = require('./helpers/launchApp');

describe('Home Navigation', () => {
  beforeEach(async () => {
    await launchAppUnsynced({ newInstance: true });
  });

  // TC-HOME-04: SC-04 -> SC-20 (ライブラリ導線)
  it('opens Library from FocusCore', async () => {
    await waitFor(element(by.id('focus-core-change-book')))
      .toBeVisible()
      .withTimeout(10000);

    await element(by.id('focus-core-change-book')).tap();

    await waitFor(element(by.id('library-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });
});
