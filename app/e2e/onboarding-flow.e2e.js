const { element, by, waitFor } = require('detox');
const { launchAppUnsynced } = require('./helpers/launchApp');

async function launchOnboarding(extra = {}) {
  await launchAppUnsynced({
    newInstance: true,
    delete: true,
    launchArgs: {
      e2e_onboarding: '1',
      ...extra,
    },
  });
}

async function completeOnboardingBookBySearch() {
  await waitFor(element(by.id('onboarding-search-input'))).toExist().withTimeout(15000);
  await element(by.id('onboarding-search-input')).typeText('DetoxBook');
  await element(by.id('onboarding-search-submit')).tap();
  await waitFor(element(by.id('add-book-candidate-screen'))).toExist().withTimeout(10000);
  await element(by.id('add-book-candidate-save')).tap();
  await waitFor(element(by.id('onboarding-time-save'))).toExist().withTimeout(10000);
}

describe('Onboarding Flow', () => {
  // TC-ONB-01
  it('ONB-01: search success and candidate save moves to time screen', async () => {
    await launchOnboarding({ e2e_book_search_mode: 'success' });
    await completeOnboardingBookBySearch();
  });

  // TC-ONB-02
  it('ONB-02: search empty falls back to manual and continues', async () => {
    await launchOnboarding({ e2e_book_search_mode: 'empty' });

    await waitFor(element(by.id('onboarding-search-input'))).toExist().withTimeout(15000);
    await element(by.id('onboarding-search-input')).typeText('NoResult');
    await element(by.id('onboarding-search-submit')).tap();
    await waitFor(element(by.id('onboarding-manual-entry'))).toExist().withTimeout(10000);
    await element(by.id('add-book-manual-title')).typeText('Manual Onboarding');
    await element(by.id('add-book-manual-save')).tap();
    await waitFor(element(by.id('onboarding-time-save'))).toExist().withTimeout(10000);
  });

  // TC-ONB-03
  it('ONB-03: offline path can continue via manual entry', async () => {
    await launchOnboarding({ e2e_book_search_mode: 'offline' });

    await waitFor(element(by.id('onboarding-search-input'))).toExist().withTimeout(15000);
    await element(by.id('onboarding-search-empty-fallback')).tap();
    await waitFor(element(by.id('onboarding-manual-entry'))).toExist().withTimeout(10000);
    await element(by.id('add-book-manual-title')).typeText('Offline Manual');
    await element(by.id('add-book-manual-save')).tap();
    await waitFor(element(by.id('onboarding-time-save'))).toExist().withTimeout(10000);
  });

  // TC-ONB-04
  it('ONB-04: time save moves to notification screen', async () => {
    await launchOnboarding({ e2e_onboarding_stage: 'time' });
    await waitFor(element(by.id('onboarding-time-save'))).toExist().withTimeout(15000);
    await element(by.id('onboarding-time-save')).tap();
    await waitFor(element(by.id('onboarding-notification-enable'))).toExist().withTimeout(10000);
  });

  // TC-ONB-05
  it('ONB-05: notification enable reaches ready home', async () => {
    await launchOnboarding({
      e2e_onboarding_stage: 'notification',
      e2e_notification_permission: 'allowed',
    });
    await waitFor(element(by.id('onboarding-notification-enable'))).toExist().withTimeout(15000);
    await element(by.id('onboarding-notification-enable')).tap();
    await waitFor(element(by.id('focus-core-change-book'))).toExist().withTimeout(10000);
  });

  // TC-ONB-06
  it('ONB-06: notification later still reaches ready home', async () => {
    await launchOnboarding({
      e2e_onboarding_stage: 'notification',
      e2e_notification_permission: 'denied',
    });
    await waitFor(element(by.id('onboarding-notification-later'))).toExist().withTimeout(15000);
    await element(by.id('onboarding-notification-later')).tap();
    await waitFor(element(by.id('focus-core-change-book'))).toExist().withTimeout(10000);
  });
});
