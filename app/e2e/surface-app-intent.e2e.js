const { expect, element, by, waitFor, device } = require('detox');
const { launchSurface } = require('./helpers/surfaceLaunch');

describe('Surface App Intent', () => {

  it('SUR-08: start from app intent routes to first lane by state', async () => {
    await launchSurface({ source: 'app_intent', action: 'start', state: 'due_rehab3' });

    await waitFor(element(by.id('active-session-screen'))).toExist().withTimeout(12000);
    await expect(element(by.id('active-session-mode-1'))).toExist();
  });

  it('SUR-09: start_5m from app intent routes to SC-24', async () => {
    await launchSurface({ source: 'app_intent', action: 'start_5m', state: 'due_rehab3' });

    await waitFor(element(by.id('active-session-screen'))).toExist().withTimeout(20000);
    await expect(element(by.id('active-session-mode-5'))).toExist();
  });

  it('SUR-10: show_today_book returns canonical latest title on FocusCore', async () => {
    await launchSurface({ source: 'app_intent', action: 'show_today_book' });

    await waitFor(element(by.id('focus-core-book-title'))).toExist().withTimeout(12000);
  });
});
