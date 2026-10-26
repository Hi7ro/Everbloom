import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  CHARACTER_OPTIONS,
  CHARACTER_PRESENTATIONS,
  defaultHairstyle,
  normalizeCharacterProfile,
} from '../../domain/character';
import { Appearance, CharacterPresentation, CharacterProfile } from '../../domain/models';
import {
  ILLUSTRATED_CHARACTERS,
  ILLUSTRATED_COLOR_PALETTES,
  IllustratedColor,
  resolveCharacterIllustration,
} from '../../domain/character-illustrations';
import { AuraCollection } from '../../shared/aura-collection';
import { ProgressStorageNote } from '../../shared/progress-storage-note';
import { CharacterPortrait } from '../../shared/character-portrait';
import { GameStore } from '../../state/game.store';
import { JourneyStore } from '../../state/journey.store';
import { ProgressFeedback } from '../../state/progress-feedback';
import { BOSS_COSMETICS, bossCosmeticForAppearance, hasBossCosmetic, resolveBossCosmetic } from '../../domain/boss-loot';
import { BossLootCollection } from '../../shared/boss-loot-collection';

@Component({
  selector: 'app-character-creator',
  imports: [
    FormsModule,
    RouterLink,
    CharacterPortrait,
    AuraCollection,
    ProgressStorageNote,
    BossLootCollection,
  ],
  templateUrl: './character-creator.html',
  styleUrl: './character-creator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterCreator implements OnInit {
  readonly store = inject(GameStore);
  readonly feedback = inject(ProgressFeedback);
  private readonly router = inject(Router);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly journey = inject(JourneyStore);
  private readonly returnToOnboarding =
    inject(ActivatedRoute).snapshot.queryParamMap.get('returnTo') === 'onboarding';
  private readonly appearances: Partial<Record<CharacterPresentation, Appearance>> = {};
  readonly draft = signal<CharacterProfile | null>(null);
  readonly formError = signal('');
  readonly enlargedPreview = signal(false);
  readonly stage = signal<1 | 2 | 3>(
    inject(ActivatedRoute).snapshot.fragment === 'aura-rewards' ? 3 : inject(ActivatedRoute).snapshot.fragment === 'boss-loot' ? 2 : 1,
  );
  readonly stages = [
    { id: 1, label: 'Figur', detail: 'Name & Vorlage' },
    { id: 2, label: 'Stil', detail: 'Haare & Farben' },
    { id: 3, label: 'Aura', detail: 'Dein Leuchten' },
  ] as const;
  readonly options = CHARACTER_OPTIONS;
  readonly presentations = CHARACTER_PRESENTATIONS;
  readonly palettes = ILLUSTRATED_COLOR_PALETTES;
  readonly colorGroups: readonly { slot: IllustratedColor; label: string }[] = [
    { slot: 'eyeColor', label: 'Augenfarbe' },
    { slot: 'skinTone', label: 'Hautton' },
    { slot: 'hairTint', label: 'Haarfarbe' },
  ];
  readonly selectedIllustration = computed(() => {
    const appearance = this.draft()?.appearance;
    return appearance ? resolveCharacterIllustration(appearance) : null;
  });
  readonly illustrationOptions = computed(() =>
    ILLUSTRATED_CHARACTERS.filter(
      (option) => option.presentation === (this.draft()?.appearance.presentation ?? 'male'),
    ),
  );
  readonly illustrationPreviews = computed(() => {
    const appearance = this.draft()?.appearance;
    return appearance
      ? this.illustrationOptions().map((option) => ({
          ...option,
          appearance: { ...this.presetAppearance(appearance, option.id), aura: 'none' },
        }))
      : [];
  });
  readonly selectedHair = computed(
    () => this.draft()?.appearance.cosmeticHair ? null : this.draft()?.appearance.illustratedHair ?? this.selectedIllustration()?.id,
  );
  readonly selectedOutfit = computed(
    () => this.draft()?.appearance.cosmeticOutfit ? null : this.draft()?.appearance.outfitSet ?? this.selectedIllustration()?.id,
  );

  readonly lookSummary = computed(() => {
    const profile = this.draft();
    if (!profile) return '';
    const hair = resolveBossCosmetic(profile.appearance.cosmeticHair ?? '', profile.appearance.presentation)?.name ??
      this.illustrationOptions().find(item => item.id === this.selectedHair())?.hairLabel;
    const outfit = resolveBossCosmetic(profile.appearance.cosmeticOutfit ?? '', profile.appearance.presentation)?.name ??
      this.illustrationOptions().find(item => item.id === this.selectedOutfit())?.outfitLabel;
    return [hair, outfit].filter(Boolean).join(' · ');
  });
  readonly hasCustomStyle = computed(() => {
    const appearance = this.draft()?.appearance;
    return !!appearance && ['illustratedHair', 'outfitSet', 'eyeColor', 'skinTone', 'hairTint', 'cosmeticHair', 'cosmeticOutfit']
      .some(key => appearance[key as keyof Appearance] !== undefined);
  });
  resetLook() {
    const id = this.selectedIllustration()?.id;
    if (id) this.chooseIllustration(id);
  }

  constructor() {
    // Another screen may already be loading the shared game when this route opens.
    // Adopt its eventual result once, without replacing an edited creator draft.
    effect(() => {
      const character = this.store.snapshot()?.character;
      if (character) untracked(() => this.initializeDraft(character));
    });
  }

  ngOnInit() {
    void this.loadProfile();
  }

  async loadProfile() {
    if (!this.store.snapshot() && !this.store.busy()) await this.store.load();
    const character = this.store.snapshot()?.character;
    if (character) this.initializeDraft(character);
  }

  private initializeDraft(character: CharacterProfile) {
    if (this.draft()) return;
    try {
      const profile = normalizeCharacterProfile({
        name: character.name,
        appearance: character.appearance,
      });
      this.appearances[profile.appearance.presentation] = { ...profile.appearance };
      this.draft.set(profile);
      this.formError.set('');
    } catch (error) {
      this.formError.set(
        error instanceof Error ? error.message : 'Bitte lade deinen Charakter erneut.',
      );
    }
  }

  selectStage(stage: 1 | 2 | 3) {
    if (this.store.busy() || this.stage() === stage) return;
    this.stage.set(stage);
    queueMicrotask(() => {
      const heading = this.element.nativeElement.querySelector<HTMLElement>(
        `.editor-section:not([hidden]) h2`,
      );
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView?.({ block: 'start', behavior: 'instant' });
    });
  }

  setName(name: string) {
    if (this.store.busy()) return;
    this.draft.update((current) => (current ? { ...current, name } : current));
    this.formError.set('');
  }

  setPresentation(presentation: CharacterPresentation) {
    const current = this.draft();
    if (!current || this.store.busy() || current.appearance.presentation === presentation) return;
    if (!CHARACTER_PRESENTATIONS.some((option) => option.id === presentation)) return;
    this.appearances[current.appearance.presentation] = { ...current.appearance };
    const first = ILLUSTRATED_CHARACTERS.find((option) => option.presentation === presentation)!;
    const appearance =
      this.appearances[presentation] ??
      this.presetAppearance(
        {
          ...current.appearance,
          presentation,
          hair: defaultHairstyle(presentation),
        },
        first.id,
      );
    this.draft.set({ ...current, appearance: { ...appearance } });
    this.formError.set('');
  }

  chooseIllustration(id: string) {
    const current = this.draft();
    if (
      !current ||
      this.store.busy() ||
      !this.illustrationOptions().some((option) => option.id === id)
    )
      return;
    this.draft.set({ ...current, appearance: this.presetAppearance(current.appearance, id) });
    this.formError.set('');
  }

  chooseModule(slot: 'illustratedHair' | 'outfitSet', id: string) {
    if (this.store.busy() || !this.illustrationOptions().some((option) => option.id === id)) return;
    this.draft.update(current => {
      if (!current) return current;
      const appearance = { ...current.appearance, [slot]: id };
      delete appearance[slot === 'illustratedHair' ? 'cosmeticHair' : 'cosmeticOutfit'];
      return { ...current, appearance };
    });
    this.formError.set('');
  }

  chooseBossCosmetic(id: string) {
    const snapshot = this.store.snapshot();
    const reward = BOSS_COSMETICS.find(item => item.id === id);
    if (this.store.busy() || !snapshot || !reward || !hasBossCosmetic(snapshot, id)) return;
    if (reward.slot === 'aura') { this.chooseAura(reward.auraId!); return; }
    this.draft.update(current => current ? { ...current, appearance: {
      ...current.appearance, [reward.slot === 'hair' ? 'cosmeticHair' : 'cosmeticOutfit']: id,
    } } : current);
    this.formError.set('');
  }

  chooseColor(slot: IllustratedColor, value: string | undefined) {
    if (
      this.store.busy() ||
      (value !== undefined && !this.palettes[slot].some((option) => option.hex === value))
    )
      return;
    this.draft.update((current) => {
      if (!current) return current;
      const appearance = { ...current.appearance };
      if (slot === 'hairTint' && appearance.cosmeticHair) {
        appearance.illustratedHair = bossCosmeticForAppearance(appearance, 'hair')?.modules?.[appearance.presentation];
        delete appearance.cosmeticHair;
      }
      if (value === undefined) delete appearance[slot];
      else appearance[slot] = value;
      return { ...current, appearance };
    });
    this.formError.set('');
  }

  chooseAura(value: string) {
    if (this.store.busy() || !this.store.canEquipAura(value)) return;
    this.draft.update((current) =>
      current
        ? {
            ...current,
            appearance: { ...current.appearance, aura: value },
          }
        : current,
    );
    this.formError.set('');
  }

  private presetAppearance(appearance: Appearance, illustration: string): Appearance {
    const result: Appearance = { ...appearance, artwork: 'original', illustration };
    for (const slot of [
      'illustratedHair',
      'outfitSet',
      'eyeColor',
      'skinTone',
      'hairTint',
      'cosmeticHair',
      'cosmeticOutfit',
    ] as const)
      delete result[slot];
    return result;
  }

  async save() {
    const draft = this.draft();
    if (!draft || this.store.busy()) return;
    let profile: CharacterProfile;
    try {
      profile = normalizeCharacterProfile(draft);
    } catch (error) {
      this.selectStage(1);
      this.formError.set(error instanceof Error ? error.message : 'Bitte prüfe deine Angaben.');
      return;
    }
    this.formError.set('');
    const profileWasSaved = this.store.profileIsSaved();
    if (await this.store.updateCharacter(profile)) {
      const destination =
        this.returnToOnboarding || (!profileWasSaved && !this.journey.configured())
          ? '/onboarding'
          : '/dashboard';
      await this.router.navigateByUrl(destination);
    }
  }

  cancel() {
    if (!this.store.busy())
      void this.router.navigateByUrl(this.returnToOnboarding ? '/onboarding' : '/dashboard');
  }
}
