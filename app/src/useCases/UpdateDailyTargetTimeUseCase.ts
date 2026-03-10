import { persistenceBridge } from '../bridge/PersistenceBridge';

type Params = {
  hour: number;
  minute: number;
};

function validateTime(params: Params): void {
  if (!Number.isInteger(params.hour) || !Number.isInteger(params.minute)) {
    throw new Error('hour/minute must be integers');
  }
  if (params.hour < 0 || params.hour > 23) {
    throw new Error('hour must be 0-23');
  }
  if (params.minute < 0 || params.minute > 59) {
    throw new Error('minute must be 0-59');
  }
}

export async function runUpdateDailyTargetTimeUseCase(params: Params): Promise<number> {
  validateTime(params);
  const current = await persistenceBridge.getSettings();
  const dailyTargetTime = params.hour * 60 + params.minute;

  await persistenceBridge.saveSettings({
    dailyTargetTime,
    defaultDuration: current?.defaultDuration ?? 15,
    retryLimit: current?.retryLimit ?? 1,
    dayRolloverHour: current?.dayRolloverHour ?? 4,
    progressTrackingEnabled: current?.progressTrackingEnabled ?? false,
    progressPromptShown: current?.progressPromptShown ?? false,
  });

  return dailyTargetTime;
}
