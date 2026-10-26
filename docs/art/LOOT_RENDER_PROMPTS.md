# Beute-Illustrationen · Produktionsprompts V1

Erstellt am 2026-10-04 mit dem eingebauten Imagegen-Tool: ein separater Aufruf je Asset, jeweils mit transparenter Ausgabe. Es wurde kein API-/CLI-Generierungsfallback verwendet.

20 eigenständige Sammlungsillustrationen für fünf Bosse. Stilreferenz ist der vorhandene gemalte Anime-Chibi; Haar- und Set-Illustrationen orientieren sich an den benannten bestehenden männlichen Modulen und ihren Reward-Farben. Die weibliche Variante bleibt im bestehenden Charakter-Rig definiert. Diese Bilder sind Sammlungsillustrationen, keine neuen ausrüstbaren Geometrien: In der Sammlung zeigt „An deinem Chibi“ weiterhin das echte Portrait mit den vorhandenen Modulen, Tints und Aura-Effekten. Noch nicht entdeckte Bosse und ihre Beute erscheinen nicht in der Sammlung.

Die unveränderten PNG-Master liegen unter `art-source/loot/` außerhalb des App-Bundles. Die App verwendet ausschließlich 480 × 480 WebP-Dateien unter `frontend/public/art/loot/`. Umwandlung: `cwebp -quiet -q 90 -alpha_q 100 -m 6 -resize 480 480 INPUT.png -o OUTPUT.webp`. RGB wird mit Qualitätsstufe 90 komprimiert, Alpha mit Stufe 100 erhalten; keine nachträgliche inhaltliche Retusche oder Python-Bildbearbeitung. Originale im Codex-Generierungsordner bleiben erhalten.

Alle 20 Resultate wurden bei der Erzeugung visuell geprüft: passende motivische Zuordnung, gemalte Tiefe, lesbare Silhouette, kein Text/Wasserzeichen und freier Hintergrund. Die 20 Produktionsdateien wurden außerdem vollständig mit dem WebP-Decoder gelesen: jeweils 480 × 480, RGBA, Alpha-Minimum 0 und Maximum 253 oder 254. Das bestätigt die Transparenz; eine App-Sichtprüfung ist ein zusätzlicher separater Schritt.

## Asset-Zuordnung

| ID | PNG-Master | App-Datei |
|---|---|---|
| `moss-crown` | `art-source/loot/moss-crown-v1.png` | `frontend/public/art/loot/moss-crown-v1.webp` |
| `verdant-warden` | `art-source/loot/verdant-warden-v1.png` | `frontend/public/art/loot/verdant-warden-v1.webp` |
| `eternal-blossom` | `art-source/loot/eternal-blossom-v1.png` | `frontend/public/art/loot/eternal-blossom-v1.webp` |
| `ancient-guardian` | `art-source/loot/ancient-guardian-v1.png` | `frontend/public/art/loot/ancient-guardian-v1.webp` |
| `ember-crown` | `art-source/loot/ember-crown-v1.png` | `frontend/public/art/loot/ember-crown-v1.webp` |
| `cinder-forged` | `art-source/loot/cinder-forged-v1.png` | `frontend/public/art/loot/cinder-forged-v1.webp` |
| `wyrmfire` | `art-source/loot/wyrmfire-v1.png` | `frontend/public/art/loot/wyrmfire-v1.webp` |
| `infernal-wings` | `art-source/loot/infernal-wings-v1.png` | `frontend/public/art/loot/infernal-wings-v1.webp` |
| `astral-crown` | `art-source/loot/astral-crown-v1.png` | `frontend/public/art/loot/astral-crown-v1.webp` |
| `astral-regalia` | `art-source/loot/astral-regalia-v1.png` | `frontend/public/art/loot/astral-regalia-v1.webp` |
| `star-trail` | `art-source/loot/star-trail-v1.png` | `frontend/public/art/loot/star-trail-v1.webp` |
| `celestial-wings` | `art-source/loot/celestial-wings-v1.png` | `frontend/public/art/loot/celestial-wings-v1.webp` |
| `frost-crown` | `art-source/loot/frost-crown-v1.png` | `frontend/public/art/loot/frost-crown-v1.webp` |
| `glacier-guard` | `art-source/loot/glacier-guard-v1.png` | `frontend/public/art/loot/glacier-guard-v1.webp` |
| `frozen-runes` | `art-source/loot/frozen-runes-v1.png` | `frontend/public/art/loot/frozen-runes-v1.webp` |
| `glacial-current` | `art-source/loot/glacial-current-v1.png` | `frontend/public/art/loot/glacial-current-v1.webp` |
| `cloud-crown` | `art-source/loot/cloud-crown-v1.png` | `frontend/public/art/loot/cloud-crown-v1.webp` |
| `cloud-regalia` | `art-source/loot/cloud-regalia-v1.png` | `frontend/public/art/loot/cloud-regalia-v1.webp` |
| `celestial-lotus` | `art-source/loot/celestial-lotus-v1.png` | `frontend/public/art/loot/celestial-lotus-v1.webp` |
| `solar-corona` | `art-source/loot/solar-corona-v1.png` | `frontend/public/art/loot/solar-corona-v1.webp` |

