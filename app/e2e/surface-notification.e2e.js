const { expect, element, by, waitFor, device } = require('detox');
const { launchSurface } = require('./helpers/surfaceLaunch');

describe('Surface Notification', () => {

  it('SUR-01: start from normal notification routes to SC-12', async () => {
    await launchSurface({ source: 'notification_response', action: 'start', state: 'due_normal' });

    await waitFor(element(by.id('active-session-screen'))).toExist().withTimeout(12000);
    await expect(element(by.id('active-session-mode-15'))).toExist();
  });

  it('SUR-02: start from rehab notification routes to SC-14', async () => {
    await launchSurface({ source: 'notification_response', action: 'start', state: 'due_rehab3' });

    await waitFor(element(by.id('active-session-screen'))).toExist().withTimeout(12000);
    await expect(element(by.id('active-session-mode-1'))).toExist();
  });

  it('SUR-03: start_5m from notification routes to SC-24', async () => {
    await launchSurface({ source: 'notification_response', action: 'start_5m', state: 'due_rehab3' });

    await waitFor(element(by.id('active-session-screen'))).toExist().withTimeout(20000);
    await expect(element(by.id('active-session-mode-5'))).toExist();
  });

  it('SUR-04: snooze_30m from notification does not enter active session', async () => {
    await launchSurface({ source: 'notification_response', action: 'snooze_30m', state: 'due_normal' });

    await waitFor(element(by.id('active-session-screen'))).not.toExist().withTimeout(12000);
  });
});
