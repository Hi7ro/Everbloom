import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injectable,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ACCOUNT_MODE } from '../../data/account-mode';
import { AuthStore } from '../../state/auth.store';
import { SKILLS } from '../../domain/catalog';
import {
  DEFAULT_JOURNEY,
  INTERESTS,
  JourneyPreferences,
  MAX_ACTIVE_SKILLS,
} from '../../domain/journey';
import { CharacterPortrait } from '../../shared/character-portrait';
import { GameStore } from '../../state/game.store';
import { JourneyStore } from '../../state/journey.store';
import { ProgressFeedback } from '../../state/progress-feedback';

interface JourneyDraft {
  step: number;
  preferences: JourneyPreferences;
}

/** Only preserves an unfinished visit to the character creator, never writes device storage. */
@Injectable({ providedIn: 'root' })
class OnboardingDraft {
  private readonly auth = inject(ACCOUNT_MODE) ? inject(AuthStore) : null;
  private ownerEpoch = this.auth?.epoch();
  private entry: { epoch: number | undefined; draft: JourneyDraft } | null = null;
  get value(): JourneyDraft | null {
    return this.entry?.epoch === this.auth?.epoch() ? (this.entry?.draft ?? null) : null;
  }
  set value(draft: JourneyDraft | null) {
    this.entry = draft ? { epoch: this.auth?.epoch(), draft } : null;
  }
  constructor() {
    if (this.auth)
      effect(() => {
        const epoch = this.auth!.epoch();
        if (epoch !== this.ownerEpoch) {
          this.ownerEpoch = epoch;
          this.entry = null;
        }
      });
  }
}

const INTEREST_COPY: Record<string, { symbol: string; description: string }> = {
  physical: { symbol: '↟', description: 'Stärker werden, bewegen und Ausdauer aufbauen.' },
  combat: { symbol: '◇', description: 'Technik, Kontrolle und neue Herausforderungen.' },
  mind: { symbol: '☾', description: 'Durchatmen, bewusst leben und Kraft sammeln.' },
  knowledge: { symbol: '⌘', description: 'Neugierig bleiben und Neues verstehen.' },
  creative: { symbol: '✧', description: 'Ideen ausdrücken und etwas Eigenes schaffen.' },
  career: { symbol: '↗', description: 'Vorhaben angehen und Fähigkeiten entwickeln.' },
  life: { symbol: '◌', description: 'Kleine Gewohnheiten für einen guten Alltag.' },
};

