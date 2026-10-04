# Everbloom · Produktrichtung und Spielgefühl

Stand: 4. Oktober 2026. Ergänzt GAME_DESIGN, PRODUCT_REQUIREMENTS und ART_DIRECTION.
Diese Entscheidungen sind eine überprüfbare Produkthypothese, kein Nachweis von Nachfrage
oder Zahlungsbereitschaft.

## Wofür Menschen zurückkommen sollen

Ein persönlicher Anime-Chibi macht kleine Fortschritte im Alltag sichtbar. Die tägliche Schleife
lautet: passenden nächsten Schritt finden → im echten Leben umsetzen → eintragen → Entwicklung
am eigenen Charakter erleben. Ein sinnvoller kurzer Besuch muss auch ohne Training möglich sein:
Lernen, Kreativität, Alltag und Erholung zählen ebenfalls.

Wir gestalten zunächst für Menschen, die Anime-/Fantasy-Charaktere mögen und ihre Gewohnheiten
spielerisch entwickeln wollen. Eine Ansprache an „alle“ ist keine Designentscheidung. Verständliche
Bedienung, freundliche Sprache und unterschiedliche Looks sollen den Einstieg trotzdem erleichtern.
Die Startseite beantwortet drei Fragen in dieser Reihenfolge: Wie geht es meinem kleinen Ich?
Was kann ich heute tun? Was wächst über die Woche?

## Jetzt umgesetzt

| Bereich | Konkrete Änderung | Grenze |
| --- | --- | --- |
| Startseite | Große Charakterkarte, passende Aktivitätsvorschläge, Wochenziele, Bossillustration, reduzierte aufklappbare Nebenbereiche | Lokaler Prototyp mit Beispiel-Startwerten |
| Tagesvorschläge | Bis zu drei kurze Vorschläge aus Fokus, Tagesquests, Erholungsmodus und verbleibendem Tageslimit; echte Belohnungsberechnung als Vorschau | Erst ein bestätigter realer Aktivitätseintrag erzeugt Fortschritt |
| Wochenziele | Aktive Tage, Vielfalt und Erholung aus dem Aktivitätsverlauf | Freiwillige Orientierung, keine erfundenen zusätzlichen XP |
| Charaktergestaltung | Drei übersichtliche Gruppen: Figur, Stil, Aura; Live-Vorschau und mobile Speicherleiste | Bestehende zwölf Looks und Bildteile; noch kein vollständig gelenkig animiertes Rig |
| Begegnung | Eigenständiger Mooswächter, PixiJS-Bühne, automatische Züge, drei Taktiken, Pause/Tempo/Einzelschritte | Probekampf ohne XP, Loot oder Änderung des Wochenbosses |
| Membership | Eigene Vorschauseite mit Inhaltsplan, Free-Vergleich, Preis und Fragen | Nicht buchbar, keine bezahlten Rechte oder automatischen Käufe |

## Gestaltung

- Ruhiger dunkler Wald als gemeinsame Bühne; Salbeigrün, warmes Gold und dezentes Violett als Akzente.
- Illustrierte Figuren sind der emotionale Mittelpunkt. Detaillierte Charaktere, klare Flächen und
  zurückhaltende Oberflächen verhindern, dass die Bedienung mit der Illustration konkurriert.
- Animation erklärt Leben und Handlung: Atmung im Ruhezustand, Bewegung beim Angriff, sichtbare
  Treffer und klarer Abschluss. Bewegung lässt sich abschalten; reduzierte Bewegung wird respektiert.
- Die mobile Navigation führt zu Heute, Quests, Skills, Abenteuer und Charakter. Große Aktionen,
  Safe Areas und eine erreichbare Speicherleiste gehören zur Grundgestaltung.
- Keine Bestrafung für eine Pause, kein Verlust von verdienten Leveln bei Inaktivität und keine
  künstliche Dringlichkeit auf der Membership-Seite.

## Membership: Inhalt muss den Preis tragen

**3,99 € pro Monat bleibt der geplante Preis. 4,99 € ist eine zu prüfende Alternative.**
Die Vorschau bietet noch keinen Kauf an. Spätere Store-Preise müssen tatsächlich verfügbare lokale
Angebote anzeigen; sie dürfen nicht ausschließlich aus diesem Text übernommen werden.

Der Kaufgrund soll ein größeres Spiel sein: zusammenhängende Questkapitel, weitere Bossbegegnungen,
kuratierte Outfitkollektionen, besondere Auren/Gesten und vertiefte Skillpfade. Free behält seinen
eigenen wiederholbaren Fortschrittskreislauf. Ein bereits geplanter moderater XP-Bonus ist eine
Nebenleistung, kein Ersatz für Inhalte. Einzelheiten stehen im GAME_DESIGN; im Prototyp ist der
Bonus nicht aktiv.

Als Vergleich belegt [Finchs offizielle Plus-Beschreibung](https://help.finchcare.com/hc/en-us/articles/37780200600589-Benefits-of-Finch-Plus)
das Muster einer kostenlosen Begleiter-App mit optionaler Erweiterung durch Gestaltung und Inhalte.
Das ist eine Orientierung für die Angebotsstruktur, kein Beleg für Everblooms Umsatz oder einen
optimalen Preis. Quelle geprüft am 4. Oktober 2026.

## Nächste produktentscheidende Prüfungen

1. Mit einer kleinen Gruppe interessierter Erstnutzer beobachten, ob Charakterwahl und erster
   Aktivitätseintrag ohne Erklärung gelingen. Verwechslungen zwischen realen Aufgaben und
   simulierten Kämpfen besonders erfassen.
2. Über mehrere Wochen testen, ob die freiwilligen Vorschläge hilfreich bleiben und XP-Fortschritt
   verständlich ist. Rückkehr, wiederholte Einträge, genutzte Skill-Familien und qualitative Gründe
   gemeinsam betrachten. Noch keine Produktionsanalyse oder Trackingübermittlung implementiert.
3. Ein vollständiges zusätzliches Abenteuerkapitel mit eigenem Boss und hochwertiger kosmetischer
   Belohnung ausarbeiten. Erst damit 3,99 € und 4,99 € anhand eines konkreten Angebots prüfen.
   Klicks auf eine Vorschau sind keine Käufe und kein Nachweis langfristiger Bindung.
4. Vor Bezahlung Account-/Game-API, sicheren Besitz, Kaufprüfung, Wiederherstellung, Kündigungs-
   und Ablaufverhalten sowie native Gerätetests abschließen. Keine Membership verkaufen, deren
   versprochene Erweiterung noch nicht nutzbar ist.

Die nächste technische Priorität bleibt der serverseitige Character-/Aktivitäts-Slice. Danach
folgen das erste vollständig verbundene Abenteuer und echte Mobilgeräte. Weitere Kunstproduktion
wird an einer geprüften Figur und einem Boss-Rig ausgerichtet, bevor viele neue Sets entstehen.
