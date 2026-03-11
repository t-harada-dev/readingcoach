const { device, expect, element, by, waitFor } = require('detox');

describe('Home Rehab State', () => {
  beforeEach(async () => {
    await device.launchApp({
      newInstance: true,
      delete: true,
      launchArgs: { e2e_state: 'rehab3' },
    });
    await device.disableSynchronization();
  });

  afterEach(async () => {
    await device.enableSynchronization();
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

  // TC-HOME-07: SC-06 3分導線 -> SC-13
  it('shows rehab 3m CTA and starts 3m session', async () => {
    await waitFor(element(by.id('focus-core-primary-cta')))
      .toBeVisible()
      .withTimeout(15000);
    await waitFor(element(by.id('focus-core-secondary-cta')))
      .toBeVisible()
      .withTimeout(15000);
    await element(by.id('focus-core-scroll')).scroll(220, 'down');
    await waitFor(element(by.id('focus-core-rehab-cta')))
      .toBeVisible()
      .withTimeout(10000);

    await element(by.id('focus-core-rehab-cta')).tap();

    await waitFor(element(by.id('active-session-screen')))
      .toBeVisible()
      .withTimeout(10000);
    await expect(element(by.id('active-session-mode-3'))).toBeVisible();
  });
});
