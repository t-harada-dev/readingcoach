const { expect, element, by, waitFor } = require('detox');
const { launchAppUnsynced } = require('./helpers/launchApp');

describe('Home Navigation', () => {
  beforeEach(async () => {
    await launchAppUnsynced({ newInstance: true });
  });

  // TC-HOME-04: SC-04 -> SC-20 (ライブラリ導線)
  it('opens Library from FocusCore', async () => {
    await waitFor(element(by.id('focus-core-scroll'))).toExist().withTimeout(10000);
    for (let i = 0; i < 5; i += 1) {
      try {
        await waitFor(element(by.id('focus-core-change-book'))).toBeVisible().withTimeout(1200);
        break;
      } catch {
        await element(by.id('focus-core-scroll')).scroll(260, 'down');
      }
    }
    await waitFor(element(by.id('focus-core-change-book'))).toExist().withTimeout(10000);

    await element(by.id('focus-core-change-book')).tap();

    await waitFor(element(by.id('library-add-book')))
      .toExist()
      .withTimeout(10000);
  });
});
