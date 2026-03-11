const { expect, element, by, waitFor } = require('detox');
const { launchSurface } = require('./helpers/surfaceLaunch');

async function waitForRetryLane(timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await expect(element(by.id('focus-core-primary-cta'))).toExist();
      return;
    } catch {
      // no-op
    }
    try {
      await expect(element(by.id('due-action-start'))).toExist();
      return;
    } catch {
      // no-op
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('Timed out waiting for retry lane on FocusCore or DueActionSheet');
}

describe('Widget Fallback', () => {
  // TC-ABN-05: stale widget payload を正本扱いせず reconcile 後の当日導線で開始
  it('ABN-05: stale widget start still routes by reconciled today state', async () => {
    await launchSurface({
      source: 'widget_render',
      action: 'start',
      state: 'due_normal',
      extraLaunchArgs: { e2e_widget_snapshot: 'stale_payload' },
    });

    await waitFor(element(by.id('active-session-screen'))).toExist().withTimeout(12000);
    await expect(element(by.id('active-session-mode-15'))).toExist();
  });

  // TC-ABN-06: widget 開始失敗でも app 内主導線へ復帰し再試行可能
  it('ABN-06: widget start failure falls back to in-app retry lane', async () => {
    await launchSurface({
      source: 'widget_render',
      action: 'start',
      state: 'due_normal',
      extraLaunchArgs: { e2e_fail_start_once: '1' },
    });

    await waitForRetryLane(25000);
  });
});
