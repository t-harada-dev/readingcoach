import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const ctaCalls: Array<{ label: string; onPress: () => void | Promise<void> }> = [];
const requestPermissionMock = vi.hoisted(() => vi.fn(async () => true));
const cancelScheduledMock = vi.hoisted(() => vi.fn(async () => {}));
const saveSettingsMock = vi.hoisted(() => vi.fn(async () => ({})));
const updateTimeMock = vi.hoisted(() => vi.fn(async () => 21 * 60));
const getSettingsMock = vi.hoisted(() => vi.fn(async () => null));

vi.mock('react-native', () => ({
  StyleSheet: { create: (styles: unknown) => styles },
  Text: ({ children }: { children: React.ReactNode }) => React.createElement('span', null, children),
  TextInput: ({ value }: { value?: string }) => React.createElement('input', { value }),
  View: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
}));

vi.mock('../components/SessionCTAButton', () => ({
  SessionCTAButton: (props: { label: string; onPress: () => void | Promise<void> }) => {
    ctaCalls.push({ label: props.label, onPress: props.onPress });
    return React.createElement('button', null, props.label);
  },
}));

vi.mock('../bridge/PersistenceBridge', () => ({
  persistenceBridge: {
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

vi.mock('../useCases/UpdateDailyTargetTimeUseCase', () => ({
  runUpdateDailyTargetTimeUseCase: updateTimeMock,
}));

import { SettingsScreen } from './SettingsScreen';

describe('SettingsScreen', () => {
  beforeEach(() => {
    ctaCalls.length = 0;
    vi.clearAllMocks();
    (getSettingsMock as any).mockResolvedValue({
      dailyTargetTime: 21 * 60,
      notificationsEnabled: false,
    });
  });

  it('読書時間保存/通知有効化/戻るのCTAを表示する', () => {
    renderToStaticMarkup(
      React.createElement(SettingsScreen, {
        navigation: { goBack: vi.fn() } as any,
        route: {} as any,
      })
    );

    expect(ctaCalls.map((c) => c.label)).toContain('読書時間を保存');
    expect(ctaCalls.map((c) => c.label)).toContain('通知を有効にする');
    expect(ctaCalls.map((c) => c.label)).toContain('戻る');
  });

  it('通知有効化で permission と settings 保存を呼ぶ', async () => {
    renderToStaticMarkup(
      React.createElement(SettingsScreen, {
        navigation: { goBack: vi.fn() } as any,
        route: {} as any,
      })
    );

    const enable = ctaCalls.find((c) => c.label === '通知を有効にする');
    expect(enable).toBeTruthy();
    await enable?.onPress();

    expect(requestPermissionMock).toHaveBeenCalledTimes(1);
    expect(saveSettingsMock).toHaveBeenCalledWith({ notificationsEnabled: true });
  });

  it('通知無効状態では無効化ボタンから通知取消を実行する', async () => {
    renderToStaticMarkup(
      React.createElement(SettingsScreen, {
        navigation: { goBack: vi.fn() } as any,
        route: { params: { forceNotificationsEnabled: true } } as any,
      })
    );

    const disable = ctaCalls.find((c) => c.label === '通知を無効にする');
    expect(disable).toBeTruthy();
    await disable?.onPress();

    expect(saveSettingsMock).toHaveBeenCalledWith({ notificationsEnabled: false });
    expect(cancelScheduledMock).toHaveBeenCalledTimes(1);
  });

  it('読書時間保存で時刻更新ユースケースを呼ぶ', async () => {
    renderToStaticMarkup(
      React.createElement(SettingsScreen, {
        navigation: { goBack: vi.fn() } as any,
        route: {} as any,
      })
    );

    const saveTime = ctaCalls.find((c) => c.label === '読書時間を保存');
    expect(saveTime).toBeTruthy();
    await saveTime?.onPress();

    expect(updateTimeMock).toHaveBeenCalledWith({ hour: 21, minute: 0 });
  });
});
