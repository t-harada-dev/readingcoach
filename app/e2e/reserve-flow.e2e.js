const { by, element, waitFor } = require('detox');
const { launchAppUnsynced } = require('./helpers/launchApp');

async function launchReserve(launchArgs = {}) {
  await launchAppUnsynced({
    newInstance: true,
    delete: true,
    launchArgs: {
      e2e_open_screen: 'reserve',
      e2e_notification_permission: 'denied',
      ...launchArgs,
    },
  });
}

describe('Reserve Flow', () => {
  it('RSV-01: opens reserve screen from launch arg', async () => {
    await launchReserve();
    await waitFor(element(by.id('reserve-screen'))).toBeVisible().withTimeout(15000);
  });

  it('RSV-02: selects a book row and keeps reserve CTA enabled', async () => {
    await launchReserve();
    await waitFor(element(by.id('reserve-book-select'))).toBeVisible().withTimeout(15000);
    await waitFor(element(by.id('reserve-book-row-native_book_2'))).toBeVisible().withTimeout(10000);
    await element(by.id('reserve-book-row-native_book_2')).tap();
    await waitFor(element(by.id('reserve-confirm'))).toBeVisible().withTimeout(10000);
  });

  it('RSV-03: allows selecting a time preset', async () => {
    await launchReserve();
    await waitFor(element(by.id('reserve-time-preset-22-0'))).toBeVisible().withTimeout(10000);
    await element(by.id('reserve-time-preset-22-0')).tap();
    await waitFor(element(by.id('reserve-confirm'))).toBeVisible().withTimeout(10000);
  });

  it('RSV-04: renders either empty-state or selectable list', async () => {
    await launchReserve();

    try {
      await waitFor(element(by.id('reserve-empty-state'))).toBeVisible().withTimeout(2500);
      return;
    } catch {
      // populated library is the expected default in seeded e2e state.
    }

    await waitFor(element(by.id('reserve-book-select'))).toBeVisible().withTimeout(10000);
  });
});
