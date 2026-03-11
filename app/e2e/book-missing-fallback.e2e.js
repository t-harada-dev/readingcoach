const { device, expect, element, by, waitFor } = require('detox');

describe('Book Missing Fallback', () => {
  afterEach(async () => {
    await device.enableSynchronization();
  });

  // TC-ABN-08: book 参照欠損でもクラッシュせず、主導線と代替導線を維持
  it('ABN-08: keeps app operable when plan book reference is missing', async () => {
    await device.launchApp({
      newInstance: true,
      delete: true,
      launchArgs: { e2e_state: 'book_missing' },
    });
    await device.disableSynchronization();

    await waitFor(element(by.id('focus-core-primary-cta'))).toBeVisible().withTimeout(20000);
    await waitFor(element(by.id('focus-core-open-library'))).toBeVisible().withTimeout(15000);

    await element(by.id('focus-core-open-library')).tap();
    await waitFor(element(by.id('library-screen'))).toBeVisible().withTimeout(10000);
  });
});
