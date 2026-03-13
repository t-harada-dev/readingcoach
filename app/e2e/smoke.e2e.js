const { element, by, waitFor } = require('detox');
const { launchAppUnsynced } = require('./helpers/launchApp');

describe('Smoke', () => {
  beforeAll(async () => {
    await launchAppUnsynced({ newInstance: true });
  });

  it('launches app', async () => {
    await waitFor(element(by.id('focus-core-change-book')))
      .toBeVisible()
      .withTimeout(10000);
  });
});
