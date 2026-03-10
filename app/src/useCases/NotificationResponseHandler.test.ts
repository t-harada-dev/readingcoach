import { describe, expect, it, vi } from 'vitest';

vi.mock('../bridge/NotificationBridge', () => ({
  getNotificationResponseEmitter: () => null,
  ACTION_ID_START: 'START',
  ACTION_ID_RESCUE_5M: 'RESCUE_5M',
  ACTION_ID_SNOOZE_30M: 'SNOOZE_30M',
  ACTION_ID_DEFAULT: '__DEFAULT__',
}));

import { routeActionId } from './NotificationResponseHandler';

describe('routeActionId', () => {
  it('START は start に解決される', () => {
    expect(routeActionId('START')).toBe('start');
  });

  it('RESCUE_5M は rescue_5m に解決される', () => {
    expect(routeActionId('RESCUE_5M')).toBe('rescue_5m');
  });

  it('SNOOZE_30M は snooze に解決される', () => {
    expect(routeActionId('SNOOZE_30M')).toBe('snooze');
  });

  it('__DEFAULT__ と未知値は default に解決される', () => {
    expect(routeActionId('__DEFAULT__')).toBe('default');
    expect(routeActionId('UNKNOWN_ACTION')).toBe('default');
  });
});

