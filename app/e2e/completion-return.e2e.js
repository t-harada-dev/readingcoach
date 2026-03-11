const { device, expect, element, by, waitFor } = require('detox');

async function launchToCompletion(launchArgs = {}) {
  await device.launchApp({
    newInstance: true,
    delete: true,
    launchArgs: { e2e_session_seconds: '2', ...launchArgs },
  });
  await device.disableSynchronization();

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
  await waitFor(element(by.id('active-session-screen'))).toBeVisible().withTimeout(10000);

  const deadline = Date.now() + 130000;
  while (Date.now() < deadline) {
    try {
      await expect(element(by.id('completion-screen'))).toBeVisible();
      return;
    } catch {
      // no-op
    }
    try {
      await expect(element(by.id('progress-prompt-screen'))).toBeVisible();
      await element(by.id('progress-prompt-later')).tap();
      await waitFor(element(by.id('completion-screen'))).toBeVisible().withTimeout(10000);
      return;
    } catch {
      // no-op
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error('Timed out waiting for completion-screen');
}

describe('Completion Return Routes', () => {
  afterEach(async () => {
    await device.enableSynchronization();
  });

  // TC-CMP-01N: normal completion close returns to SC-04(FocusCore)
  it('returns to normal home route on close', async () => {
    await launchToCompletion();

    await waitFor(element(by.id('completion-close'))).toBeVisible().withTimeout(10000);
    await element(by.id('completion-close')).tap();

    await waitFor(element(by.id('focus-core-open-library'))).toBeVisible().withTimeout(15000);
  });

  // TC-CMP-01R: restart completion close returns to SC-07(RestartRecovery)
  it('returns to restart route on close when restart state is active', async () => {
    await launchToCompletion({ e2e_state: 'rehab7' });

    await waitFor(element(by.id('completion-close'))).toBeVisible().withTimeout(10000);
    await element(by.id('completion-close')).tap();

    await waitFor(element(by.id('restart-recovery-screen'))).toBeVisible().withTimeout(10000);
  });
});