## Exakte Aufruf-Prompts

### moss-crown

Referenz: `frontend/public/art/characters/forest-scout-sheet.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-1dd9937b-4209-4a3d-91ea-6a69daf63aec.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: A single isolated jade-green anime hairstyle collectible, based precisely on the hairstyle on the RIGHT of the supplied sheet: chunky swept layered bangs, a small high tied ponytail with the existing narrow gold leaf clasp, richly painted individual locks. Recolor the brown hair to jade green #6fae96, retaining deep teal shadows and warm silky highlights. Render hair only, with an empty opening for a face; no face, head skin, eyes, body or mannequin. This is a hairstyle, not a literal crown. Do not invent extra antlers, jewelry or geometry.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```

### verdant-warden

Referenz: `frontend/public/art/characters/forest-scout-sheet.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-b227c4da-84e0-4be3-841c-f7802b9c4cbe.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: A single isolated compact chibi ranger outfit collectible based closely on the BODY on the LEFT of the supplied sheet: layered hood scarf, short cloak panels, leather chest straps, leaf-trimmed bracers, belt with small pouches, fitted trousers and stout boots. Recolor the main cloth and leather tones to sophisticated jade green #4c9c83 while preserving dark folds and restrained gold leaf edging. Show the complete miniature outfit arranged on an invisible body in a slight three-quarter angle, no head, no face, no exposed flesh, no mannequin. Include only the already illustrated clothing; omit the bow, quiver, sword and any other weapon. Do not invent wings, helmet or new armor geometry.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```

### eternal-blossom

Referenz: `frontend/public/art/characters/emerald-knight-original.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-c3d5e02a-0df0-4783-a7da-1b1861a7d25e.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: One isolated cherry-blossom aura emblem: two graceful small curved branches frame a hollow central opening; full pearly-pink sakura flowers, blush petals lifting in a spiral and tiny warm gold motes. The center stays empty to suggest the space for a chibi, without depicting any character. Refined hand-painted fantasy petals and layered translucent pink magical trails. Rounded soft elegant silhouette, color pink #ef9db5 with warm cream highlights. No trees or landscape.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```

### ancient-guardian

Referenz: `frontend/public/art/characters/emerald-knight-original.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-e4a044ce-baf7-47a6-8f70-7f6e5345fa36.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: One isolated spectral guardian aura emblem: a broad mystical protective spirit silhouette rising from a curved jade/teal energy base, huge translucent shoulder shapes and two gently luminous eyes, ancient graceful leaf-like crown and arms framing an EMPTY central area where a chibi would stand. The guardian is an ethereal effect, not a flesh character; lower torso dissolves into green-blue wisps. Luxurious layered painterly light, jade #77cdb2, deep teal and warm gold accents. Protective and majestic, not frightening. No actual hero in the center, no landscape.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```

### ember-crown

