# Semantic mask corrections — 2026-09-08

Built-in ImageGen was used for all raster edits. No pixel editing, resizing or cropping was performed in code. Generated originals remain at their original paths. The user requested correction of hairstyle accessories, outfit coverage and glove classification. Painted sprite sheets and rig JSON files were not changed.

## Result and dimensions

| Asset | Previous mask | Corrected mask |
| --- | --- | --- |
| rose-runner | 1666 × 944 | 1667 × 943 |
| void-sorceress | 1667 × 943 | 1667 × 944 |
| moonblade | 1667 × 943 | 1667 × 943 |
| dawn-priestess | 1667 × 943 | 1668 × 943 |

## Verification

Every corrected mask was inspected visually against the painted source and original mask. Rose Runner, Dawn Priestess and Void Sorceress now assign head-mounted ribbons and ornaments to the red hairstyle layer; face features remain green and skin blue. Moonblade gloves are now green. The large false transparent areas inside Dawn clothing were filled green. Small internal contour artifacts remain around some ornament edges; the renderer applies its existing narrow morphology pass. Dawn retains a narrow black slit beside its left hair ribbon, so this mask should not be described as pixel-perfect.

The first accessory recolor outputs were rejected because some ornaments were incorrectly black or had conspicuous internal outlines. No rejected output was copied into the project. Eye-color coverage is separately handled by source-coordinate ellipse clips in the renderer; the mask corrections retain existing iris positions.

## rose-runner

Final generated source: /Users/xv7ro/.codex/generated_images/01a08151-ea3d-74b0-8b8d-69070cb352b2/exec-42d67fa1-8e20-428c-b1af-659716b53295.png

Project asset: /Users/xv7ro/dev/everbloom/frontend/public/art/characters/rose-runner-layers.png

Edit target: original project semantic mask. Dawn additionally used its painted sheet to identify dark clothing; its final local correction used exec-42f15403-af68-4a3c-a779-3a4142bc357b.png as the edit target.

### Exact prompt 1

```text
This is an EXACT COLOR-CLASS MASK EDIT, not new art. Keep pixel registration, image size about1667x943, framing and every external silhouette identical. Background black #000000. Pure flat colors, no gradients/textures. Do not add outlines, new lines or redraw anything. In this mask, on the RIGHT head change the currently GREEN hair ornament rose, ponytail tie and complete long flowing ribbon plus dangling lower-left gem into SOLID RED (#ff0000). Merge these solid RED regions with surrounding existing RED hair, absolutely NO BLACK OUTLINES OR SEAMS inside those recolored regions. The ribbon still exists in precisely its current position, it is just now red, including its whole interior. On the RIGHT face keep GREEN eyes/sclera/lashes, eyebrows, mouth unchanged. Blue skin, white irises stay unchanged. The whole LEFT body/outfit and blue wrist bands must be entirely unchanged. Return edited flat mask only.
```

## void-sorceress

Final generated source: /Users/xv7ro/.codex/generated_images/01a08151-ea3d-74b0-8b8d-69070cb352b2/exec-d55042e8-d77f-47b8-8f06-cc065789afef.png

Project asset: /Users/xv7ro/dev/everbloom/frontend/public/art/characters/void-sorceress-layers.png

Edit target: original project semantic mask. Dawn additionally used its painted sheet to identify dark clothing; its final local correction used exec-42f15403-af68-4a3c-a779-3a4142bc357b.png as the edit target.

### Exact prompt 1

```text
This is an EXACT COLOR-CLASS MASK EDIT, not new art. Keep pixel registration, image size about1667x943, framing and every external silhouette identical. Background black #000000. Pure flat colors, no gradients/textures. Do not add outlines, new lines or redraw anything. In this mask, change GREEN to RED (#ff0000) for every ornament/chain/ribbon ON THE HAIR in the RIGHT half: the upper-left crownlike clip, left dangling stars, entire thin hanging chains/gems, left long triangular ribbon; and the upper-right clip and all hanging chains/gems on the right ponytail. These objects must become SOLID RED, not black! Their interior and boundary must merge into the existing red region with NO BLACK OUTLINE and NO BLACK HOLES. Do NOT erase accessories. Preserve original black background gaps. Keep GREEN unchanged on right face eye sclera/lashes, eyebrows, nose and mouth. Keep blue face, white irises and all existing red hair unchanged. Entire LEFT outfit remains exactly unchanged. Return edited flat mask only.
```

