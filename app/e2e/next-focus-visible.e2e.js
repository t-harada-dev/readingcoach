const { element, by, waitFor } = require('detox');
const {
  launchRehabFast,
  reachCompletion,
  ensureCompletionActionVisible,
} = require('./helpers/completionFlow');

describe('Next Focus Visible', () => {
  // TC-CMP-10E: SC-19 確定後にホーム表示 + FocusCore 次本反映
  it('shows nominated next book on FocusCore after confirm', async () => {
    await launchRehabFast({ state: 'normal' });
    await reachCompletion({ dismissProgressPrompt: true });
    await ensureCompletionActionVisible('completion-finished-book');

    await waitFor(element(by.id('completion-finished-book'))).toBeVisible().withTimeout(10000);
    await element(by.id('completion-finished-book')).tap();

    await waitFor(element(by.id('next-focus-selection-ready'))).toExist().withTimeout(10000);
    try {
      await waitFor(element(by.id('next-focus-book-row-native_book_2-button')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('next-focus-book-row-native_book_2-button')).tap();
    } catch {
      await waitFor(element(by.id('next-focus-book-row-native_book_1-button')))
        .toBeVisible()
        .withTimeout(10000);
      await element(by.id('next-focus-book-row-native_book_1-button')).tap();
    }
    await waitFor(element(by.id('next-focus-confirm'))).toBeVisible().withTimeout(10000);
    await element(by.id('next-focus-confirm')).tap();

    await waitFor(element(by.id('focus-core-change-book'))).toBeVisible().withTimeout(30000);
    await waitFor(element(by.id('focus-core-book-title')))
      .toHaveText('再点火トレーニング (Native)')
      .withTimeout(30000);
  });
});
