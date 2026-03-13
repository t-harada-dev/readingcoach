const { by, element, waitFor } = require('detox');
const { createSnapshotTracker } = require('../helpers/snapshot');
const { launchAppSynced } = require('../helpers/launchApp');
const { reachCompletion, ensureCompletionActionVisible } = require('../helpers/completionFlow');

const tracker = createSnapshotTracker('completion');

async function launchCompletionSnapshot({ state = 'normal', sessionSeconds = '2' } = {}) {
  await launchAppSynced({
    newInstance: true,
    delete: true,
    launchArgs: { e2e_state: state, e2e_session_seconds: sessionSeconds },
  });
}

async function openProgressSetupFromPrompt() {
  await waitFor(element(by.id('progress-prompt-enable'))).toBeVisible().withTimeout(10000);

  for (let i = 0; i < 3; i += 1) {
    await element(by.id('progress-prompt-enable')).tap();
    try {
      await waitFor(element(by.id('progress-setup-save'))).toBeVisible().withTimeout(3500);
      return;
    } catch {
      // Retry in case the first tap is dropped under unsynced launch.
    }
  }

  await waitFor(element(by.id('progress-setup-save'))).toBeVisible().withTimeout(10000);
}

describe('Flow Snapshots: Completion', () => {
  afterAll(() => {
    tracker.assertCoverage();
  });

  it('captures SC-15 / normal', async () => {
    await launchCompletionSnapshot();
    await reachCompletion({ dismissProgressPrompt: true });
    await ensureCompletionActionVisible('completion-close');
    await waitFor(element(by.id('completion-message'))).toBeVisible().withTimeout(10000);
    await tracker.capture('SC-15', 'normal');
  });

  it('captures SC-16 / normal', async () => {
    await launchCompletionSnapshot();
    await reachCompletion({ dismissProgressPrompt: false });
    await waitFor(element(by.id('progress-prompt-screen'))).toBeVisible().withTimeout(10000);
    await tracker.capture('SC-16', 'normal');
  });

  it('captures SC-17 / normal', async () => {
    await launchCompletionSnapshot();
    await reachCompletion({ dismissProgressPrompt: false });
    await openProgressSetupFromPrompt();
    await tracker.capture('SC-17', 'normal');
  });

  it('captures SC-18 / normal', async () => {
    await launchCompletionSnapshot();
    await reachCompletion({ dismissProgressPrompt: true });
    await ensureCompletionActionVisible('completion-extra-5m');
    await waitFor(element(by.id('completion-message'))).toBeVisible().withTimeout(10000);
    await tracker.capture('SC-18', 'normal');
  });

  it('captures SC-19 / finished_book', async () => {
    await launchCompletionSnapshot();
    await reachCompletion({ dismissProgressPrompt: true });
    await ensureCompletionActionVisible('completion-finished-book');
    await element(by.id('completion-finished-book')).tap();
    await waitFor(element(by.id('next-focus-selection-ready'))).toExist().withTimeout(10000);
    await tracker.capture('SC-19', 'finished_book');
  });
});
