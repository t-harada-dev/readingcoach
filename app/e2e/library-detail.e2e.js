const { expect, element, by, waitFor } = require('detox');
const { launchAppUnsynced } = require('./helpers/launchApp');

async function launchToLibrary() {
  await launchAppUnsynced({ newInstance: true, delete: true });
  await waitFor(element(by.id('focus-core-change-book'))).toBeVisible().withTimeout(15000);

  for (let i = 0; i < 3; i += 1) {
    await element(by.id('focus-core-change-book')).tap();
    try {
      await waitFor(element(by.id('library-screen'))).toBeVisible().withTimeout(2500);
      break;
    } catch {
      // Retry to absorb occasional unsynced tap drops on simulator.
    }
  }

  await waitFor(element(by.id('library-screen'))).toBeVisible().withTimeout(10000);
  await waitFor(element(by.id('library-add-book'))).toExist().withTimeout(10000);
}

async function openBookDetail(rowId) {
  for (let i = 0; i < 3; i += 1) {
    await element(by.id(rowId)).tap();
    try {
      await waitFor(element(by.id('book-detail-title'))).toExist().withTimeout(2000);
      return;
    } catch {
      // Retry because simulator tap can be flaky under unsynced mode.
    }
  }
  await waitFor(element(by.id('book-detail-title'))).toExist().withTimeout(10000);
}

async function focusFromDetail() {
  for (let i = 0; i < 5; i += 1) {
    try {
      await waitFor(element(by.id('book-detail-focus'))).toBeVisible().withTimeout(1200);
      break;
    } catch {
      await element(by.id('book-detail-screen')).scroll(220, 'down');
    }
  }
  await waitFor(element(by.id('book-detail-focus'))).toBeVisible().withTimeout(10000);

  for (let i = 0; i < 2; i += 1) {
    await element(by.id('book-detail-focus')).tap();
    try {
      await waitFor(element(by.id('focus-core-change-book'))).toExist().withTimeout(3000);
      return;
    } catch {
      // retry
    }
  }
  await waitFor(element(by.id('focus-core-change-book'))).toExist().withTimeout(15000);
}

async function ensureProgressEnabled() {
  try {
    await waitFor(element(by.id('book-detail-current-page'))).toExist().withTimeout(1500);
    return;
  } catch {
    // Current page input is hidden until progress gets enabled.
  }

  for (let i = 0; i < 2; i += 1) {
    await waitFor(element(by.id('book-detail-enable-progress'))).toExist().withTimeout(10000);
    await element(by.id('book-detail-progress-toggle')).tap();
    try {
      await waitFor(element(by.id('book-detail-current-page'))).toExist().withTimeout(6000);
      return;
    } catch {
      // Retry one more toggle tap.
    }
  }

  await waitFor(element(by.id('book-detail-current-page'))).toExist().withTimeout(15000);
}

describe('Library and Book Detail', () => {
  // TC-LIB-01
  it('LIB-01: shows cover image or placeholder on library rows', async () => {
    await launchToLibrary();
    await waitFor(element(by.id('library-book-row-native_book_1'))).toExist().withTimeout(10000);
    await waitFor(element(by.id('library-book-cover-fallback-native_book_1'))).toBeVisible().withTimeout(10000);
  });

  // TC-BOOK-06
  it('BOOK-06: opens book detail from library list', async () => {
    await launchToLibrary();
    await waitFor(element(by.id('library-book-row-native_book_1'))).toExist().withTimeout(10000);
    await openBookDetail('library-book-row-native_book_1');
  });

  // TC-BOOK-07
  it('BOOK-07: sets focus book and returns home', async () => {
    await launchToLibrary();
    await openBookDetail('library-book-row-native_book_2');
    await waitFor(element(by.id('book-detail-focus'))).toExist().withTimeout(10000);
    await focusFromDetail();
  });

  // TC-BOOK-08
  it('BOOK-08: updates current page and keeps value on detail', async () => {
    await launchToLibrary();
    await openBookDetail('library-book-row-native_book_1');
    await ensureProgressEnabled();
    await element(by.id('book-detail-current-page')).clearText();
    await element(by.id('book-detail-current-page')).typeText('45');
    await element(by.id('book-detail-current-page')).tapReturnKey();
    await element(by.id('book-detail-save')).tap();
    await expect(element(by.id('book-detail-current-page'))).toHaveText('45');
  });

  // TC-BOOK-09
  it('BOOK-09: updates title/author/pageCount and reflects on detail', async () => {
    await launchToLibrary();
    await openBookDetail('library-book-row-native_book_1');
    await waitFor(element(by.id('book-detail-title'))).toExist().withTimeout(10000);
    await element(by.id('book-detail-title')).clearText();
    await element(by.id('book-detail-title')).typeText('UpdatedTitle');
    await element(by.id('book-detail-author')).clearText();
    await element(by.id('book-detail-author')).typeText('UpdatedAuthor');
    await element(by.id('book-detail-page-count')).clearText();
    await element(by.id('book-detail-page-count')).typeText('333');
    await element(by.id('book-detail-page-count')).tapReturnKey();
    await element(by.id('book-detail-save')).tap();
    await expect(element(by.id('book-detail-title'))).toHaveText('UpdatedTitle');
    await expect(element(by.id('book-detail-page-count'))).toHaveText('333');
  });
});
