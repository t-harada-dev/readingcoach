const { launchAppUnsynced } = require('./launchApp');

async function launchSurface({ source, action, state, extraLaunchArgs }) {
  await launchAppUnsynced({
    newInstance: true,
    delete: true,
    launchArgs: {
      ...(state ? { e2e_state: state } : {}),
      ...(extraLaunchArgs ?? {}),
      e2e_surface_source: source,
      e2e_surface_action: action,
    },
  });
}

module.exports = {
  launchSurface,
};