@Component({
  selector: 'app-onboarding',
  imports: [RouterLink, CharacterPortrait],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Onboarding implements OnInit {
  readonly store = inject(GameStore);
  readonly journey = inject(JourneyStore);
  readonly feedback = inject(ProgressFeedback);
  private readonly router = inject(Router);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly savedDraft = inject(OnboardingDraft);
  private readonly initial = this.savedDraft.value;
  readonly step = signal(this.initial?.step ?? 1);
  readonly draft = signal<JourneyPreferences>(
    structuredClone(this.initial?.preferences ?? this.journey.preferences() ?? DEFAULT_JOURNEY),
  );
  readonly formError = signal('');
  readonly saving = signal(false);
  readonly maxSkills = MAX_ACTIVE_SKILLS;
  readonly interests = INTERESTS.map((interest) => ({
    ...interest,
    ...INTEREST_COPY[interest.id],
  }));
  readonly chosenInterests = computed(() =>
    this.interests.filter((interest) => this.draft().interestIds.includes(interest.id)),
  );
  readonly chosenSkills = computed(() =>
    SKILLS.filter((skill) => this.draft().activeSkillIds.includes(skill.id)),
  );
  readonly skillGroups = Array.from(new Set(SKILLS.map((skill) => skill.family))).map((family) => ({
    family,
    skills: SKILLS.filter((skill) => skill.family === family),
  }));
  readonly primaryInterest = computed(() =>
    this.interests.find((interest) => interest.id === this.draft().primaryInterestId),
  );
  readonly stepTitle = computed(() =>
    this.step() === 1
      ? 'Was möchtest du wachsen lassen?'
      : this.step() === 2
        ? 'Womit möchtest du anfangen?'
        : 'Deine Reise. Dein Rhythmus.',
  );

  ngOnInit() {
    // A cached draft belongs to this visit. A new creator visit explicitly puts it back.
    this.savedDraft.value = null;
    if (!this.store.snapshot()) void this.store.load();
  }

  toggleInterest(id: string) {
    if (!this.interests.some((interest) => interest.id === id)) return;
    this.draft.update((draft) => {
      const interestIds = draft.interestIds.includes(id)
        ? draft.interestIds.filter((selected) => selected !== id)
        : [...draft.interestIds, id];
      return {
        ...draft,
        interestIds,
        primaryInterestId: interestIds.includes(draft.primaryInterestId)
          ? draft.primaryInterestId
          : (interestIds[0] ?? ''),
      };
    });
    this.formError.set('');
  }

  setPrimary(id: string) {
    if (this.draft().interestIds.includes(id)) {
      this.draft.update((draft) => ({ ...draft, primaryInterestId: id }));
      this.formError.set('');
    }
  }

  toggleSkill(id: string) {
    if (!SKILLS.some((skill) => skill.id === id)) return;
    const selected = this.draft().activeSkillIds;
    if (!selected.includes(id) && selected.length >= MAX_ACTIVE_SKILLS) return;
    this.draft.update((draft) => ({
      ...draft,
      activeSkillIds: selected.includes(id)
        ? selected.filter((skillId) => skillId !== id)
        : [...selected, id],
    }));
    this.formError.set('');
  }

  next() {
    if (this.step() === 1 && (!this.draft().interestIds.length || !this.primaryInterest())) {
      this.formError.set('Wähle mindestens einen Interessenbereich und deinen Schwerpunkt aus.');
      return;
    }
    if (this.step() === 2 && !this.draft().activeSkillIds.length) {
      this.formError.set('Wähle mindestens einen Skill für deine Reise aus.');
      return;
    }
    if (this.step() < 3) this.changeStep(this.step() + 1);
  }

  editInterests() {
    this.changeStep(1);
  }

  back() {
    if (this.step() > 1) this.changeStep(this.step() - 1);
  }

  rememberDraft() {
    this.savedDraft.value = { step: this.step(), preferences: structuredClone(this.draft()) };
  }

  async cancel() {
    if (this.saving()) return;
    if (this.store.accountMode && !this.journey.configured()) {
      this.saving.set(true);
      try {
        if (!(await this.journey.commit(DEFAULT_JOURNEY))) {
          this.formError.set(this.journey.error());
          return;
        }
      } finally {
        this.saving.set(false);
      }
    }
    this.savedDraft.value = null;
    void this.router.navigateByUrl('/dashboard');
  }

  async finish() {
    if (this.step() !== 3 || this.saving() || this.store.busy() || !this.store.snapshot()) return;
    this.formError.set('');
    this.saving.set(true);
    try {
      if (!(await this.journey.commit(this.draft()))) {
        this.formError.set(this.journey.error() || 'Deine Auswahl konnte nicht übernommen werden.');
        return;
      }
      this.savedDraft.value = null;
      // The dashboard guard reloads the account snapshot, including its current daily quests.
      const navigated = await this.router.navigateByUrl('/dashboard');
      if (!navigated)
        this.formError.set('Deine Auswahl ist übernommen. Öffne das Dashboard erneut.');
    } catch {
      this.formError.set('Deine Auswahl ist übernommen. Öffne das Dashboard erneut.');
    } finally {
      this.saving.set(false);
    }
  }

  private changeStep(step: number) {
    this.step.set(step);
    this.formError.set('');
    // Focus the new heading once Angular has rendered it, including for keyboard navigation.
    queueMicrotask(() => {
      const heading = this.element.nativeElement.querySelector<HTMLElement>('#step-heading');
      heading?.focus();
      heading?.scrollIntoView?.({ block: 'start' });
    });
  }
}
