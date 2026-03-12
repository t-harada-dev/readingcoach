const { device } = require('detox');

const UNSYNC_ARG_KEY = 'detoxEnableSynchronization';
const UNSYNC_ARG_VALUE = '0';

function withUnsyncedLaunchArgs(launchArgs = {}) {
  return {
    ...launchArgs,
    [UNSYNC_ARG_KEY]: UNSYNC_ARG_VALUE,
  };
}

async function launchAppUnsynced(options = {}) {
  await device.launchApp({
    ...options,
    launchArgs: withUnsyncedLaunchArgs(options.launchArgs),
  });
}

async function launchAppSynced(options = {}) {
  await device.launchApp(options);
}

module.exports = {
  launchAppSynced,
  launchAppUnsynced,
  withUnsyncedLaunchArgs,
};
