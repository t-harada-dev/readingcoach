const { by, element, waitFor } = require('detox');
const { createSnapshotTracker } = require('../helpers/snapshot');
const { launchRehabFast, reachCompletion, ensureCompletionActionVisible } = require('../helpers/completionFlow');
const { launchAppUnsynced } = require('../helpers/launchApp');

const tracker = createSnapshotTracker('session');

async function launchFocus(launchArgs = {}) {
  await launchAppUnsynced({
    newInstance: true,
    delete: true,
    launchArgs,
  });
}

describe('Flow Snapshots: Session', () => {
  afterAll(() => {
    tracker.assertCoverage();
  });

  it('captures SC-12 / normal', async () => {
    await launchFocus();

    await waitFor(element(by.id('focus-core-primary-cta'))).toBeVisible().withTimeout(15000);
    await element(by.id('focus-core-primary-cta')).tap();

    await waitFor(element(by.id('active-session-mode-15'))).toBeVisible().withTimeout(10000);
    await tracker.capture('SC-12', 'normal');
  });

  it('captures SC-14 / rehab', async () => {
    await launchFocus({ e2e_state: 'rehab3' });

    await waitFor(element(by.id('focus-core-primary-cta'))).toBeVisible().withTimeout(15000);
    await element(by.id('focus-core-primary-cta')).tap();

    await waitFor(element(by.id('active-session-mode-1'))).toBeVisible().withTimeout(10000);
    await tracker.capture('SC-14', 'rehab');
  });

  it('captures SC-15 / rehab completion', async () => {
    await launchRehabFast({ state: 'rehab3', sessionSeconds: '2' });
    await reachCompletion({ dismissProgressPrompt: true });
    await ensureCompletionActionVisible('completion-close');

    await waitFor(element(by.id('completion-screen'))).toBeVisible().withTimeout(10000);
    await tracker.capture('SC-15', 'rehab');
  });
});
