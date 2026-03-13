const { by, element, waitFor } = require('detox');
const { createSnapshotTracker } = require('../helpers/snapshot');
const { launchAppUnsynced } = require('../helpers/launchApp');

const tracker = createSnapshotTracker('library');

async function launchToLibrary() {
  await launchAppUnsynced({ newInstance: true, delete: true });

  await waitFor(element(by.id('focus-core-scroll'))).toExist().withTimeout(15000);
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
  await waitFor(element(by.id('library-add-book'))).toExist().withTimeout(10000);
}

async function openBookDetail(rowId) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await element(by.id(rowId)).tap();
    try {
      await waitFor(element(by.id('book-detail-screen'))).toBeVisible().withTimeout(2000);
      return;
    } catch {
      // Retry because simulator tap can be flaky under unsynced mode.
    }
  }

  await waitFor(element(by.id('book-detail-screen'))).toBeVisible().withTimeout(10000);
}

describe('Flow Snapshots: Library', () => {
  afterAll(() => {
    tracker.assertCoverage();
  });

  it('captures SC-20 / normal', async () => {
    await launchToLibrary();
    await waitFor(element(by.id('library-add-book'))).toBeVisible().withTimeout(10000);
    await tracker.capture('SC-20', 'normal');
  });

  it('captures SC-21 / normal', async () => {
    await launchToLibrary();
    await waitFor(element(by.id('library-book-row-native_book_1'))).toExist().withTimeout(10000);
    await openBookDetail('library-book-row-native_book_1');
    await waitFor(element(by.id('book-detail-title'))).toBeVisible().withTimeout(10000);
    await tracker.capture('SC-21', 'normal');
  });
});
