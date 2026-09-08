import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AURA_PROGRESSION_PLAN,
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
import { ADVANCED_AURA_DESIGNS, AURA_PREVIEW_COLORS } from '../../domain/aura-designs';
import { CharacterAura } from '../../shared/character-aura';
import { CharacterPortrait } from '../../shared/character-portrait';
import { GameStore } from '../../state/game.store';
import { JourneyStore } from '../../state/journey.store';
import { ProgressFeedback } from '../../state/progress-feedback';

@Component({
  selector: 'app-character-creator',
  imports: [FormsModule, RouterLink, CharacterPortrait, CharacterAura],
  templateUrl: './character-creator.html',
  styleUrl: './character-creator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterCreator implements OnInit {
  readonly store = inject(GameStore);
  readonly feedback = inject(ProgressFeedback);
  private readonly router = inject(Router);
  private readonly journey = inject(JourneyStore);
  private readonly returnToOnboarding =
    inject(ActivatedRoute).snapshot.queryParamMap.get('returnTo') === 'onboarding';
  private readonly appearances: Partial<Record<CharacterPresentation, Appearance>> = {};
  readonly draft = signal<CharacterProfile | null>(null);
  readonly formError = signal('');
  readonly previewAura = signal<string | null>(null);
  readonly previewFierce = signal(false);
  readonly previewColor = signal<string>('#a78bfa');
  readonly advancedAuras = ADVANCED_AURA_DESIGNS;
  readonly auraPreviewColors = AURA_PREVIEW_COLORS;
  readonly previewAuraDesign = computed(
    () => this.advancedAuras.find((aura) => aura.id === this.previewAura()) ?? null,
  );
  readonly previewAppearance = computed(() => {
    const appearance = this.draft()?.appearance;
    return appearance && this.previewAura() ? { ...appearance, aura: 'none' } : appearance;
  });
  readonly options = CHARACTER_OPTIONS;
  readonly presentations = CHARACTER_PRESENTATIONS;
  readonly auraProgression = AURA_PROGRESSION_PLAN;
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
    () => this.draft()?.appearance.illustratedHair ?? this.selectedIllustration()?.id,
  );
  readonly selectedOutfit = computed(
    () => this.draft()?.appearance.outfitSet ?? this.selectedIllustration()?.id,
  );

  ngOnInit() {
    void this.loadProfile();
  }

  async loadProfile() {
    if (!this.store.snapshot()) await this.store.load();
    const character = this.store.snapshot()?.character;
    if (!character) return;
    try {
      const profile = normalizeCharacterProfile({
        name: character.name,
        appearance: character.appearance,
      });
      this.appearances[profile.appearance.presentation] = { ...profile.appearance };
      this.draft.set(profile);
    } catch (error) {
      this.formError.set(
        error instanceof Error ? error.message : 'Bitte lade deinen Charakter erneut.',
      );
    }
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
    this.endAuraPreview();
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
    this.endAuraPreview();
    this.draft.set({ ...current, appearance: this.presetAppearance(current.appearance, id) });
    this.formError.set('');
  }

  chooseModule(slot: 'illustratedHair' | 'outfitSet', id: string) {
    if (this.store.busy() || !this.illustrationOptions().some((option) => option.id === id)) return;
    this.draft.update((current) =>
      current
        ? {
            ...current,
            appearance: { ...current.appearance, [slot]: id },
          }
        : current,
    );
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
      if (value === undefined) delete appearance[slot];
      else appearance[slot] = value;
      return { ...current, appearance };
    });
    this.formError.set('');
  }

  chooseAura(value: string) {
    if (this.store.busy() || !CHARACTER_OPTIONS.aura.some((option) => option.id === value)) return;
    this.endAuraPreview();
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

  choosePreviewAura(id: string) {
    const design = this.advancedAuras.find((aura) => aura.id === id);
    if (!design || this.store.busy()) return;
    this.previewAura.set(id);
    this.previewFierce.set(false);
    this.previewColor.set(
      this.auraPreviewColors.find((color) => color.hex === design.color)?.hex ?? '#a78bfa',
    );
  }

  choosePreviewColor(value: string) {
    if (this.store.busy() || !this.auraPreviewColors.some((color) => color.hex === value)) return;
    this.previewColor.set(value);
  }

  endAuraPreview() {
    this.previewAura.set(null);
    this.previewFierce.set(false);
  }

  onAuraPreviewToggle(event: Event) {
    if (!(event.target as HTMLDetailsElement).open) this.endAuraPreview();
  }

  private presetAppearance(appearance: Appearance, illustration: string): Appearance {
    const result: Appearance = { ...appearance, artwork: 'original', illustration };
    for (const slot of [
      'illustratedHair',
      'outfitSet',
      'eyeColor',
      'skinTone',
      'hairTint',
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
