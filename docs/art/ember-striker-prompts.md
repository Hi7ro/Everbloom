# ember-striker modular sprite prompts

Built-in image_gen was used. Generated originals are retained unchanged.

Source artwork: /Users/xv7ro/.codex/generated_images/01a08151-ea3d-74b0-8b8d-69070cb352b2/exec-a4c24ee8-ad50-4c9c-8d6d-64b78e84b745.png

## Sprite sheet

Use case: stylized-concept.
Asset type: production modular anime chibi sprite sheet for Everbloom, not a concept board.
Input image 1 is the approved original for painted anime rendering quality, male face identity, skin and eyes. Input image 2 is the EXACT TWO-COLUMN ASSET LAYOUT reference. Create a new character variant with that same parts layout, body pose and facing direction, changing only the specified hairstyle and outfit design.
Canvas: wide 1696 x 960 landscape. Pure solid black #000000 background, no checkerboard, no transparency pattern, no scenery, no ground shadow, no labels or words, no border.
LEFT HALF ONLY: a completely headless standing outfit/body set in a three-quarter view facing slightly right. Include a small neck attachment/stub, complete shoulders, torso, arms, hands, hips, legs, feet and every clothing/accessory item. Both grounded feet visible. Complete all collar and shoulder areas even where hair would cover them after assembly. The left body should occupy roughly x80–780 and y150–880, comparable to image 2. Absolutely no head, face or hair in the left half.
RIGHT HALF ONLY: a single large detached complete head including face, both visible ears and the ENTIRE specified hairstyle, with only a small bare neck stub under chin. No clothing, collar, accessories or body below the head. Match the head placement/scale in image 2, roughly x870–1620 and y40–700. No object crosses the middle divider; keep a clean gap. Do not assemble head and body.
Face invariants: original male face with warm medium tan skin, large luminous emerald green anime eyes, strong straight dark eyebrows, more defined male jaw; calm small confident smile, clean face with no blush or makeup. Maintain same head direction and chibi facial identity as both references. Premium crisp linework, layered soft painted cel shading, dimensional hair strands, careful fabric/metal rendering and restrained highlights. Own IP only. Do not increase the head proportion from the reference; body and head are separate sprite parts for later scaling and recombination.
VARIANT: Ember Striker, male. Hairstyle on RIGHT: copper-red cropped shonen hair, distinct short textured flame-like locks pointing upward and to the right with close trimmed sides, visibly different from the original long silver spiky hair; no long strands, no ponytail. Outfit LEFT: beautifully tailored red and charcoal training gi, sleeveless layered outer gi over a short dark athletic shirt, hand wraps and padded sparring gloves, athletic charcoal trousers, sturdy ankle training boots, tied fabric belt with a single small ember charm. Athletic cloth silhouette, detailed seams and wrapped fabric, no heavy metal armor and no weapons. Show masculine squared shoulders and strong compact stance. Bare small neck attachment and limited skin at forearms if visible; same warm tan skin.

## Selected semantic mask

Source: /Users/xv7ro/.codex/generated_images/01a08151-ea3d-74b0-8b8d-69070cb352b2/exec-911e910e-d21d-4e43-8aa9-1098a7167019.png

Use case: precise-object-edit. Create a clean SOLID-FILLED semantic mask of this attached original sprite sheet. This must be a closed silhouette matte, NOT a line drawing.
Trace the original position and outer contours exactly. Keep the same 1667 x 944 canvas.
LEFT BODY: flood every item of clothing, black shirt, gloves, armor, cape, footwear, gear, weapon, book and charm with one continuous solid PURE GREEN #00ff00 shape. Absolutely no thin black lines inside it. Eliminate every seam line, every fabric fold line, every boot sole line, every buckle border, every belt border, every collar line. These all become GREEN like the surrounding outfit. Preserve only actual empty background between limbs/objects and cape outer cutouts as black, never shadows or seams inside a garment. Even the inside of a black collar is GREEN. True bare upper-arm skin, small bare neck stub and exposed fingertips alone are BLUE #0000ff. Gloves and wrapped fabric remain GREEN.
RIGHT HEAD: hair including ALL tied-back strands and the entire hair tie/band is PURE RED #ff0000 as one filled hair silhouette with no interior lines. Blue #0000ff for bare face, ears and short neck. Precisely trace original eyebrows, eyelash/liner shapes, eye sclera whites and mouth-line shape in GREEN #00ff00. The TWO green-colored IRIS disks are the ONLY WHITE #ffffff areas: exactly two white solid ovals including pupil/highlights, not the whole eye socket. Preserve pupil/iris positions and sizes from original. Zero black face-line cutouts.
BLACK #000000 background only. Flat colors. No labels, outlines, texture, light, gradient or shading. Copy positions, don't restyle. This is an extraction matte for the ORIGINAL ART and must preserve all solid interior material instead of creating holes. Do not crop or resize.

