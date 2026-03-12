const { expect, element, by, waitFor } = require('detox');
const { launchRehabFast, startSessionFromHome, reachCompletion } = require('./helpers/completionFlow');

describe('Session Completion Consistency', () => {
  // TC-SESSION-01
  it('SESSION-01: completion elapsed time matches actual session duration', async () => {
    await launchRehabFast({ state: 'normal', sessionSeconds: '2' });

    await startSessionFromHome();

    await reachCompletion({ dismissProgressPrompt: true, sessionStarted: true });

    await waitFor(element(by.id('completion-duration'))).toBeVisible().withTimeout(10000);
    await expect(element(by.id('completion-duration'))).toHaveText('読書した時間: 00:02');
  });

  // TC-SESSION-02
  it('SESSION-02: completion book title matches the book read in session', async () => {
    await launchRehabFast({ state: 'normal', sessionSeconds: '2' });

    await startSessionFromHome();
    const activeSessionBook = await element(by.id('active-session-book-title')).getAttributes();
    const activeBookTitle = String(activeSessionBook.text ?? '').trim();
    if (activeBookTitle.length === 0) {
      throw new Error('active-session-book-title should not be empty');
    }

    await reachCompletion({ dismissProgressPrompt: true, sessionStarted: true });

    await waitFor(element(by.id('completion-book-title'))).toBeVisible().withTimeout(10000);
    await expect(element(by.id('completion-book-title'))).toHaveText(`読書した本: ${activeBookTitle}`);
  });
});