Referenz: `frontend/public/art/characters/ember-striker-sheet.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-ea811098-bfea-4c4b-a40b-2a7e0a8fc2f7.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: A single isolated anime hairstyle collectible based precisely on the hairstyle on the RIGHT of the supplied sheet: its short spiky swept silhouette, sculpted individual layered locks and existing hairline proportions. Recolor the hairstyle to rich ember copper-red #ee8058, with deep warm auburn shadows and luminous amber highlights. Render hair only with the face opening empty; no face, eyes, skin, body or mannequin. This is a hairstyle, not a literal crown, not a flame aura. Preserve the supplied hairstyle shape and do not add jewelry.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```

### cinder-forged

Referenz: `frontend/public/art/characters/abyss-walker-sheet.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-5d6dc4f7-7b57-4a23-98cf-4db99f830b4c.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: A single isolated compact chibi armor outfit collectible, closely based on the BODY on the LEFT of the supplied sheet: faceted layered dark plate shoulders, chest diamond gem, high dark neck wrap, gauntlets, buckled belt, split short cloak, fitted armored legs and stout plated boots. Recolor the existing dark armor surfaces/cloth with subtle copper-glow #cd7158 accents, preserve black/deep-plum shadows and metallic beveled trim. Show complete miniature outfit on an invisible body in three-quarter angle, no head, no face, no exposed flesh, no mannequin. Omit the existing sword and all weapons. Do not invent helmet, wings or extra armor geometry.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```

### wyrmfire

Referenz: `frontend/public/art/characters/emerald-knight-original.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-d470d9e3-1f80-44ec-bf06-2510a65f88f6.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: One isolated powerful fire aura emblem: an elegant upward wreath of sculpted orange flames, copper-red outer tongues, golden inner fire and drifting warm embers, wrapping around a visibly EMPTY central character-sized space. Shape echoes the dramatic silhouette of a chibi fantasy aura, with tall curling flames at both sides and a small curved ember base. Highly detailed layered painterly fire and semi-transparent glows, no solid background, no hero, no weapon, no symbols.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```

### infernal-wings

Referenz: `frontend/public/art/characters/emerald-knight-original.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-06f3a4fa-2b80-498f-afac-6672dbe44fa5.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: One isolated demonic aura emblem: two magnificent symmetrical jagged shadow-energy wings rising and curling around an EMPTY center, deep obsidian-violet feathers/flame fins with glowing magenta edges and a few ember-purple shards. A pair of small ethereal violet eyes float above the empty center as a subtle magical aura detail. Strong sharp silhouette, beautifully layered hand-painted gradients and glossy magical depth; dark elegant fantasy, no gore. No actual character, no humanoid body, no scenery.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```

### astral-crown

Referenz: `frontend/public/art/characters/frost-scholar-sheet.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-54a18bea-82fe-46bc-87b1-ade483f76f1d.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: A single isolated anime hairstyle collectible based precisely on the hairstyle on the RIGHT of the supplied sheet: thick flowing short/medium layered tousled locks with a side part, long side-swept fringe and existing clean male silhouette. Recolor the hair to cool cosmic periwinkle #8d9be8 with deep blue-violet shadows and silky pale silver-blue highlights. Render hair only, empty space for the face; no face, eyes, skin, head, body or mannequin. This is a hairstyle, not a literal crown. No added jewels, stars or extra geometry.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```

### astral-regalia

Referenz: `frontend/public/art/characters/emerald-knight-sheet.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-4b0bc36f-2013-4446-8156-36bcc5513eab.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: A single isolated compact chibi armor outfit collectible, closely based on the BODY on the LEFT of the supplied sheet: ornate layered dark knight armor with beveled gold trim, asymmetric dragon-shaped shoulder guard, chest diamond gem, double belt, short split tabard and cape, gauntlets and armored boots. Recolor existing cloth/armor surfaces with cosmic violet #8176c7, preserve deep dark shading and aged gold trim. Show complete miniature outfit on an invisible body in a slight three-quarter angle, no head, no face, no exposed skin, no mannequin. Omit any weapons; do not invent helmet, wings or new armor parts.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```

