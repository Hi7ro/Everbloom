import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Appearance } from '../../domain/models';
import { CharacterPortrait } from '../../shared/character-portrait';

/** Offer preview only. No checkout, trial, subscription or entitlement is created here. */
@Component({
  selector: 'app-membership-page',
  imports: [RouterLink, CharacterPortrait],
  templateUrl: './membership.page.html',
  styleUrl: './membership.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembershipPage {
  readonly price = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(3.99);
  readonly portraits: Appearance[] = [
    { presentation: 'male', artwork: 'original', illustration: 'emerald-knight', body: 'base', hair: 'm-spiky', outfit: 'dark', aura: 'sage', skinColor: '#e8c3a2', hairColor: '#d4dfd5', outfitColor: '#292f35' },
    { presentation: 'female', artwork: 'original', illustration: 'moonblade', body: 'base', hair: 'f-bob', outfit: 'dark', aura: 'void', skinColor: '#e8c3a2', hairColor: '#b9a9cc', outfitColor: '#292f35' },
  ];
  readonly chapters = [
    { number: '01', name: 'Mehr Abenteuer', detail: 'Zusätzliche Questkapitel und eigene Bossbegegnungen, die deinen Alltag zu einer fortlaufenden Reise machen.', symbol: '✧' },
    { number: '02', name: 'Mehr Ausdruck', detail: 'Weitere Outfitkollektionen, besondere Auren und ausgearbeitete Gesten für dein digitales Selbst.', symbol: '◇' },
    { number: '03', name: 'Mehr Möglichkeiten', detail: 'Vertiefte Skillpfade und Subskills für die Dinge, die dir wirklich etwas bedeuten.', symbol: '↟' },
  ];
  readonly comparison = [
    ['Charakter & dauerhafter Fortschritt', 'Enthalten', 'Enthalten'],
    ['Aktivitäten, Skills & Tagesziele', 'Grundspiel', 'Weitere Skillpfade geplant'],
    ['Wiederkehrende Bossbegegnungen', 'Grundspiel', 'Zusätzliche Kapitel geplant'],
    ['Frisuren, Outfitsets & Auren', 'Startlooks & erspielbare Auren', 'Weitere Kollektionen geplant'],
    ['Erholung & Pausen', 'Immer möglich', 'Immer möglich'],
  ];
}
