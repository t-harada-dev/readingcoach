const { device, expect, element, by, waitFor } = require('detox');

describe('Smoke', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await device.disableSynchronization();
  });

  afterAll(async () => {
    await device.enableSynchronization();
  });

  it('launches app', async () => {
    await waitFor(element(by.id('focus-core-open-library')))
      .toBeVisible()
      .withTimeout(10000);
  });
});
