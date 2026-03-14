import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const buttonCalls: Array<{ testID?: string; onPress?: () => void | Promise<void> }> = [];
const getLaunchArgMock = vi.hoisted(() => vi.fn(async () => null));
const getSettingsMock = vi.hoisted(() => vi.fn(async () => ({ notificationsEnabled: false })));
const requestPermissionMock = vi.hoisted(() => vi.fn(async () => true));
const saveSettingsMock = vi.hoisted(() => vi.fn(async () => ({})));
const cancelScheduledMock = vi.hoisted(() => vi.fn(async () => {}));

vi.mock('react-native', () => ({
  StyleSheet: { create: (styles: unknown) => styles },
  Text: ({ children }: { children: React.ReactNode }) => React.createElement('span', null, children),
  TouchableOpacity: (props: {
    children?: React.ReactNode;
    onPress?: () => void | Promise<void>;
    testID?: string;
  }) => {
    buttonCalls.push({ testID: props.testID, onPress: props.onPress });
    return React.createElement('button', { 'data-testid': props.testID }, props.children);
  },
  View: ({ children, testID }: { children?: React.ReactNode; testID?: string }) =>
    React.createElement('div', { 'data-testid': testID }, children),
}));

vi.mock('../bridge/PersistenceBridge', () => ({
  persistenceBridge: {
    getLaunchArg: getLaunchArgMock,
    getSettings: getSettingsMock,
  },
}));

vi.mock('../notifications', () => ({
  requestPermission: requestPermissionMock,
  cancelScheduled: cancelScheduledMock,
}));

vi.mock('../useCases/SaveSettingsWithDefaults', () => ({
  saveSettingsWithDefaults: saveSettingsMock,
}));

import { OnboardingNotificationScreen } from './OnboardingNotificationScreen';

describe('OnboardingNotificationScreen', () => {
  beforeEach(() => {
    buttonCalls.length = 0;
    vi.clearAllMocks();
    getLaunchArgMock.mockResolvedValue(null);
    getSettingsMock.mockResolvedValue({ notificationsEnabled: false });
    requestPermissionMock.mockResolvedValue(true);
  });

  it('enable押下で即時遷移せず、通知設定のみ保存する', async () => {
    const reset = vi.fn();
    renderToStaticMarkup(
      React.createElement(OnboardingNotificationScreen, {
        navigation: { reset } as any,
        route: { params: {} } as any,
      })
    );

    const enable = buttonCalls.find((b) => b.testID === 'onboarding-notification-enable');
    expect(enable).toBeTruthy();
    await enable?.onPress?.();

    expect(requestPermissionMock).toHaveBeenCalledTimes(1);
    expect(saveSettingsMock).toHaveBeenCalledWith({ notificationsEnabled: true });
    expect(reset).not.toHaveBeenCalled();
  });

  it('later押下でホーム遷移する', async () => {
    const reset = vi.fn();
    renderToStaticMarkup(
      React.createElement(OnboardingNotificationScreen, {
        navigation: { reset } as any,
        route: { params: {} } as any,
      })
    );

    const later = buttonCalls.find((b) => b.testID === 'onboarding-notification-later');
    expect(later).toBeTruthy();
    await later?.onPress?.();

    expect(saveSettingsMock).toHaveBeenCalledWith({ notificationsEnabled: false });
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('enabled状態ではホームボタンからのみ遷移する', async () => {
    const reset = vi.fn();
    renderToStaticMarkup(
      React.createElement(OnboardingNotificationScreen, {
        navigation: { reset } as any,
        route: { params: { forceNotificationsEnabled: true } } as any,
      })
    );

    const home = buttonCalls.find((b) => b.testID === 'onboarding-notification-home');
    expect(home).toBeTruthy();
    await home?.onPress?.();
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
