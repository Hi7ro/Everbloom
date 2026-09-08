# abyss-walker modular sprite prompts

Built-in image_gen was used. Generated originals are retained unchanged.

Source artwork: /Users/xv7ro/.codex/generated_images/01a08151-ea3d-74b0-8b8d-69070cb352b2/exec-0064d8b9-9ef7-46dd-9f54-088235a1c567.png

## Sprite sheet

Use case: stylized-concept.
Asset type: production modular anime chibi sprite sheet for Everbloom, not a concept board.
Input image 1 is the approved original for painted anime rendering quality, male face identity, skin and eyes. Input image 2 is the EXACT TWO-COLUMN ASSET LAYOUT reference. Create a new character variant with that same parts layout, body pose and facing direction, changing only the specified hairstyle and outfit design.
Canvas: wide 1696 x 960 landscape. Pure solid black #000000 background, no checkerboard, no transparency pattern, no scenery, no ground shadow, no labels or words, no border.
LEFT HALF ONLY: a completely headless standing outfit/body set in a three-quarter view facing slightly right. Include a small neck attachment/stub, complete shoulders, torso, arms, hands, hips, legs, feet and every clothing/accessory item. Both grounded feet visible. Complete all collar and shoulder areas even where hair would cover them after assembly. The left body should occupy roughly x80–780 and y150–880, comparable to image 2. Absolutely no head, face or hair in the left half.
RIGHT HALF ONLY: a single large detached complete head including face, both visible ears and the ENTIRE specified hairstyle, with only a small bare neck stub under chin. No clothing, collar, accessories or body below the head. Match the head placement/scale in image 2, roughly x870–1620 and y40–700. No object crosses the middle divider; keep a clean gap. Do not assemble head and body.
Face invariants: original male face with warm medium tan skin, large luminous emerald green anime eyes, strong straight dark eyebrows, more defined male jaw; calm small confident smile, clean face with no blush or makeup. Maintain same head direction and chibi facial identity as both references. Premium crisp linework, layered soft painted cel shading, dimensional hair strands, careful fabric/metal rendering and restrained highlights. Own IP only. Do not increase the head proportion from the reference; body and head are separate sprite parts for later scaling and recombination.
VARIANT: Abyss Walker, male. Hairstyle on RIGHT: raven black dramatic undercut with a clearly defined close-trimmed side and angular side-swept long top fringe, cool charcoal/purple highlights to keep separate strands legible on black, no pale original hair and no top knot. Outfit LEFT: cohesive obsidian gothic plate armor with refined bevels, angular overlapping shoulder plates, gauntlets, armored boots, subtle violet light in a faceted chest core, dark flowing cape clearly outlined by cool rim light. A single original straight blade in a scabbard secured at the hip; no enormous weapon, no loose props, no recognizable franchise symbols. Restrained sharp metallic edges and dark high-fantasy elegance. Black metal should remain visible against black with dimensional cool highlights.

## Layout correction

Use case: precise-object-edit. Edit ONLY the placement/scale of the LEFT headless body in this attached two-column sprite sheet. Preserve the artwork exactly, preserve every outfit detail, head face hairstyle and all right-column pixels unchanged. Keep the same 1614x975 canvas and solid black background.
The body cape currently reaches too close to and across x807, the middle divider. Move and uniformly scale ONLY the complete LEFT headless body, with cape/blade/boots included, so its ENTIRE silhouette fits between x35 and x750, from y150 to y915. Body top neck remains at y155 approximately and boots remain grounded around y915. Rightmost cape point MUST be left of x760, leaving black gap before middle at x807. No parts may cross divider. Do not delete or crop cape tips. Do not redesign anything. Keep right head exactly at its current location, scale, pose and style. No added head to left body; no clothing under right head.

## Selected semantic mask

Source: /Users/xv7ro/.codex/generated_images/01a08151-ea3d-74b0-8b8d-69070cb352b2/exec-3f470392-86ce-4403-83e0-467ef1844cf1.png

Use case: precise-object-edit. Input image 1 is the original sprite sheet to trace and align to. Create its first semantic mask.
Produce a flat semantic material mask, exactly pixel-aligned to the attached ORIGINAL ARTWORK. Use source dimensions and framing unchanged. No redrawing, no scaling, no layout changes.
Only flat #ff0000 red, #00ff00 green, #0000ff blue, #ffffff white, #000000 black:
RED = all scalp hair, including undercut hair and attached hair tie.
GREEN = all non-skin outfit and accessory material on the left; PLUS eyebrow shapes, eyelash/eyeliner shapes, eye sclera whites and small mouth-line shape on the right. These small face features are GREEN, not blue or black.
BLUE = only actual visible bare skin (face, ears, neck, any bare upper arms or fingertips). Not covered gloves, not fabric sleeves, not facial feature shapes. Preserve actual warm-skin shapes exactly.
WHITE = exactly two colored irises, including the whole pupil and iris highlights. Keep full iris oval shape, no black pupil holes. Sclera surrounding each iris is GREEN.
BLACK = background ONLY and genuine empty spaces. Never draw black outlines, seams, creases or any internal lines inside the colored material silhouettes. Garments, cape, body, belts, book, charms and boots must form ONE continuous GREEN mass except actual background gaps or truly exposed BLUE skin. The original illustration's dark fabrics and gloves are still GREEN material, never black.
No shading or texture; minimal edge antialiasing only. Every mask boundary must trace the exact original artwork boundary. Right face should have blue skin with green brows/eye-sclera/liner and tiny green mouth, white irises and red hair. It is a label map, not a stylized portrait.
This figure wears gloves and covered arms: ALL gloves and arms are GREEN. No blue hands. Only a genuine bare neck stub may be BLUE in left column.
Keep source image size exactly 1613 x 975.

## Mask contract and validation

Rig metadata: [abyss-walker-rig.json](../../frontend/public/art/characters/abyss-walker-rig.json).

Red: hair including its band. Green: clothing/accessories and non-skin facial features. Blue: exposed skin. White: exactly two iris regions. Black: background. All pixels remain as generated; no programmatic raster editing was performed. Sheet and mask dimensions may differ slightly; render the mask at the sheet dimensions with preserveAspectRatio="none". Masks are generated approximations and should be checked visually during final composition. Eye centers were measured from the two white mask clusters and normalized to sheet coordinates; neck anchors were visually estimated.

{
  "id": "abyss-walker",
  "width": 1613,
  "height": 975,
  "divider": 806.5,
  "maskWidth": 1614,
  "maskHeight": 975,
  "body": {
    "neckX": 421,
    "neckY": 187,
    "footY": 904
  },
  "eyes": {
    "left": {
      "x": 1179.0,
      "y": 477.7
    },
    "right": {
      "x": 1370.7,
      "y": 515.6
    }
  }
}
