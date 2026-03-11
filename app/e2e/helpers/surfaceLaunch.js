const { device } = require('detox');

async function launchSurface({ source, action, state, extraLaunchArgs }) {
  await device.launchApp({
    newInstance: true,
    delete: true,
    launchArgs: {
      ...(state ? { e2e_state: state } : {}),
      ...(extraLaunchArgs ?? {}),
      e2e_surface_source: source,
      e2e_surface_action: action,
    },
  });
  await device.disableSynchronization();
}

module.exports = {
  launchSurface,
};