## Mask contract and validation

Rig metadata: [ember-striker-rig.json](../../frontend/public/art/characters/ember-striker-rig.json).

Red: hair including its band. Green: clothing/accessories and non-skin facial features. Blue: exposed skin. White: exactly two iris regions. Black: background. All pixels remain as generated; no programmatic raster editing was performed. Sheet and mask dimensions may differ slightly; render the mask at the sheet dimensions with preserveAspectRatio="none". Masks are generated approximations and should be checked visually during final composition. Eye centers were measured from the two white mask clusters and normalized to sheet coordinates; neck anchors were visually estimated.

{
  "id": "ember-striker",
  "width": 1667,
  "height": 944,
  "divider": 833.5,
  "maskWidth": 1665,
  "maskHeight": 944,
  "body": {
    "neckX": 461,
    "neckY": 168,
    "footY": 901
  },
  "eyes": {
    "left": {
      "x": 1174.0,
      "y": 499.9
    },
    "right": {
      "x": 1402.7,
      "y": 530.3
    }
  }
}

## Superseded first mask prompt

Use case: precise-object-edit.
Edit target: the attached modular character sprite sheet. Produce only its pixel-aligned SEMANTIC SEGMENTATION MASK, not a new illustration.
Keep exactly the input canvas dimensions (1667 x 944), framing, outlines, positions, shape sizes and two-column layout. No repositioning, no scaling, no redrawing silhouettes, no added parts. Every output pixel position must correspond to the same input pixel position.
Use only these solid flat colors with minimal edge antialiasing:
BLACK #000000 = all empty background and true gaps between limbs, fabric, hair strands.
RED #ff0000 = the complete HAIR silhouette on the right, including every strand, back hair and any hair tie attached to the hairstyle. Do not include the face.
GREEN #00ff00 = all outfit/body CLOTHING, ARMOR, gloves, boots, cape, weapons, quiver, belts, books, gems, charms and accessories in the left column, preserving every external outline and empty gap. No interior detail or lines.
BLUE #0000ff = the entire exposed FACE/EARS/NECK skin region on the right, plus all exposed neck, arms and finger skin on the left. The full face region is solid blue, INCLUDING locations of eyebrows, eyelids, white sclera, nose, mouth: do not cut holes for those features.
WHITE #ffffff = ONLY the two colored IRIS regions in the eyes on the right. Each iris is one solid white shape filling its whole colored iris including pupil and reflected highlights. The sclera/white area around each colored iris remains BLUE. There must be exactly two white regions in the entire image and absolutely no white anywhere else.
This is a flat segmentation label map. Zero painterly shading, zero textures, zero gradients, zero facial line details. Carefully trace the exact source edge locations and eye iris locations. Retain the source outline; do not merge the separated head and body.

## Superseded intermediate mask prompt

Use case: precise-object-edit. Input image 1 is the original sprite sheet to trace and align to. Input image 2 is a rejected first mask: use its overall positions but correct it according to the exact material contract below. It wrongly marked face features blue and clothing seam lines black; it also wrongly marked covered gloves/sleeves blue. Fix these errors.
Produce a flat semantic material mask, exactly pixel-aligned to the attached ORIGINAL ARTWORK. Use source dimensions and framing unchanged. No redrawing, no scaling, no layout changes.
Only flat #ff0000 red, #00ff00 green, #0000ff blue, #ffffff white, #000000 black:
RED = all scalp hair, including undercut hair and attached hair tie.
GREEN = all non-skin outfit and accessory material on the left; PLUS eyebrow shapes, eyelash/eyeliner shapes, eye sclera whites and small mouth-line shape on the right. These small face features are GREEN, not blue or black.
BLUE = only actual visible bare skin (face, ears, neck, any bare upper arms or fingertips). Not covered gloves, not fabric sleeves, not facial feature shapes. Preserve actual warm-skin shapes exactly.
WHITE = exactly two colored irises, including the whole pupil and iris highlights. Keep full iris oval shape, no black pupil holes. Sclera surrounding each iris is GREEN.
BLACK = background ONLY and genuine empty spaces. Never draw black outlines, seams, creases or any internal lines inside the colored material silhouettes. Garments, cape, body, belts, book, charms and boots must form ONE continuous GREEN mass except actual background gaps or truly exposed BLUE skin. The original illustration's dark fabrics and gloves are still GREEN material, never black.
No shading or texture; minimal edge antialiasing only. Every mask boundary must trace the exact original artwork boundary. Right face should have blue skin with green brows/eye-sclera/liner and tiny green mouth, white irises and red hair. It is a label map, not a stylized portrait.
This figure has bare upper arms and some exposed fingertips: trace those exact SKIN areas BLUE; gloves, wraps and dark shirt are GREEN, including the central dark shirt formerly left black.
Keep source image size exactly 1667 x 944.
