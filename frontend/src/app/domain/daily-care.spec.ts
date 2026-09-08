import {
  DAILY_CARE_MODES,
  DAILY_ENERGIES,
  isLocalDayKey,
  localDayKey,
  normalizeDailyCareRecord,
  normalizeDailyCheckIn,
} from './daily-care';

describe('voluntary daily check-in domain', () => {
  it('validates the real calendar and uses local date components', () => {
    expect(localDayKey(new Date(2026, 8, 8, 23, 59))).toBe('2026-09-08');
    expect(isLocalDayKey('2028-02-29')).toBe(true);
    for (const value of ['2026-02-29', '2026-09-31', '2026-9-8', '2026-09-08T12:00Z', null]) {
      expect(isLocalDayKey(value)).toBe(false);
    }
    expect(() => localDayKey(new Date(NaN))).toThrow('Ungültiges Datum');
  });

  it('accepts every supported choice while discarding unrelated values', () => {
    for (const mode of DAILY_CARE_MODES) {
      for (const energy of DAILY_ENERGIES) {
        expect(
          normalizeDailyCheckIn({
            dayKey: '2026-09-08',
            mode: mode.id,
            energy: energy.id,
            xp: 999999,
          }),
        ).toEqual({ dayKey: '2026-09-08', mode: mode.id, energy: energy.id });
      }
    }
  });

  it('rejects malformed input, unsupported choices and inconsistent stored days', () => {
    for (const value of [
      null,
      [],
      { dayKey: '2026-09-08', mode: 'rest', energy: 'unknown' },
      { dayKey: '2026-09-08', mode: 'diagnosis', energy: 'low' },
      { dayKey: '2026-09-31', mode: 'balanced', energy: 'high' },
    ]) {
      expect(normalizeDailyCheckIn(value)).toBeNull();
    }
    const checkIn = { dayKey: '2026-09-08', mode: 'rest', energy: 'low' };
    expect(
      normalizeDailyCareRecord({ version: 1, dayKey: '2026-09-09', skipped: false, checkIn }),
    ).toBeNull();
    expect(
      normalizeDailyCareRecord({ version: 2, dayKey: '2026-09-08', skipped: false, checkIn }),
    ).toBeNull();
    expect(
      normalizeDailyCareRecord({ version: 1, dayKey: '2026-09-08', skipped: true, checkIn }),
    ).toBeNull();
  });

  it('represents skipping as a choice for this day without inventing a check-in', () => {
    expect(
      normalizeDailyCareRecord({
        version: 1,
        dayKey: '2026-09-08',
        skipped: true,
        checkIn: null,
        penalty: -50,
      }),
    ).toEqual({ version: 1, dayKey: '2026-09-08', skipped: true, checkIn: null });
  });
});