### star-trail

Referenz: `frontend/public/art/characters/emerald-knight-original.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-cc9dd459-050c-4f51-ae91-0c866806f1b6.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: One isolated starlight aura emblem: luminous layered orbital trails form an elegant open ring around an EMPTY central character-sized space, with distinct four-pointed stars, tiny crystalline sparks, violet-blue translucent comet ribbons and a crescent sweep below. Deep indigo shadows, lavender blue #a99cef, warm pale-gold star centers. Painterly high-fantasy magical jewelry-like detail, not flat vector, no physical jewelry frame. No character, no landscape, no text.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```

### celestial-wings

Referenz: `frontend/public/art/characters/emerald-knight-original.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-3f3c4c62-406e-48f5-bda5-a5402b81e82e.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: One isolated angelic light aura emblem: a grand pair of ivory-gold luminous wings, gracefully curved around an EMPTY central character-sized space, layered sculpted feathers, delicate tiny golden stars and a soft floating halo above. Pearlescent cream highlights, subtle cool lavender shadows, warm gold edges. Elegant high-fantasy painterly detail and soft translucent magic; proud uplifting silhouette with generous open center. No character, no face, no body, no landscape.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```

### frost-crown

Referenz: `frontend/public/art/characters/frost-scholar-sheet.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-12d29545-2222-4fdc-beb0-9761455235b0.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: One isolated anime hairstyle collectible based precisely on the hairstyle on the RIGHT of the supplied sheet: thick layered tousled locks, side part, flowing side-swept fringe and clean compact male silhouette. Recolor the whole hairstyle to luminous glacier cyan #79cce4 with deep blue shadows, frosted pale-blue and silver-white silky highlights. Hair only, with empty face opening, no face, skin, eyes, head, body or mannequin. This is hair, not a literal crown; no ice crystals, jewelry or extra geometry.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```

### glacier-guard

Referenz: `frontend/public/art/characters/emerald-knight-sheet.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-902255ce-b6fe-4b4d-afd6-92f50fae35dc.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: One isolated compact chibi armor outfit collectible closely based on the BODY on the LEFT of the supplied sheet: ornate layered plate armor with beveled gold trim, asymmetric dragon shoulder guard, chest diamond gem, double belt, short split tabard and cape, gauntlets and boots. Recolor the existing cloth and armor surfaces with cold glacier blue #6fa9c7 while preserving deep blue-black shading and warm gold trim. Keep the existing sculpted armor shapes exactly recognizable. Complete miniature outfit on an invisible body in three-quarter angle; no head, face, skin or mannequin. No helmet, wings, weapons or newly invented armor geometry.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```

### frozen-runes

Referenz: `frontend/public/art/characters/emerald-knight-original.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-62255d33-70da-46fc-9ebc-9d87510d5278.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: One isolated mystic frost-rune aura emblem: two fine concentric magical circles and flowing misty light ribbons surround a visibly EMPTY center. Small abstract diamond-and-line sigils float around the rings, like imaginary frozen magic marks, not letters from any alphabet. Painterly faceted icy-violet edges, lavender #a78bfa glow, periwinkle depths, glacial blue accents and pearly-white highlights. Delicate tall shimmering ice-mist veil behind the circle, with a few suspended frost motes. No character, no actual text, no landscape, no pedestal.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```

### glacial-current

Referenz: `frontend/public/art/characters/emerald-knight-original.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-8e0ff5b7-f6d3-4666-9eac-4b8f1c05cc18.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: One isolated icy energy-stream aura emblem: several staggered tall streams of glacial cyan light rise on either side of an EMPTY character-sized central space, sculpted flowing ribbons with sharp crystalline light sparks and tiny suspended frozen motes. An open upward silhouette, dynamic but elegant, blue #85cde9 and brilliant frosted white with deep teal-blue shadows. Subtle translucent energy glow and painted glasslike depth, not ordinary orange fire, no ring-shaped jewelry. No character, no scenery, no weapons.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```

### cloud-crown

