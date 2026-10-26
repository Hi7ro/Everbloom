import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { validateMembershipManagementUrl } from '../../data/native-membership';
import { BOSS_CATALOG, BOSS_DIFFICULTIES, FREE_BOSS_MAX_LEVEL, bossRequiresPlus } from '../../domain/boss-catalog';
import { Appearance } from '../../domain/models';
import { CharacterPortrait } from '../../shared/character-portrait';
import { MembershipStore } from '../../state/membership.store';

@Component({
  selector: 'app-membership-page',
  imports: [RouterLink, CharacterPortrait],
  templateUrl: './membership.page.html',
  styleUrl: './membership.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembershipPage implements OnInit {
  readonly membership = inject(MembershipStore);
  readonly plannedPrice = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(3.99);
  readonly managementUrl = computed(() => {
    const url = this.membership.state()?.managementUrl;
    if (!url) return null;
    try { return validateMembershipManagementUrl(url); }
    catch { return null; }
  });
  readonly accessUntil = computed(() => {
    const value = this.membership.state()?.expiresAt;
    if (!value) return null;
    try { return new Intl.DateTimeFormat('de-DE', { dateStyle: 'long' }).format(new Date(value)); }
    catch { return null; }
  });
  readonly portraits: Appearance[] = [
    { presentation: 'male', artwork: 'original', illustration: 'emerald-knight', body: 'base', hair: 'm-spiky', outfit: 'dark', aura: 'none', skinColor: '#e8c3a2', hairColor: '#d4dfd5', outfitColor: '#292f35' },
    { presentation: 'female', artwork: 'original', illustration: 'moonblade', body: 'base', hair: 'f-bob', outfit: 'dark', aura: 'none', skinColor: '#e8c3a2', hairColor: '#b9a9cc', outfitColor: '#292f35' },
  ];
  readonly bossCount = BOSS_CATALOG.length;
  readonly freeBossMaxLevel = FREE_BOSS_MAX_LEVEL;
  readonly freeBossCount = BOSS_CATALOG.filter(boss => !bossRequiresPlus(boss.id, 'normal')).length;
  readonly plusBossCount = this.bossCount - this.freeBossCount;
  readonly plusEncounters = BOSS_CATALOG.reduce((count, boss) => count +
    BOSS_DIFFICULTIES.filter(mode => bossRequiresPlus(boss.id, mode.id)).length, 0);
  readonly chapters = [
    { number: String(this.plusEncounters), name: 'Neue Herausforderungen', detail: `${this.plusBossCount} weitere Bosse von Level 60 bis 100 und Hard, Episch sowie Ultimate für alle ${this.bossCount} Bosse. Dein Charakterfortschritt öffnet die Begegnungen nacheinander.`, symbol: '✧' },
    { number: String(this.plusEncounters), name: 'Besondere Belohnungen', detail: 'Jeder erste Sieg in einer Plus-Begegnung bringt eine feste kosmetische Belohnung. Deine erspielten Frisuren, Sets und Auren bleiben bei dir.', symbol: '◇' },
    { number: '+10 %', name: 'Ein kleiner Rückenwind', detail: 'Mehr Charakter-XP für anrechenbare Aktivitäten. Skill-XP, Questboni und Boss-Schaden bleiben gleich.', symbol: '↟' },
  ];
  readonly comparison = [
    ['Charakter & dauerhafter Fortschritt', 'Enthalten', 'Enthalten'],
    ['Aktivitäten, Skills & Tagesziele', 'Enthalten', 'Enthalten'],
    ['Bosskampagne', `${this.freeBossCount} Bosse · Normal bis Level ${this.freeBossMaxLevel}`, `${this.bossCount} Bosse · bis Level 100`],
    ['Zusätzliche Herausforderungen', '—', `${this.plusEncounters} · weitere Bosse & höhere Modi`],
    ['Charakter-Aktivitäts-XP', 'Basis-XP', '+10 % Bonus'],
    ['Skill-XP, Questboni & Boss-Schaden', 'Gleiche Regeln', 'Gleiche Regeln'],
    ['Verdiente Looks nach Abo-Ende', 'Bleiben erhalten', 'Bleiben erhalten'],
    ['Erholung & Pausen', 'Immer möglich', 'Immer möglich'],
  ];

  ngOnInit(): void { void this.membership.load(); }
}
