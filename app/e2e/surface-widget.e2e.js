const { expect, element, by, waitFor, device } = require('detox');
const { launchSurface } = require('./helpers/surfaceLaunch');

describe('Surface Widget', () => {

  it('SUR-05: start from normal widget routes to SC-12', async () => {
    await launchSurface({ source: 'widget_render', action: 'start', state: 'due_normal' });

    await waitFor(element(by.id('active-session-screen'))).toExist().withTimeout(12000);
    await expect(element(by.id('active-session-mode-15'))).toExist();
  });

  it('SUR-06: start from rehab widget routes to SC-14', async () => {
    await launchSurface({ source: 'widget_render', action: 'start', state: 'due_rehab3' });

    await waitFor(element(by.id('active-session-screen'))).toExist().withTimeout(12000);
    await expect(element(by.id('active-session-mode-1'))).toExist();
  });

  it('SUR-07: start_5m from widget routes to SC-24', async () => {
    await launchSurface({ source: 'widget_render', action: 'start_5m', state: 'due_rehab3' });

    await waitFor(element(by.id('active-session-screen'))).toExist().withTimeout(20000);
    await expect(element(by.id('active-session-mode-5'))).toExist();
  });
});
