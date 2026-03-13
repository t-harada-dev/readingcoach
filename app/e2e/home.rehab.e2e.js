const { expect, element, by, waitFor } = require('detox');
const { launchAppUnsynced } = require('./helpers/launchApp');

describe('Home Rehab State', () => {
  beforeEach(async () => {
    await launchAppUnsynced({
      newInstance: true,
      delete: true,
      launchArgs: { e2e_state: 'rehab3' },
    });
  });

  // TC-HOME-06: SC-06 主CTA(1分) -> SC-14
  it('uses ignition 1m as primary CTA in rehab state', async () => {
    await waitFor(element(by.id('focus-core-primary-cta')))
      .toBeVisible()
      .withTimeout(10000);

    await element(by.id('focus-core-primary-cta')).tap();

    await waitFor(element(by.id('active-session-screen')))
      .toBeVisible()
      .withTimeout(10000);
    await expect(element(by.id('active-session-mode-1'))).toBeVisible();
  });

  // TC-REHAB-01: SC-06 で 3分再開が表示されない
  it('does not show rehab 3m CTA in rehab state', async () => {
    await waitFor(element(by.id('focus-core-primary-cta')))
      .toBeVisible()
      .withTimeout(15000);
    await waitFor(element(by.id('focus-core-secondary-cta')))
      .toBeVisible()
      .withTimeout(15000);
    await expect(element(by.id('focus-core-rehab-cta'))).not.toExist();
  });
});
