const { element, by, waitFor } = require('detox');
const { sleep, launchRehabFast, reachCompletion } = require('./helpers/completionFlow');

describe('Progress Opt-in Flow', () => {
  // TC-CMP-04: 初回完了かつ未設定時に SC-16 が表示される
  it('shows progress opt-in prompt on first completion', async () => {
    await launchRehabFast();
    await reachCompletion();

    await waitFor(element(by.id('progress-prompt-screen'))).toBeVisible().withTimeout(10000);
  });

  // TC-CMP-05: SC-16 -> 設定する -> SC-17
  it('navigates from prompt to setup', async () => {
    await launchRehabFast();
    await reachCompletion();

    await waitFor(element(by.id('progress-prompt-enable'))).toBeVisible().withTimeout(10000);
    await element(by.id('progress-prompt-enable')).tap();
    await waitFor(element(by.id('progress-setup-save'))).toBeVisible().withTimeout(10000);
  });

  // TC-CMP-06: SC-16 -> あとで -> SC-15に戻る
  it('allows skipping progress opt-in', async () => {
    await launchRehabFast();
    await reachCompletion();

    await waitFor(element(by.id('progress-prompt-later'))).toBeVisible().withTimeout(10000);
    await element(by.id('progress-prompt-later')).tap();
    await waitFor(element(by.id('completion-message'))).toBeVisible().withTimeout(10000);
  });

  // TC-CMP-07: SC-17 入力保存
  it('accepts progress setup save action', async () => {
    await launchRehabFast();
    await reachCompletion();

    await waitFor(element(by.id('progress-prompt-enable'))).toBeVisible().withTimeout(10000);
    await element(by.id('progress-prompt-enable')).tap();
    await waitFor(element(by.id('progress-setup-save'))).toBeVisible().withTimeout(10000);

    const saveButton = element(by.id('progress-setup-save'));
    await waitFor(saveButton).toExist().withTimeout(10000);
    await saveButton.tap();
    await sleep(500);
  });
});
