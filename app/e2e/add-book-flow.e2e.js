const { element, by, waitFor } = require('detox');
const { launchAppSynced } = require('./helpers/launchApp');

async function launchToLibrary(extra = {}) {
  await launchAppSynced({
    newInstance: true,
    delete: true,
    launchArgs: extra,
  });
  await waitFor(element(by.id('focus-core-change-book'))).toExist().withTimeout(15000);
  await element(by.id('focus-core-change-book')).tap();
  await waitFor(element(by.id('library-add-book'))).toExist().withTimeout(10000);
}

async function openAddBookFromLibrary() {
  for (let i = 0; i < 3; i += 1) {
    await element(by.id('library-add-book')).tap();
    try {
      await waitFor(element(by.id('add-book-manual-title-input'))).toExist().withTimeout(2000);
      return;
    } catch {
      // Retry a few times because simulator taps can be flaky under unsynced mode.
    }
  }
  await waitFor(element(by.id('add-book-manual-title-input'))).toExist().withTimeout(10000);
}

describe('Add Book Flow', () => {
  // TC-BOOK-05: open add-book (manual form) from library
  it('BOOK-05: opens add-book manual form from library', async () => {
    await launchToLibrary();
    await openAddBookFromLibrary();
  });

  // TC-BOOK-01: manual entry save returns to library
  it('BOOK-01: manual entry save returns to library', async () => {
    await launchToLibrary();
    await openAddBookFromLibrary();
    await element(by.id('add-book-manual-title-input')).typeText('E2E Manual Book');
    await element(by.id('add-book-manual-title-input')).tapReturnKey();
    await element(by.id('add-book-manual-save')).tap();
    await waitFor(element(by.id('library-add-book'))).toExist().withTimeout(10000);
  });
});
