/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/app.app',
      build: './scripts/e2e-build-ios.sh',
      launchArgs: {
        detoxE2E: '1',
      },
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 17 Pro Max',
      },
    },
    simulatorSmall: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone SE (3rd generation)',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.sim.small': {
      device: 'simulatorSmall',
      app: 'ios.debug',
    },
  },
};
