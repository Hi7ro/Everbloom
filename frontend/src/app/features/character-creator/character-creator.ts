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
  CHARACTER_COLOR_PALETTES,
  CHARACTER_PRESENTATIONS,
  CHARACTER_HAIRSTYLES,
  AURA_PROGRESSION_PLAN,
  CHARACTER_OPTIONS,
  CharacterColor,
  CharacterSlot,
  normalizeCharacterProfile,
  resolveCharacterArtwork,
} from '../../domain/character';
import { Appearance, CharacterArtwork, CharacterPresentation, CharacterProfile } from '../../domain/models';
import { ILLUSTRATED_CHARACTERS, resolveCharacterIllustration } from '../../domain/character-illustrations';
import { Chibi } from '../../shared/chibi';
import { CharacterPortrait } from '../../shared/character-portrait';
import { GameStore } from '../../state/game.store';
import { JourneyStore } from '../../state/journey.store';
import { ProgressFeedback } from '../../state/progress-feedback';

@Component({
  selector: 'app-character-creator',
  imports: [FormsModule, RouterLink, Chibi, CharacterPortrait],
  templateUrl: './character-creator.html',
  styleUrl: './character-creator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterCreator implements OnInit {
  readonly store = inject(GameStore);
  readonly feedback = inject(ProgressFeedback);
  readonly previewLevel = signal(1);
  readonly previewInterest = signal('adventurer');
  private readonly router = inject(Router);
  private readonly journey = inject(JourneyStore);
  private readonly returnToOnboarding = inject(ActivatedRoute).snapshot.queryParamMap.get('returnTo') === 'onboarding';
  readonly draft = signal<CharacterProfile | null>(null);
  private readonly customAppearances: Partial<Record<CharacterPresentation, Appearance>> = {};
  private readonly chosenIllustration: Record<CharacterPresentation, string> = {
    male: 'emerald-knight', female: 'moonblade',
  };
  readonly artwork = computed(() => {
    const appearance = this.draft()?.appearance;
    return appearance ? resolveCharacterArtwork(appearance) : 'original';
  });
  readonly isCustom = computed(() => this.artwork() === 'custom');
  readonly artworkOptions = [
    { id: 'original' as const, label: 'Illustrierter Look', description: 'Wähle deine Charaktervorlage' },
    { id: 'custom' as const, label: 'Selbst gestalten', description: 'Deine eigenen Kombinationen' },
  ];
  readonly formError = signal('');
  readonly options = CHARACTER_OPTIONS;
  readonly presentations = CHARACTER_PRESENTATIONS;
  readonly auraProgression = AURA_PROGRESSION_PLAN;
  readonly hairstyles = computed(
    () => CHARACTER_HAIRSTYLES[this.draft()?.appearance.presentation ?? 'male'],
  );
  private readonly chosenHair: Record<CharacterPresentation, string> = {
    male: CHARACTER_HAIRSTYLES.male[0].id,
    female: CHARACTER_HAIRSTYLES.female[0].id,
  };
  readonly hairstylePreviews = computed(() => {
    const appearance = this.draft()?.appearance;
    return appearance
      ? this.hairstyles().map((option) => ({
          ...option,
          appearance: {
            ...appearance,
            artwork: 'custom',
            hair: option.id,
            outfit: 'adventurer',
            aura: 'none',
          } as Appearance,
        }))
      : [];
  });
  readonly selectedIllustration = computed(() => {
    const appearance = this.draft()?.appearance;
    return appearance ? resolveCharacterIllustration(appearance) : null;
  });
  readonly illustrationPreviews = computed(() => {
    const appearance = this.draft()?.appearance;
    return appearance ? ILLUSTRATED_CHARACTERS
      .filter((option) => option.presentation === appearance.presentation)
      .map((option) => ({
        ...option,
        appearance: { ...appearance, artwork: 'original', illustration: option.id, aura: 'none' } as Appearance,
      })) : [];
  });
  readonly palettes = CHARACTER_COLOR_PALETTES;
  readonly shapeGroups = [
    { slot: 'body' as const, label: 'Körperform', choices: CHARACTER_OPTIONS.body },
  ];
  readonly colorGroups: readonly { slot: CharacterColor; label: string }[] = [
    { slot: 'skinColor', label: 'Hautfarbe' },
    { slot: 'hairColor', label: 'Haarfarbe' },
    { slot: 'outfitColor', label: 'Outfitfarbe' },
  ];

  ngOnInit() {
    void this.loadProfile();
  }

  async loadProfile() {
    if (!this.store.snapshot()) await this.store.load();
    const character = this.store.snapshot()?.character;
    if (character) {
      this.customAppearances[character.appearance.presentation] = { ...character.appearance, artwork: 'custom', outfit: character.appearance.outfit === 'wanderer' ? 'adventurer' : character.appearance.outfit };
      this.chosenIllustration[character.appearance.presentation] = resolveCharacterIllustration(character.appearance).id;
      this.chosenHair[character.appearance.presentation] = character.appearance.hair;
      this.previewLevel.set(this.store.level().level);
      this.previewInterest.set(this.store.avatarInterest());
      this.draft.set({
        name: character.name,
        appearance: {
          ...character.appearance,
          outfit:
            character.appearance.outfit === 'wanderer' ? 'adventurer' : character.appearance.outfit,
        },
      });
    }
  }

  setName(name: string) {
    this.draft.update((current) => (current ? { ...current, name } : current));
    this.formError.set('');
  }

  setPresentation(presentation: CharacterPresentation) {
    const current = this.draft();
    if (!current || this.store.busy() || current.appearance.presentation === presentation) return;
    const artwork = this.artwork();
    if (artwork === 'custom') this.rememberCustomAppearance(current.appearance);
    const ownAppearance = this.customAppearances[presentation];
    this.draft.set({
      ...current,
      appearance: {
        ...(artwork === 'custom' && ownAppearance ? ownAppearance : current.appearance),
        presentation,
        hair: this.chosenHair[presentation],
        aura: current.appearance.aura,
        artwork,
        ...(artwork === 'original' ? { illustration: this.chosenIllustration[presentation] } : {}),
      },
    });
    this.formError.set('');
  }

  setArtwork(artwork: CharacterArtwork) {
    const current = this.draft();
    if (!current || this.store.busy() || artwork === this.artwork()) return;
    const presentation = current.appearance.presentation;
    if (artwork === 'original') {
      this.rememberCustomAppearance(current.appearance);
      this.draft.set({
        ...current,
        appearance: { ...current.appearance, artwork, illustration: this.chosenIllustration[presentation] },
      });
    } else {
      this.draft.set({
        ...current,
        appearance: {
          ...(this.customAppearances[presentation] ?? current.appearance),
          presentation, hair: this.chosenHair[presentation],
          aura: current.appearance.aura, artwork,
        },
      });
    }
    this.formError.set('');
  }

  chooseIllustration(id: string) {
    const current = this.draft();
    if (!current || this.store.busy()) return;
    const selected = ILLUSTRATED_CHARACTERS.find(
      (option) => option.id === id && option.presentation === current.appearance.presentation,
    );
    if (!selected) return;
    if (this.isCustom()) this.rememberCustomAppearance(current.appearance);
    this.chosenIllustration[selected.presentation] = selected.id;
    this.draft.set({
      ...current,
      appearance: { ...current.appearance, artwork: 'original', illustration: selected.id },
    });
    this.formError.set('');
  }

  private rememberCustomAppearance(appearance: Appearance) {
    this.customAppearances[appearance.presentation] = { ...appearance, artwork: 'custom' };
    this.chosenHair[appearance.presentation] = appearance.hair;
  }

  chooseAura(value: string) {
    if (this.store.busy()) return;
    this.draft.update((current) => current ? {
      ...current, appearance: { ...current.appearance, aura: value },
    } : current);
    this.formError.set('');
  }

  choose(slot: CharacterSlot | CharacterColor, value: string) {
    if (this.store.busy()) return;
    if (!this.isCustom()) this.setArtwork('custom');
    if (slot === 'hair' && this.draft())
      this.chosenHair[this.draft()!.appearance.presentation] = value;
    this.draft.update((current) =>
      current
        ? {
            ...current,
            appearance: { ...current.appearance, artwork: 'custom', [slot]: value },
          }
        : current,
    );
    this.formError.set('');
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
      const destination = this.returnToOnboarding || (!profileWasSaved && !this.journey.configured())
        ? '/onboarding' : '/dashboard';
      await this.router.navigateByUrl(destination);
    }
  }

  cancel() {
    if (!this.store.busy()) void this.router.navigateByUrl(this.returnToOnboarding ? '/onboarding' : '/dashboard');
  }
}
