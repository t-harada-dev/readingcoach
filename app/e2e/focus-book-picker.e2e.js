const { by, element, expect, waitFor } = require('detox');
const { launchAppUnsynced } = require('./helpers/launchApp');

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

async function openLibraryFromHome() {
  await waitFor(element(by.id('focus-core-scroll'))).toExist().withTimeout(15000);
  for (let i = 0; i < 5; i += 1) {
    try {
      await waitFor(element(by.id('focus-core-change-book'))).toBeVisible().withTimeout(1200);
      break;
    } catch {
      await element(by.id('focus-core-scroll')).scroll(260, 'down');
    }
  }
  await element(by.id('focus-core-change-book')).tap();
  await waitFor(element(by.id('library-add-book'))).toExist().withTimeout(10000);
}

async function openBookDetail(rowId) {
  for (let i = 0; i < 3; i += 1) {
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

async function tapFocusFromDetail() {
  for (let i = 0; i < 5; i += 1) {
    try {
      await waitFor(element(by.id('book-detail-focus'))).toBeVisible().withTimeout(1000);
      break;
    } catch {
      await element(by.id('book-detail-screen')).scroll(220, 'down');
    }
  }
  await waitFor(element(by.id('book-detail-focus'))).toBeVisible().withTimeout(10000);
  await element(by.id('book-detail-focus')).tap();
}

describe('Focus Book Picker Flow', () => {
  it('FBP-01: opens library picker from home', async () => {
    await launchToLibrary();
    await waitFor(element(by.id('library-book-row-native_book_1'))).toExist().withTimeout(10000);
  });

  it('FBP-02: selects a book from detail and returns to home', async () => {
    await launchToLibrary();
    await waitFor(element(by.id('library-book-row-native_book_2'))).toExist().withTimeout(10000);
    await openBookDetail('library-book-row-native_book_2');
    await tapFocusFromDetail();
    await waitFor(element(by.id('focus-core-screen'))).toExist().withTimeout(15000);
  });

  it('FBP-03: shows selected focus marker in library rows', async () => {
    await launchToLibrary();
    await openBookDetail('library-book-row-native_book_2');
    await tapFocusFromDetail();
    await openLibraryFromHome();
    await waitFor(element(by.id('library-book-selected-label-native_book_2'))).toBeVisible().withTimeout(10000);
    await expect(element(by.id('library-book-selected-label-native_book_2'))).toBeVisible();
  });
});
