const { element, by, waitFor } = require('detox');
const { launchAppSynced } = require('./helpers/launchApp');

async function launchOnboarding(extra = {}) {
  await launchAppSynced({
    newInstance: true,
    delete: true,
    launchArgs: {
      e2e_onboarding: '1',
      ...extra,
    },
  });
}

async function goToOnboardingManualAndComplete() {
  await waitFor(element(by.id('onboarding-add-book-landing'))).toExist().withTimeout(15000);
  await element(by.id('onboarding-add-book-cta-manual')).tap();
  await waitFor(element(by.id('onboarding-manual-title-input'))).toExist().withTimeout(10000);
  await element(by.id('onboarding-manual-title-input')).typeText('DetoxBook');
  await element(by.id('onboarding-manual-title-input')).tapReturnKey();
  await tapOnboardingManualSave();
  await waitFor(element(by.id('onboarding-time-save'))).toExist().withTimeout(10000);
}

async function waitForOnboardingNotificationAction() {
  await waitFor(element(by.id('onboarding-notification-screen'))).toExist().withTimeout(10000);
  try {
    await waitFor(element(by.id('onboarding-notification-enable'))).toExist().withTimeout(4000);
    return 'enable';
  } catch {
    await waitFor(element(by.id('onboarding-notification-home'))).toExist().withTimeout(10000);
    return 'home';
  }
}

async function enableNotificationThenGoHome() {
  await waitFor(element(by.id('onboarding-notification-enable'))).toExist().withTimeout(10000);
  await element(by.id('onboarding-notification-enable')).tap();
  await waitFor(element(by.id('onboarding-notification-home'))).toExist().withTimeout(10000);
  await element(by.id('onboarding-notification-home')).tap();
}

async function waitForReadyHome() {
  await waitFor(element(by.id('focus-core-screen'))).toExist().withTimeout(10000);
}

async function tapOnboardingManualSave() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await waitFor(element(by.id('onboarding-manual-save'))).toBeVisible().withTimeout(1200);
      await element(by.id('onboarding-manual-save')).tap();
      return;
    } catch {
      try {
        await element(by.id('onboarding-manual-screen')).scroll(160, 'down');
      } catch {
        // no-op
      }
    }
  }
  await element(by.id('onboarding-manual-save')).tap();
}

describe('Onboarding Flow', () => {
  // Full onboarding flow via e2e_onboarding: AddBook → Time → Notification → Home (all three screens operated once)
  it('operates OnboardingAddBook, OnboardingTime, OnboardingNotification via e2e_onboarding', async () => {
    await launchOnboarding();
    await goToOnboardingManualAndComplete();
    await waitFor(element(by.id('onboarding-time-save'))).toBeVisible().withTimeout(5000);
    await element(by.id('onboarding-time-save')).tap();
    await waitFor(element(by.id('onboarding-notification-screen'))).toExist().withTimeout(10000);
    await waitFor(element(by.id('onboarding-notification-later'))).toBeVisible().withTimeout(5000);
    await element(by.id('onboarding-notification-later')).tap();
    await waitForReadyHome();
  });

  // TC-ONB-01
  it('ONB-01: manual entry moves to time screen', async () => {
    await launchOnboarding();
    await goToOnboardingManualAndComplete();
  });

  // TC-ONB-02
  it('ONB-02: manual entry continues to time screen', async () => {
    await launchOnboarding();
    await waitFor(element(by.id('onboarding-add-book-landing'))).toExist().withTimeout(15000);
    await element(by.id('onboarding-add-book-cta-manual')).tap();
    await waitFor(element(by.id('onboarding-manual-screen'))).toExist().withTimeout(10000);
    await element(by.id('onboarding-manual-title-input')).typeText('Manual Onboarding');
    await element(by.id('onboarding-manual-title-input')).tapReturnKey();
    await waitFor(element(by.id('onboarding-manual-save'))).toExist().withTimeout(10000);
    await tapOnboardingManualSave();
    await waitFor(element(by.id('onboarding-time-save'))).toExist().withTimeout(10000);
  });

  // TC-ONB-03
  it('ONB-03: manual entry from landing continues to time screen', async () => {
    await launchOnboarding();
    await waitFor(element(by.id('onboarding-add-book-landing'))).toExist().withTimeout(15000);
    await element(by.id('onboarding-add-book-cta-manual')).tap();
    await waitFor(element(by.id('onboarding-manual-screen'))).toExist().withTimeout(10000);
    await element(by.id('onboarding-manual-title-input')).typeText('Offline Manual');
    await element(by.id('onboarding-manual-title-input')).tapReturnKey();
    await waitFor(element(by.id('onboarding-manual-save'))).toExist().withTimeout(10000);
    await tapOnboardingManualSave();
    await waitFor(element(by.id('onboarding-time-save'))).toExist().withTimeout(10000);
  });

  // TC-ONB-04
  it('ONB-04: time save moves to notification screen', async () => {
    await launchOnboarding({ e2e_onboarding_stage: 'time' });
    await waitFor(element(by.id('onboarding-time-save'))).toExist().withTimeout(15000);
    await element(by.id('onboarding-time-save')).tap();
    await waitForOnboardingNotificationAction();
  });

  // TC-ONB-05
  it('ONB-05: notification enable reaches ready home', async () => {
    await launchOnboarding({
      e2e_onboarding_stage: 'notification',
      e2e_notification_permission: 'allowed',
    });
    await enableNotificationThenGoHome();
    await waitForReadyHome();
  });

  // TC-ONB-06
  it('ONB-06: notification later still reaches ready home', async () => {
    await launchOnboarding({
      e2e_onboarding_stage: 'notification',
      e2e_notification_permission: 'denied',
    });
    await waitFor(element(by.id('onboarding-notification-later'))).toExist().withTimeout(15000);
    await element(by.id('onboarding-notification-later')).tap();
    await waitForReadyHome();
  });
});
