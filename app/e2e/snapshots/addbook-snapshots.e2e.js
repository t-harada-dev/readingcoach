const { by, element, waitFor } = require('detox');
const { createSnapshotTracker } = require('../helpers/snapshot');
const { launchAppUnsynced } = require('../helpers/launchApp');

const tracker = createSnapshotTracker('addbook');

async function launchToAddBook(extra = {}) {
  await launchAppUnsynced({
    newInstance: true,
    delete: true,
    launchArgs: extra,
  });

  await waitFor(element(by.id('focus-core-change-book'))).toBeVisible().withTimeout(15000);
  await element(by.id('focus-core-change-book')).tap();
  await waitFor(element(by.id('library-add-book'))).toBeVisible().withTimeout(10000);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await element(by.id('library-add-book')).tap();
    try {
      await waitFor(element(by.id('add-book-search-input'))).toExist().withTimeout(2000);
      return;
    } catch {
      // Retry because simulator taps can be flaky under unsynced mode.
    }
  }
  await waitFor(element(by.id('add-book-search-input'))).toBeVisible().withTimeout(10000);
}

async function submitSearchUntil(targetTestId) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await waitFor(element(by.id(targetTestId))).toBeVisible().withTimeout(1000);
      return;
    } catch {
      // no-op
    }

    try {
      await waitFor(element(by.id('add-book-search-input'))).toExist().withTimeout(1000);
    } catch {
      break;
    }

    try {
      await element(by.id('add-book-search-input')).tapReturnKey();
      await waitFor(element(by.id(targetTestId))).toBeVisible().withTimeout(3000);
      return;
    } catch {
      // no-op
    }

    try {
      await element(by.id('add-book-search-submit')).tap();
      await waitFor(element(by.id(targetTestId))).toBeVisible().withTimeout(3000);
      return;
    } catch {
      // Retry because keyboard return/submit can be flaky under unsynced mode.
    }
  }

  await waitFor(element(by.id(targetTestId))).toBeVisible().withTimeout(10000);
}

describe('Flow Snapshots: Add Book', () => {
  afterAll(() => {
    tracker.assertCoverage();
  });

  it('captures SC-09 / normal', async () => {
    await launchToAddBook({ e2e_book_search_mode: 'success' });
    await tracker.capture('SC-09', 'normal');
  });

  it('captures SC-10 / timeout_or_error', async () => {
    await launchToAddBook({ e2e_book_search_mode: 'timeout' });
    await element(by.id('add-book-search-input')).typeText('TimeoutBook');
    await submitSearchUntil('add-book-manual-title-input');
    await tracker.capture('SC-10', 'timeout_or_error');
  });

  it('captures SC-11 / normal', async () => {
    await launchToAddBook({ e2e_book_search_mode: 'success' });
    await element(by.id('add-book-search-input')).typeText('CandidateBook');
    await submitSearchUntil('add-book-candidate-save');
    await tracker.capture('SC-11', 'normal');
  });
});
