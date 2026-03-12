const { element, by, waitFor } = require('detox');
const {
  launchRehabFast,
  reachCompletion,
  ensureCompletionActionVisible,
} = require('./helpers/completionFlow');

describe('Finished Book Flow', () => {
  // TC-CMP-09: 読了 -> 次本指名導線（SC-19）へ遷移
  it('moves from finished-book action to next-focus nomination', async () => {
    await launchRehabFast();
    await reachCompletion();
    await ensureCompletionActionVisible('completion-finished-book');

    await waitFor(element(by.id('completion-finished-book'))).toBeVisible().withTimeout(10000);
    await element(by.id('completion-finished-book')).tap();

    await waitFor(element(by.id('next-focus-screen'))).toBeVisible().withTimeout(10000);
    await waitFor(element(by.id('next-focus-confirm'))).toBeVisible().withTimeout(10000);
  });
});
