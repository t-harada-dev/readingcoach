const { expect, element, by, waitFor } = require('detox');
const { launchAppSynced } = require('./helpers/launchApp');
const {
  reachCompletion,
  ensureCompletionActionVisible,
} = require('./helpers/completionFlow');

async function launchToCompletion(launchArgs = {}) {
  await launchAppSynced({
    newInstance: true,
    delete: true,
    launchArgs: { e2e_session_seconds: '2', ...launchArgs },
  });

  const startDeadline = Date.now() + 20000;
  let started = false;
  while (Date.now() < startDeadline && !started) {
    try {
      await expect(element(by.id('due-action-start'))).toBeVisible();
      await element(by.id('due-action-start')).tap();
      started = true;
      break;
    } catch {
      // no-op
    }
    try {
      await expect(element(by.id('focus-core-primary-cta'))).toBeVisible();
      await element(by.id('focus-core-primary-cta')).tap();
      started = true;
      break;
    } catch {
      // no-op
    }
    try {
      await expect(element(by.id('restart-start-ignition'))).toBeVisible();
      await element(by.id('restart-start-ignition')).tap();
      started = true;
      break;
    } catch {
      // no-op
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  if (!started) {
    throw new Error('Timed out waiting for start CTA');
  }
  await waitFor(element(by.id('active-session-screen'))).toExist().withTimeout(15000);
  await reachCompletion({ dismissProgressPrompt: true, sessionStarted: true });
}

describe('Completion Return Routes', () => {
  // TC-CMP-01N: normal completion close returns to SC-04(FocusCore)
  it('returns to normal home route on close', async () => {
    await launchToCompletion();
    await ensureCompletionActionVisible('completion-close');

    await waitFor(element(by.id('completion-close'))).toBeVisible().withTimeout(10000);
    await element(by.id('completion-close')).tap();

    await waitFor(element(by.id('focus-core-change-book'))).toExist().withTimeout(15000);
  });

  // TC-CMP-01R: restart completion close returns to SC-07(RestartRecovery)
  it('returns to restart route on close when restart state is active', async () => {
    await launchToCompletion({ e2e_state: 'rehab7' });
    await ensureCompletionActionVisible('completion-close');

    await waitFor(element(by.id('completion-close'))).toBeVisible().withTimeout(10000);
    await element(by.id('completion-close')).tap();

    await waitFor(element(by.id('restart-recovery-screen'))).toBeVisible().withTimeout(10000);
  });
});
