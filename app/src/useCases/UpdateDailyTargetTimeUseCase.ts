import { saveSettingsWithDefaults } from './SaveSettingsWithDefaults';

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
  const dailyTargetTime = params.hour * 60 + params.minute;

  await saveSettingsWithDefaults({
    dailyTargetTime,
  });

  return dailyTargetTime;
}