## moonblade

Final generated source: /Users/xv7ro/.codex/generated_images/01a08151-ea3d-74b0-8b8d-69070cb352b2/exec-366fce4e-3797-46ac-ba8c-1eae516b6ca8.png

Project asset: /Users/xv7ro/dev/everbloom/frontend/public/art/characters/moonblade-layers.png

Edit target: original project semantic mask. Dawn additionally used its painted sheet to identify dark clothing; its final local correction used exec-42f15403-af68-4a3c-a779-3a4142bc357b.png as the edit target.

### Exact prompt 1

```text
This is an EXACT COLOR-CLASS MASK EDIT, not new art. Keep pixel registration, image size about1667x943, framing and every external silhouette identical. Background black #000000. Pure flat colors, no gradients/textures. Do not add outlines, new lines or redraw anything. Change ONLY the TWO BLUE FIST/HAND shapes on the LEFT headless body to PURE GREEN (#00ff00), because these are fully covered gloves. Specifically the blue area around x210–324,y460–550 and the blue area around x690–774,y460–543 must become green seamlessly merging with the existing green sleeves. No outlines at boundaries. Every other pixel class, every shape and all the RIGHT detached face and hair remain exactly unchanged. Do not recolor the right blue face. Return flat edited mask only.
```

## dawn-priestess

Final generated source: /Users/xv7ro/.codex/generated_images/01a08151-ea3d-74b0-8b8d-69070cb352b2/exec-95c994d8-dfe6-460c-b35d-fda91868d64c.png

Project asset: /Users/xv7ro/dev/everbloom/frontend/public/art/characters/dawn-priestess-layers.png

Edit target: original project semantic mask. Dawn additionally used its painted sheet to identify dark clothing; its final local correction used exec-42f15403-af68-4a3c-a779-3a4142bc357b.png as the edit target.

### Exact prompt 1

```text
This is an EXACT COLOR-CLASS MASK EDIT, not new art. Keep pixel registration, image size about1667x943, framing and every external silhouette identical. Background black #000000. Pure flat colors, no gradients/textures. Do not add outlines, new lines or redraw anything. Image1 edit target is a flat mask, Image2 is its painted source. Return only corrected flat Image1 mask. TWO PRECISE FIXES: (1) In RIGHT detached head, change currently GREEN hair jewelry, all hanging tiny gems/chains and the complete flowing ribbon left of face into RED (#ff0000), completely SOLID RED with no black inner outlines or holes. Keep facial GREEN eyebrows/eye sclera/lashes/mouth/nose unchanged; blue face and white irises unchanged. (2) In LEFT body, inspect Image2: the dark navy inner skirt/robe visible between its hanging front tabards and behind legs is real CLOTHING. The corresponding large black triangular inner holes around x420–625,y460–790 in Image1 must be filled pure GREEN to include that cloth; also lower-left interior cape lining around x80–230,y630–770 is real fabric and must be green. The body's mask should include all opaque source clothing, even dark cloth. Preserve genuine black background gaps between limbs/cape and below the hem; no filling exterior air. LEFT outside silhouette, hand shapes, pose and all other existing green stay exactly fixed. Pure semantic colors; no art, no lines.
```

### Exact prompt 2

```text
Use case: precise-object-edit. Edit this exact flat segmentation mask, keep canvas1667x943 and absolutely all shapes/coordinates unchanged. TWO LOCAL FILL CORRECTIONS ONLY: (1) LEFT body: Fill the large black triangular hole immediately right of the long center tabard, between x560 and625, y580 and772, with pure GREEN #00ff00. That whole triangle is dark cloth, NOT empty background. Do not change the real black gap between the legs below y785. (2) RIGHT head: fill the long black vertical tapered stripe down the left red ribbon (approximately x894–941,y420–740) with pure RED #ff0000. Also fill its small black jewelry-shaped pieces with red, because that entire ribbon and dangling decoration must be a solid red region. Keep the external black gap between ribbon and hair, and all other black background, unchanged. Leave all facial blue/green/white and all other existing red/green exactly as is. Flat colors only. No new black lines, outlines, texture or shadows. Output this edited mask only.
```
