const { expect, element, by, waitFor } = require('detox');
const { launchAppUnsynced } = require('./helpers/launchApp');

describe('Book Missing Fallback', () => {
  // TC-ABN-08: book 参照欠損でもクラッシュせず、主導線と代替導線を維持
  it('ABN-08: keeps app operable when plan book reference is missing', async () => {
    await launchAppUnsynced({
      newInstance: true,
      delete: true,
      launchArgs: { e2e_state: 'book_missing' },
    });

    await waitFor(element(by.id('focus-core-no-book-warning'))).toBeVisible().withTimeout(20000);
    await waitFor(element(by.id('focus-core-resolve-book'))).toBeVisible().withTimeout(15000);

    await element(by.id('focus-core-resolve-book')).tap();
    await waitFor(element(by.id('library-add-book'))).toExist().withTimeout(10000);
  });
});
