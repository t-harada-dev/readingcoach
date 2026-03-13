const { device } = require('detox');

const UNSYNC_ARG_KEY = 'detoxEnableSynchronization';
const UNSYNC_ARG_VALUE = '0';
const DEFAULT_PERMISSIONS = {
  notifications: 'NO',
};

function withUnsyncedLaunchArgs(launchArgs = {}) {
  return {
    ...launchArgs,
    [UNSYNC_ARG_KEY]: UNSYNC_ARG_VALUE,
  };
}

function withDefaultPermissions(permissions = {}) {
  return {
    ...DEFAULT_PERMISSIONS,
    ...permissions,
  };
}

async function launchAppUnsynced(options = {}) {
  await device.launchApp({
    ...options,
    launchArgs: withUnsyncedLaunchArgs(options.launchArgs),
    permissions: withDefaultPermissions(options.permissions),
  });
}

async function launchAppSynced(options = {}) {
  await device.launchApp({
    ...options,
    permissions: withDefaultPermissions(options.permissions),
  });
}

module.exports = {
  DEFAULT_PERMISSIONS,
  launchAppSynced,
  launchAppUnsynced,
  withDefaultPermissions,
  withUnsyncedLaunchArgs,
};
