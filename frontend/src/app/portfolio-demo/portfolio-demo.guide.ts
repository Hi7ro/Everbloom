import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  template: `<main id="demo-steps">
    <p class="eyebrow">HEROVERA · LOKALE FASSUNG</p>
    <h1>Dein Alltag.<br />Ein kleines Abenteuer.</h1>
    <p class="lead">
      Du nutzt hier die vorhandene Anwendung mit einem lokalen Beispielstand: Dashboard,
      Aktivitäten, Charaktergestaltung, Interessen, Skills, Quests, Bosskampagne, Sammlung und
      Einstellungen. Anmeldung und echte Store-Käufe benötigen das separate Beta-Backend.
    </p>
    <ol>
      <li>
        <strong>Aktivitäten und Tagesziele</strong>
        <p>
          Erfasse Aktivitäten über das Formular oder die Tagesvorschläge. Alle 14 Skills,
          Minutenprüfung, Tageslimits, Questboni, Momentum und Wochenboss-Schaden verwenden die
          bestehenden Spielregeln. Im Level-12-Beispiel bringen die ersten 20 Minuten Calisthenics
          80 Aktivitäts-XP, 70 Quest-XP und 160 Boss-Schaden.
        </p>
        <a routerLink="/dashboard">Zum Dashboard →</a>
      </li>
      <li>
        <strong>Deinen Charakter gestalten</strong>
        <p>
          Ändere Name, Look, Interessen und Fokus. Erspielte lokale Bossbelohnungen lassen sich in
          der vorhandenen Sammlung ausrüsten. Check-in, Ton, Effekte und Bewegung bleiben bedienbar.
        </p>
        <a routerLink="/character/create">Charakter gestalten →</a
        ><a routerLink="/onboarding">Interessen wählen →</a>
      </li>
      <li>
        <strong>Die Bosskampagne spielen</strong>
        <p>
          Die echten PixiJS-Kämpfe bieten drei Taktiken und vier Schwierigkeitsgrade. „Boss
          herausfordern“ hält Siege und Erstabschluss-Beute lokal fest und entdeckt die nächste
          Begegnung. Probekämpfe bleiben ohne Beute; Kämpfe geben keine XP.
        </p>
        <a routerLink="/battle">Zum Abenteuer →</a>
      </li>
    </ol>
    <section>
      <h2>Vorbereitete Spielstände</h2>
      <p>
        Die kompakte Leiste bietet Level 12 für den Alltag, Level 50 am ersten Kampagnenfinale und
        Level 130 für spätere Begegnungen. Frühere Siege dieser Beispiele sind vorbereitet, nicht in
        deinem Konto verdient. Von dort aus gelten die normalen Kampf- und Belohnungsregeln.
      </p>
      <p>
        Alles bleibt im Arbeitsspeicher dieses Tabs, ohne Backend-Anfragen oder Datenbankzugriff.
        „Neu starten“ lädt den gewählten Beispielstand vollständig neu, einschließlich Look,
        Interessen und Einstellungen. Der Fortschritts-Reset in den Spieleinstellungen behält den
        Look. Es wird kein Konto angelegt und nichts in bestehende Konten übernommen.
      </p>
      <a routerLink="/membership">Vorhandene Plus-Vorschau →</a
      ><a href="https://github.com/Hi7ro/Everbloom" target="_blank" rel="noopener noreferrer"
        >Quellcode und Beta-Status ↗</a
      >
    </section>
  </main>`,
  styles: [
    `
      :host {
        display: block;
      }
      main {
        width: min(850px, 90%);
        margin: auto;
        padding: 48px 0 110px;
      }
      h1 {
        font:
          400 clamp(32px, 5vw, 52px)/1.15 Georgia,
          serif;
        margin: 18px 0;
      }
      .lead {
        font-size: 17px;
      }
      p {
        line-height: 1.8;
        color: #c1cfbb;
      }
      ol {
        list-style: none;
        counter-reset: steps;
        padding: 0;
        display: grid;
        gap: 18px;
        margin: 30px 0;
      }
      li,
      section {
        padding: 24px;
        background: #1b2c25;
        border: 1px solid #a3bd8550;
        border-radius: 16px;
      }
      li {
        counter-increment: steps;
      }
      li > strong::before {
        content: counter(steps) ' / ';
        color: #d6c487;
      }
      strong {
        font-size: 18px;
      }
      h2 {
        font-size: 21px;
      }
      a {
        display: inline-flex;
        align-items: center;
        min-height: 44px;
        margin-right: 20px;
        color: #d2e4ad;
        text-decoration: underline;
        text-underline-offset: 4px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioDemoGuide {}
