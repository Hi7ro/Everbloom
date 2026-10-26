import { inject, Injectable } from '@angular/core';
import { ActivityCommand, CharacterProfile, GameSnapshot } from '../domain/models';
import { normalizeCharacterProfile } from '../domain/character';
import { hasAuraAccess } from '../domain/aura-rewards';
import { advanceGamePeriod, isValidDayKey, startGamePeriod } from '../domain/game-periods';
import { recordActivity } from '../domain/progression';
import { replayProgress } from '../domain/progress-replay';
import { GameRepository } from './game.repository';
import { createMockSnapshot } from './mock-data';
import { CharacterProfileStorage } from './character-profile.storage';
import { GAME_DAY_CLOCK } from './game-clock';
import {
  GameProgressJournal,
  GameProgressStorage,
  ProgressPersistenceStatus,
  serializeProgressJournal,
} from './game-progress.storage';

/** Local prototype adapter: replay inputs instead of trusting stored XP, HP or ownership. */
@Injectable()
export class MockGameRepository implements GameRepository {
  private readonly profiles = inject(CharacterProfileStorage);
  private readonly progress = inject(GameProgressStorage);
  private readonly clock = inject(GAME_DAY_CLOCK);
  private journal: GameProgressJournal;
  private snapshot: GameSnapshot;
  private clockWarning: string | null = null;

  constructor() {
    const journal = this.progress.read();
    const today = this.today();
    this.journal = journal ?? {
      version: 1,
      startDay: today ?? createMockSnapshot().dayKey,
      entries: [],
    };
    this.snapshot = replayProgress(
      startGamePeriod(createMockSnapshot(), this.journal.startDay),
      this.journal.entries,
    );
    if (!journal && today) this.progress.save(this.journal);
    this.refreshPeriod(false);
    const profile = this.profiles.read();
    if (profile) {
      const safe = this.accessibleProfile(profile, this.snapshot);
      this.applyProfile(safe);
      // Reading an unavailable/newer journal cannot revoke an earned saved cosmetic.
      // Only an explicit edit or reset persists the runtime-safe appearance.
    }
  }

  progressPersistence(): ProgressPersistenceStatus {
    return this.clockWarning
      ? { state: 'clock', message: this.clockWarning }
      : this.progress.status();
  }

  async load(): Promise<GameSnapshot> {
    this.refreshPeriod(false);
    return structuredClone(this.snapshot);
  }

  async record(command: ActivityCommand) {
    // A retried request is idempotent even after a day change or a clock rollback.
    if (this.snapshot.activities.some((entry) => entry.requestId === command.requestId)) {
      return structuredClone(recordActivity(this.snapshot, command));
    }
    const period = this.refreshPeriod(true, false);
    const result = recordActivity(period, command);
    const nextJournal: GameProgressJournal = {
      ...this.journal,
      entries: [...this.journal.entries, { ...command, dayKey: period.dayKey }],
    };
    // Check count, size and input bounds before accepting rewards or changing the session.
    serializeProgressJournal(nextJournal);
    const snapshot = advanceGamePeriod(result.snapshot, period.dayKey);
    this.progress.save(nextJournal);
    this.journal = nextJournal;
    this.snapshot = snapshot;
    return structuredClone({ ...result, snapshot });
  }

  async updateCharacter(profile: CharacterProfile) {
    const normalized = normalizeCharacterProfile(profile);
    if (!hasAuraAccess(this.snapshot, normalized.appearance.aura)) {
      throw new Error('Diese Aura hast du noch nicht freigeschaltet. Wähle eine verfügbare Aura.');
    }
    const persisted = this.profiles.save(normalized);
    this.applyProfile(normalized);
    return { snapshot: await this.load(), persisted };
  }

  async resetDemo(): Promise<GameSnapshot> {
    const today = this.today();
    if (!today) throw new Error(this.clockWarning!);
    const journal: GameProgressJournal = { version: 1, startDay: today, entries: [] };
    const snapshot = startGamePeriod(createMockSnapshot(), today);
    const profile = this.snapshot.character.createdByPlayer
      ? this.accessibleProfile(
          {
            name: this.snapshot.character.name,
            appearance: this.snapshot.character.appearance,
          },
          snapshot,
        )
      : null;
    this.progress.reset(journal);
    this.journal = journal;
    this.snapshot = snapshot;
    this.clockWarning = null;
    if (profile) {
      this.profiles.save(profile);
      this.applyProfile(profile);
    }
    return structuredClone(this.snapshot);
  }

  private accessibleProfile(profile: CharacterProfile, snapshot: GameSnapshot): CharacterProfile {
    return hasAuraAccess(snapshot, profile.appearance.aura)
      ? profile
      : { ...profile, appearance: { ...profile.appearance, aura: 'none' } };
  }

  private applyProfile(profile: CharacterProfile): void {
    this.snapshot = {
      ...this.snapshot,
      character: { ...this.snapshot.character, ...structuredClone(profile), createdByPlayer: true },
    };
  }

  private today(): string | null {
    try {
      const day = this.clock();
      if (isValidDayKey(day)) return day;
    } catch {
      // A broken platform clock must never create a new reward period.
    }
    this.clockWarning =
      'Das Datum deines Geräts ist nicht verfügbar. Dein Fortschritt bleibt erhalten; neue Aktivitäten sind vorerst gesperrt.';
    return null;
  }

  private refreshPeriod(strict: boolean, mutate = true): GameSnapshot {
    const today = this.today();
    if (!today || today < this.snapshot.dayKey) {
      if (today)
        this.clockWarning =
          'Das Gerätedatum liegt vor deinem letzten Spieltag. Dein Fortschritt bleibt erhalten. Prüfe das Datum, bevor du weitere Aktivitäten einträgst.';
      if (strict) throw new Error(this.clockWarning!);
      return this.snapshot;
    }
    this.clockWarning = null;
    const snapshot = advanceGamePeriod(this.snapshot, today);
    if (mutate) this.snapshot = snapshot;
    return snapshot;
  }
}
