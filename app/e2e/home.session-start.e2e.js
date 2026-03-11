const { device, expect, element, by, waitFor } = require('detox');

describe('Home Session Start', () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
    await device.disableSynchronization();
  });

  afterEach(async () => {
    await device.enableSynchronization();
  });

  // TC-HOME-01: SC-04 主CTA(15分) -> SC-12
  it('starts 15m session from primary CTA', async () => {
    await waitFor(element(by.id('focus-core-primary-cta')))
      .toBeVisible()
      .withTimeout(10000);

    await element(by.id('focus-core-primary-cta')).tap();

    await waitFor(element(by.id('active-session-screen')))
      .toBeVisible()
      .withTimeout(10000);
    await expect(element(by.id('active-session-mode-15'))).toBeVisible();
  });

  // TC-HOME-02: SC-04 副CTA(5分) -> SC-24
  it('starts 5m session from secondary CTA', async () => {
    await waitFor(element(by.id('focus-core-secondary-cta')))
      .toBeVisible()
      .withTimeout(10000);

    await element(by.id('focus-core-secondary-cta')).tap();

    await waitFor(element(by.id('active-session-screen')))
      .toBeVisible()
      .withTimeout(10000);
    await expect(element(by.id('active-session-mode-5'))).toBeVisible();
  });
});
