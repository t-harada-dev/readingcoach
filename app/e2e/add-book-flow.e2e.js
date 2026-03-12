const { element, by, waitFor } = require('detox');
const { launchAppUnsynced } = require('./helpers/launchApp');

async function launchToLibrary(extra = {}) {
  await launchAppUnsynced({
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
      await waitFor(element(by.id('add-book-search-input'))).toExist().withTimeout(2000);
      return;
    } catch {
      // Retry a few times because simulator taps can be flaky under unsynced mode.
    }
  }
  await waitFor(element(by.id('add-book-search-input'))).toExist().withTimeout(10000);
}

async function submitSearch() {
  await element(by.id('add-book-search-input')).tapReturnKey();
}

async function saveCandidate() {
  for (let i = 0; i < 3; i += 1) {
    try {
      await element(by.id('add-book-candidate-save')).tap();
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
  await element(by.id('add-book-candidate-save')).tap();
}

describe('Add Book Flow', () => {
  // TC-BOOK-05
  it('BOOK-05: opens add-book search from library', async () => {
    await launchToLibrary();
    await openAddBookFromLibrary();
  });

  // TC-BOOK-01
  it('BOOK-01: search candidate save returns to library', async () => {
    await launchToLibrary({ e2e_book_search_mode: 'success' });
    await openAddBookFromLibrary();
    await element(by.id('add-book-search-input')).typeText('CandidateBook');
    await submitSearch();
    await waitFor(element(by.id('add-book-candidate-screen'))).toExist().withTimeout(10000);
    await saveCandidate();
    await waitFor(element(by.id('library-add-book'))).toExist().withTimeout(10000);
  });

  // TC-BOOK-02
  it('BOOK-02: timeout fallback goes to manual entry', async () => {
    await launchToLibrary({ e2e_book_search_mode: 'timeout' });
    await openAddBookFromLibrary();
    await element(by.id('add-book-search-input')).typeText('TimeoutBook');
    await submitSearch();
    await waitFor(element(by.id('add-book-manual-screen'))).toExist().withTimeout(10000);
  });

  // TC-BOOK-03
  it('BOOK-03: 429 fallback goes to manual entry', async () => {
    await launchToLibrary({ e2e_book_search_mode: '429' });
    await openAddBookFromLibrary();
    await element(by.id('add-book-search-input')).typeText('RetryBook');
    await submitSearch();
    await waitFor(element(by.id('add-book-manual-screen'))).toExist().withTimeout(10000);
  });

  // TC-BOOK-04
  it('BOOK-04: placeholder candidate can be saved', async () => {
    await launchToLibrary({
      e2e_book_search_mode: 'success',
      e2e_book_candidate_placeholder: '1',
    });
    await openAddBookFromLibrary();
    await element(by.id('add-book-search-input')).typeText('NoCover');
    await submitSearch();
    await waitFor(element(by.id('add-book-candidate-screen'))).toExist().withTimeout(10000);
    await saveCandidate();
    await waitFor(element(by.id('library-add-book'))).toExist().withTimeout(10000);
  });
});
