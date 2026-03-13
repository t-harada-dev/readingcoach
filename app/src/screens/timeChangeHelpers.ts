export const TIME_CHANGE_PRESETS = [
  { hour: 7, minute: 0, label: '7:00' },
  { hour: 12, minute: 0, label: '12:00' },
  { hour: 21, minute: 0, label: '21:00' },
  { hour: 22, minute: 0, label: '22:00' },
] as const;

export function normalizeTimeField(raw: string, max: number): number | null {
  if (raw.trim().length === 0) return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  const normalized = Math.floor(value);
  if (normalized < 0 || normalized > max) return null;
  return normalized;
}
