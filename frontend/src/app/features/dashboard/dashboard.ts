import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  effect,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SKILLS } from '../../domain/catalog';
import { BOSS_CATALOG } from '../../domain/boss-catalog';
import { BOSS_COSMETICS } from '../../domain/boss-loot';
import { GameStore } from '../../state/game.store';
import { CharacterPortrait } from '../../shared/character-portrait';
import { ProgressFeedback } from '../../state/progress-feedback';
import { DailyCareStore } from '../../state/daily-care.store';
import { DailyCarePanel } from '../../shared/daily-care-panel';
import { AuraCollection } from '../../shared/aura-collection';
import { ProgressStorageNote } from '../../shared/progress-storage-note';
import { JourneySummary } from '../../shared/journey-summary';
import { MembershipStore } from '../../state/membership.store';
import { buildDailyAdventure } from '../../domain/daily-adventure';
import { DemoTourStore } from '../../state/demo-tour.store';
import { DemoGuide } from '../../shared/demo-guide';
import { buildProgressionHorizon } from '../../domain/progression-horizon';
import { ProgressionHorizonPanel } from '../../shared/progression-horizon';

@Component({
  selector: 'app-dashboard',
  imports: [
    DecimalPipe,
    FormsModule,
    CharacterPortrait,
    RouterLink,
    DailyCarePanel,
    JourneySummary,
    AuraCollection,
    ProgressStorageNote,
    DemoGuide,
    ProgressionHorizonPanel,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  readonly store = inject(GameStore);
  readonly membership = this.store.accountMode ? inject(MembershipStore) : null;
  private readonly tour = this.store.accountMode ? null : inject(DemoTourStore);
  readonly feedback = inject(ProgressFeedback);
  readonly catalog = SKILLS;
  readonly bossCount = BOSS_CATALOG.length;
  readonly finalBossLevel = Math.max(...BOSS_CATALOG.map(boss => boss.baseLevel));
  readonly bossRewardCount = BOSS_COSMETICS.length;
  readonly showAllSkills = signal(false);
  readonly visibleSkills = computed(() =>
    this.showAllSkills() ? this.store.skills() : this.store.focusSkills(),
  );
  readonly care = inject(DailyCareStore);
  readonly horizon = computed(() => buildProgressionHorizon(this.store.snapshot()));
  readonly adventure = computed(() => {
    const snapshot = this.store.snapshot();
    return snapshot
      ? buildDailyAdventure(
          snapshot,
          this.store.focusSkills().map((skill) => skill.id),
          this.care.checkIn()?.mode ?? 'balanced',
          this.membership?.bonusPercent() ?? 0,
        )
      : null;
  });
  readonly dailyMode = computed(() => {
    const labels = {
      balanced: 'Dein Tempo',
      focus: 'Fokus',
      recovery: 'Erholung',
      rest: 'Ruhetag',
    };
    return labels[this.care.checkIn()?.mode ?? 'balanced'];
  });
  readonly avatarInterest = computed(() => this.care.avatarInterest(this.store.avatarInterest()));
  readonly avatarMessage = computed(() => {
    const messages: Record<string, string> = {
      calisthenics: 'Gut bewegt. Zeit, kurz durchzuatmen.',
      running: 'Ein Schritt draußen. Ein Schritt weiter.',
      meditation: 'Ein ruhiger Moment – den nehmen wir mit.',
      programming: 'Etwas gelernt. Eine neue Idee im Gepäck.',
    };
    return this.care.avatarMessage(
      this.store.snapshot()?.activities.some((activity) => activity.xp > 0)
        ? (messages[this.store.avatarInterest()] ??
            'Was tut dir heute gut? Wir wachsen in deinem Tempo.')
        : 'Bereit für unseren ersten Schritt? Wir wachsen in deinem Tempo.',
    );
  });
  readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('activityDialog');
  readonly resetDialog = viewChild.required<ElementRef<HTMLDialogElement>>('resetDialog');
  readonly selectedSkill = signal('calisthenics');
  readonly minutes = signal<number | null>(20);
  readonly formError = signal('');
  private trigger: HTMLElement | null = null;
  private activityDialogOpen = false;
  private recoveryDialogRequestId: string | null = null;

  constructor() {
    effect(() => {
      const pending = this.store.accountMode ? this.store.pendingActivity() : null;
      if (pending) {
        // A resume or another window can reveal a reservation while this form is already open.
        this.selectedSkill.set(pending.skillId);
        this.minutes.set(pending.minutes);
        this.formError.set('');
        if (this.activityDialogOpen) this.recoveryDialogRequestId = pending.requestId;
      } else if (this.activityDialogOpen && this.recoveryDialogRequestId && !this.store.busy() && !this.store.recoveryIssue()) {
        // A recovered form must never silently turn into a new activity when another window confirms it.
        this.closeActivity();
      }
    });
  }

  ngOnInit() {
    void this.membership?.load();
    if (!this.store.snapshot()) void this.store.load();
    else void this.store.refresh();
  }

  openActivity(skillId?: string, minutes = 20) {
    this.care.refresh();
    const previousPending = this.store.accountMode ? this.store.pendingActivity() : null;
    this.store.checkActivityRecovery();
    const pending = this.store.accountMode ? this.store.pendingActivity() : null;
    if (previousPending && !pending && !this.store.recoveryIssue()) {
      void this.store.retryPendingActivity(previousPending.requestId);
      return;
    }
    this.selectedSkill.set(pending?.skillId ?? skillId ?? this.store.focusSkills()[0]?.id ?? 'calisthenics');
    this.minutes.set(pending?.minutes ?? minutes);
    this.formError.set('');
    this.trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.activityDialogOpen = true;
    this.recoveryDialogRequestId = pending?.requestId ?? null;
    this.dialog().nativeElement.showModal();
  }
  closeActivity() {
    if (!this.activityDialogOpen) return;
    this.activityDialogOpen = false;
    this.recoveryDialogRequestId = null;
    this.dialog().nativeElement.close();
  }
  activityClosed() {
    this.activityDialogOpen = false;
    this.recoveryDialogRequestId = null;
    this.restoreFocus();
  }
  restoreFocus() {
    this.trigger?.focus();
  }
  openReset() {
    this.trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.resetDialog().nativeElement.showModal();
  }
  closeReset() {
    this.resetDialog().nativeElement.close();
  }
  async confirmReset() {
    if (await this.store.reset()) {
      this.tour?.reset();
      this.closeReset();
    }
  }
  displayDay(dayKey: string) {
    return dayKey.slice(8, 10) + '.' + dayKey.slice(5, 7) + '.' + dayKey.slice(0, 4);
  }
  skillName(id: string) {
    return this.catalog.find((s) => s.id === id)?.name ?? id;
  }
  skillSymbol(id: string) {
    return this.catalog.find((skill) => skill.id === id)?.symbol ?? '✧';
  }
  selectedDefinition() {
    return this.catalog.find((s) => s.id === this.selectedSkill())!;
  }

  async submit() {
    if (this.store.accountMode && (this.store.pendingActivity() || this.recoveryDialogRequestId)) {
      if (await this.store.retryPendingActivity(this.recoveryDialogRequestId ?? undefined)) this.closeActivity();
      return;
    }
    const minutes = this.minutes();
    if (minutes === null || !Number.isInteger(minutes) || minutes < 1 || minutes > 180) {
      this.formError.set('Bitte ganze Minuten zwischen 1 und 180 eintragen.');
      return;
    }
    this.formError.set('');
    if (await this.store.record(this.selectedSkill(), minutes)) this.closeActivity();
  }
}