Referenz: `frontend/public/art/characters/forest-scout-sheet.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-91962465-965f-4ec3-b1d7-c6a298e42e6d.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: One isolated golden anime hairstyle collectible based precisely on the hairstyle on the RIGHT of the supplied sheet: voluminous swept layered bangs with a small high tied ponytail and the existing narrow gold leaf clasp. Recolor brown hair into sunlit warm gold #e7bd71 with amber shadows and ivory-silk highlights. Preserve the exact recognizable hairstyle silhouette, individual locks and existing clasp. Render hair only, empty face opening; no face, eyes, skin, head, body or mannequin. This is a hairstyle, not a literal crown; do not add monkey ears, a circlet, cloud decorations or new geometry.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```

### cloud-regalia

Referenz: `frontend/public/art/characters/ember-striker-sheet.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-92ef3a2f-efee-4bd8-8e94-361cc43f0288.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: One isolated compact chibi martial-adventurer outfit collectible based closely on the BODY on the LEFT of the supplied sheet: sleeveless overlapping tunic over dark undershirt, broad tied sash with split layered cloth panels, fitted dark trousers, forearm wraps and gloves, sturdy boots, existing small round belt charm. Recolor the red cloth into rich heavenly antique gold #bd9551 with warm sunlit highlights and deep bronze shadows, retaining black cloth and the existing gold seams. Arrange the complete miniature clothing set as if worn by an invisible chibi in the same slight three-quarter pose; leave empty gaps where exposed skin would be. No head, face, body flesh or mannequin. Preserve the existing clothing design; no helmet, wings, staff, new weapon or invented monkey armor.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```

### celestial-lotus

Referenz: `frontend/public/art/characters/emerald-knight-original.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-735faf42-3d9b-4c3c-98ee-3c27b1be68cd.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: One isolated celestial lotus aura emblem: luminous translucent petal blades unfurl into a large balanced lotus silhouette around a visibly EMPTY central character-sized space; layered inner petals surround a small floating seed of light and a lower cradle of gently curved lotus leaves. Predominantly soft jade-mint #91d7ad, pearlescent ivory highlights, subtle warm gold edges and pale turquoise magical wisps. Elegant rounded symmetrical petal silhouette, highly detailed polished painterly chibi-fantasy magic. No actual hero, face, hands, seated deity, lettering, landscape or water surface.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```

### solar-corona

Referenz: `frontend/public/art/characters/emerald-knight-original.png` (Stil-/Modulreferenz).

Generierungsquelle: `/Users/xv7ro/.codex/generated_images/01a106da-11b6-7122-9441-497c3a35ea18/exec-edf5bb09-70f3-442c-92af-ea87b9c7ae8f.png`.

Parameter: `transparent_background: true`; `referenced_image_paths` enthält genau die oben genannte Referenz.

```text
Use case: stylized-concept.
Asset type: one premium collection illustration for the original mobile fantasy game Everbloom.
Reference image role: existing painted chibi character/module style guide only. Match its sophisticated anime rendering, beveled materials, detailed light and shadow, crisp silhouette and slightly three-dimensional painted finish.
Subject: One isolated majestic solar-light aura emblem: a high open fan of long luminous gold rays forms a radiant sun crown behind an EMPTY character-sized center, with a fine sun-disc arc, several small floating golden sparks and a softly curved light base. Strong upward silhouette, warm pale gold #f1d58e, creamy white highlights, rich amber gold edging and delicate translucent magical depth. Original high-fantasy anime-chibi painterly finish, not flat vector, no physical crown or jewelry object. No character, face, deity, text, sun face or landscape.
Composition: exactly ONE centered collectible illustration on a genuinely transparent alpha background, square canvas, entire subject inside image with approximately 12 percent clear margin, readable at small mobile card size. Use a coherent three-quarter presentation. Keep the subject visually substantial and crisp.
Constraints: no text, letters, labels, numbers, watermark, logo, card border, floor, cast shadow, solid color rectangle, checkerboard pattern, photo or flat vector simplification. Background must be truly transparent. Do not include the reference character or the two-panel sheet.
```
