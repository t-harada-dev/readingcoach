const { element, by, waitFor } = require('detox');
const { launchAppUnsynced } = require('./helpers/launchApp');
const {
  reachCompletion,
  ensureCompletionActionVisible,
} = require('./helpers/completionFlow');

describe('Finished Book Recovery', () => {
  // TC-CMP-09F (UI): finished_book 保存1回失敗時に完了画面で再試行導線を維持
  it('keeps completion screen and allows retry after one save failure', async () => {
    await launchAppUnsynced({
      newInstance: true,
      delete: true,
      launchArgs: {
        e2e_state: 'rehab3',
        e2e_session_seconds: '2',
        e2e_fail_save_book_once: '1',
      },
    });

    await reachCompletion({ dismissProgressPrompt: true });
    await ensureCompletionActionVisible('completion-finished-book');

    await element(by.id('completion-finished-book')).tap();
    await waitFor(element(by.id('completion-screen'))).toBeVisible().withTimeout(10000);
    await waitFor(element(by.id('completion-finished-error'))).toBeVisible().withTimeout(10000);

    await element(by.id('completion-finished-book')).tap();
    await waitFor(element(by.id('next-focus-screen'))).toBeVisible().withTimeout(10000);
  });
});
