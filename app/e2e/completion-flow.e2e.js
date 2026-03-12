const { expect, element, by, waitFor } = require('detox');
const {
  launchRehabFast,
  reachCompletion,
  ensureCompletionActionVisible,
} = require('./helpers/completionFlow');

describe('Completion Flow', () => {
  // TC-CMP-01: SC-15 -> 閉じる -> 状態依存ホーム復帰（rehab）
  it('closes completion and returns to rehab home route', async () => {
    await launchRehabFast();
    await reachCompletion();
    await ensureCompletionActionVisible('completion-close');

    await waitFor(element(by.id('completion-close'))).toBeVisible().withTimeout(10000);
    await element(by.id('completion-close')).tap();

    await waitFor(element(by.id('focus-core-change-book'))).toBeVisible().withTimeout(10000);
  });

  // TC-CMP-02: SC-15 -> もう5分 -> SC-24
  it('starts extra 5m session from completion', async () => {
    await launchRehabFast();
    await reachCompletion();
    await ensureCompletionActionVisible('completion-extra-5m');

    await waitFor(element(by.id('completion-extra-5m'))).toBeVisible().withTimeout(10000);
    await expect(element(by.id('completion-extra-5m'))).toBeVisible();
  });

  // TC-CMP-03: SC-15 -> もう15分 -> SC-12
  it('starts extra 15m session from completion', async () => {
    await launchRehabFast();
    await reachCompletion();
    await ensureCompletionActionVisible('completion-extra-15m');

    await waitFor(element(by.id('completion-extra-15m'))).toBeVisible().withTimeout(10000);
    await expect(element(by.id('completion-extra-15m'))).toBeVisible();
  });
});
