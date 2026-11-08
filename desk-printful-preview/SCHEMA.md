# `.jimmi.json` — Jimmi's Design Shop design file (schema v2; v1 still loads)

```json
{
  "schema": "jimmi.design",          // required, constant
  "version": 1,                      // required, integer; bump on breaking changes
  "name": "A1 Navy & Yellow",        // ≤ 60 chars, display name only (never printed)
  "notes": "Free notes for JimmiBot",// never printed
  "author": "Guy",                   // "Guy" | "JimmiBot"
  "created": "2026-10-30T08:50:00-06:00", // ISO-8601
  "updated": "2026-10-30T09:10:00-06:00", // ISO-8601, set on export
  "garment": "leggings",             // leggings | joggers | tee | longsleeve | hoodie | zip
  "view": "front",                   // view shown when opened: front | back
  "colors": {
    "base":  "#14204a",              // garment color, #rrggbb
    "logo":  "#ffd400",              // Buff Jimmi body + wordmark ink, #rrggbb
    "hair":  "#ffd400",              // spiky hair ink, #rrggbb
    "stripe": null,                  // side stripe #rrggbb, or null for none
    "stripeWidth": 7                 // stripe width in canvas units (2–14)
  },
  "logo": {                          // Buff Jimmi logo (outline oval head, no face, spiky hair)
    "placement": "calf",             // preset name or "custom" after dragging
    "side": "front",                 // front | back
    "x": 240, "y": 585,              // centre, canvas units (600 × 800 garment canvas)
    "scale": 1.0                     // 1.0 = 150 units tall (0.2–2)
  },
  "wordmark": {                      // "Jimmi / at the gym" wordmark
    "placement": "down the leg",     // preset, "custom", or "none"
    "side": "front",
    "x": 372, "y": 440,
    "scale": 1.0,                    // 1.0 = 290 units wide (0.2–2)
    "rotation": -84.6,               // degrees, clockwise positive
    "hidden": false                  // true = no wordmark
  }
}
```

**Coordinates:** everything sits on a 600 × 800 garment canvas, with the origin at the top left. Exports scale it to 1500 × 2000 px per side. A design that uses both sides exports both views side by side, 3000 × 2000.

**Presets.** Logo presets for pants are hip, thigh, calf, waistband, and back. Logo presets for tops are chest, left chest, back, and hip. Wordmark presets are down the leg, under the logo, chest, down the sleeve, and none. A preset is only a label. The x, y, and scale values are what count.

**Brand rule:** the only art is the Buff Jimmi logo and the "Jimmi / at the gym" wordmark. The file has no free-text or other-graphic fields. `name` and `notes` are never rendered on the print layer.

**Share links:** `…/desk/?d=<base64url(UTF-8 JSON)>`. The value has no padding.

**Bundle from "Send to JimmiBot":**
- `<slug>.jimmi.json`
- `<slug>-mockup.png`, the garment mockup
- `<slug>-print.png`, a transparent print layer with only the stripe, logo, and wordmark, clipped to the garment outline

**Headless render (box):** `node desk/tools/render_design.js file.jimmi.json -o outdir [--px 2000]`

## Schema v2 (current)

v2 keeps every v1 field and adds the fields below. The app and `render_design.js` accept both versions. A v1 file is upgraded on load: `version` becomes 2, `designer` defaults to `{name: author, role}`, `status` becomes `"draft"`, and `history` becomes `[]`. Saving always writes v2.

```json
{
  "version": 2,
  "editor": "tee",                    // present = Tee Editor design; absent = classic garment (v1 behaviour)
  "zones": {                          // Tee Editor only. Each zone holds sticker objects
    "front": [], "back": [], "leftSleeve": [], "rightSleeve": [
      { "id": "s3k9q2a",              // unique per design
        "el": "logo",                 // logo | body (logo, no hair) | hair | word (wordmark) | combo (logo + wordmark)
        "colors": { "body": "#ffd400", "hair": "#ffd400" },  // body = logo body / wordmark ink
        "x": 500, "y": 192,           // centre, 600x800 canvas units as seen on the FRONT view
        "scale": 0.7,                 // 0.1-3 (logo 1.0 = 100 units tall, wordmark 1.0 = 170 units wide)
        "rotation": 45,               // degrees, clockwise, any angle (-180..180)
        "z": 1 }                      // stacking order inside the zone (higher = on top)
    ]
  },
  "designer": { "name": "Janelle", "role": "designer" }, // owner | designer | bot
  "status": "draft",                  // draft | submitted | approved | rejected
  "reviewNotes": "",                  // Guy's notes (required on reject)
  "history": [ { "at": "2026-10-30T10:00:00-06:00", "by": "Janelle", "role": "designer", "action": "submitted", "note": "" } ],
                                      // actions: submitted, resubmitted, rejected, approved, exported
  "creditTag": false                  // true = small "designs by <name>" tag on the print PNG (default off)
}
```

**Zones and print areas.** All values are in canvas units: front `[178,170,244,325]` (12″ × 16″), back `[178,150,244,325]` (12″ × 16″), left sleeve `[430,122,140,140]` (5″ × 5″, on the viewer's right in the front view), and right sleeve `[30,122,140,140]`. Stickers are clipped to their zone's print rect and, on a sleeve, to the sleeve shape. Both sleeves show in both views. In the back view, a sleeve's position is mirrored, but the art is not flipped.

**Brand rule (v2).** A sticker's `el` must be one of the five Jimmi elements listed above. There is no free text and no other clip art. Validation rejects any other value.

**Credits.** `designs by <name>` appears on the design card, the inbox, and the mockup PNG footer. It never appears on print PNGs unless `creditTag` is true.

**Bundle (v2 Tee Editor):** `<slug>.jimmi.json`, `<slug>-mockup.png` (front and back side by side with a credit footer), and `<slug>-print-front.png`, `-print-back.png`, `-print-left-sleeve.png`, and `-print-right-sleeve.png`. The print PNGs are transparent at 150 dpi, so the front and back are 1800 × 2400 and each sleeve is 750 × 750. Classic garments still export `-mockup.png` and `-print.png`.

**Review workflow.** This is file and link based, with no backend. A designer taps **Submit to Guy**, which sets `status: "submitted"` and shares the JSON, the mockup, and a `?d=` link through the Web Share API. If sharing isn't available, the files download and a prefilled `mailto:guysmoney@gmail.com` link appears. The owner opens the submission by file, link, or drop, then reviews it in the Submissions tray. **Approve** sets `approved` and runs Send to JimmiBot. **Reject** requires notes, sets `rejected`, and shares the file and link back. The designer then revises and resubmits. There are no accounts: the role is a localStorage label (`jimmiProfile`), so anyone with the URL can pick Owner.

## v2 additions (Oct 31: leggings editor, repeat tool, new stickers). Still `version: 2`, and every older v2 file loads unchanged.

- **`garment: "leggings"` with `editor: "tee"`** uses the leggings zone set instead of the tee zones:
  - `waistband` `[160,82,280,50]` (14″ × 2.5″, front view)
  - `waistbandBack` (same rect, back view)
  - `rightLeg` `[150,138,150,612]` and `leftLeg` `[300,138,150,612]` (7″ × 30″, front view)
  - `seat` `[150,138,300,612]` (back view)
  
  Stickers are clipped to the zone rect and the leggings outline. Tee designs keep `front/back/leftSleeve/rightSleeve`. A zone from the other set fails validation.
- **New sticker `el` values:**
  - `head`: just the Jimmi head (blank faceless oval outline plus spiky hair; `colors.body` = head, `colors.hair` = hair; 1.0 = 80 units tall)
  - `skinny`: Skinny Jimmi logo, one color (1.0 = 100 units tall)
  - `leg`: "Jimmi" letters stacked upright down the leg, clean letters with no dashes, one color (1.0 = 300 units tall)
  
  The art is transparent white PNGs in `assets/stickers/`, embedded in `assets2.js`.
- **Optional `group` on a sticker** (string). Copies made by the Repeat tool share one `group` id:
  - Repeating a grouped sticker again re-tiles the whole group.
  - **Ungroup** removes the field.
  - **Delete group** removes every copy.
  - Readers that don't know `group` can ignore it.
- **Repeat modes:**
  - `wrap` (leggings): N copies evenly spaced around the full waistband, splitting front and back, so pitch = 560/N.
  - `row`: across the zone.
  - `column`: down the zone.
  
  Spacing is the gap between copies in canvas units. Copies shrink if they would overlap or overflow the band height.
- **Leggings bundle:** `-mockup.png` (front and back), `-print-waistband.png`, `-print-waistband-back.png`, `-print-right-leg.png`, `-print-left-leg.png`, `-print-seat.png`

## Classic → editor migration (Oct 31)
Classic designs (no `editor` field) whose `garment` is `leggings`, `tee`, or `bottle` are migrated on load. This covers v1 files, inbox seeds, and starter cards.
- `editor` is set to `"tee"` and `migratedFrom` to `"classic"`.
- `logo` becomes an `el:"logo"` sticker with scale = old scale × 1.5.
- `wordmark` becomes an `el:"word"` sticker with scale = old scale × 290/170, keeping its rotation.
- Each sticker goes into the zone that contains its x/y on its `side`. Leggings use the same 600×800 canvas, so positions carry over exactly. On a tee, stickers are clamped into the front/back print rect.
- `colors.stripe` / `stripeWidth` still render on leggings and print on the leg layers.
- The original `logo` / `wordmark` fields are kept, so v1 readers still work. Joggers, hoodie, long sleeve and zip stay in the classic editor.

## Curved text stickers (Oct 31, optional v2 addition)
A sticker can be `el:"text"` with these extra fields:
- `text` must be one of `"JIMMI"`, `"Jimmi"`, `"at the gym"`, `"Jimmi at the gym"`, `"Jimmi @ the gym"`. Any other value fails validation, and there is no free text.
- `font` is `"script"` (Satisfy, close to the wordmark) or `"round"` (Comfortaa Bold, like JIMMI down the leg). Both are embedded in `fonts.js`, so they work offline and on file://.
- `curve` is the degrees of arc, from -360 to 360. Positive values arch over the top, negative values make a smile underneath, and 0 is straight.
- `spacing` is the letter spacing in logical units at size 1.
- `colors.body` is the ink. `x`, `y`, `scale`, `rotation`, `z` and `group` work the same as on other stickers.

The text is drawn as real canvas text along a circle with radius = arc length / angle, in both the mockup and the print layers. A **Badge** is a head sticker with `text:"Jimmi"` (script, +150) above it and `text:"at the gym"` (round, -130) below it, all sharing one `group`.

## Stripe stickers (Oct 31, optional v2 addition)
A sticker can be `el:"stripe"` with these extra fields:
- `lines` is 1, 2 or 3 (single, double or triple).
- `thick` is the thickness of each line in **inches**, from 1/32 (0.03125) to 2. Lines are converted at 244/12 ≈ 20.33 logical units per inch, the front-body scale, so 1/32″ is about 1 px in the editor.
- `len` is the length in logical units, from 6 to 760.

The gap between lines equals the line thickness, with a minimum of 1/16″. `scale`, `rotation`, `colors.body`, `x`, `y`, `z` and `group` work as usual. Length can be changed on its own with the Length slider or the corner drag handle, which stretches only along the stripe and leaves the thickness alone. Stripes added to a leg zone start at rotation 90 (running down the leg).

## Gym Shorts (Oct 31, optional v2 addition)
- `garment:"shorts"` with `editor:"tee"`. The shorts are drawn above the knee, with an elastic waistband and a side split hem.
- Zones: `shWaist` (front waistband, 15″×2.5″), `shWaistBack` (back waistband), `shRightLeg` and `shLeftLeg` (8″×10″ each, front view), and `shBack` (16″×10″, back view).
- All sticker types are allowed, including text and stripe. Repeat mode `wrap` goes around `shWaist` and `shWaistBack`. `colors.stripe` and `colors.stripeWidth` draw a side stripe that follows the shorts' outer seams.
- Switching between shorts and leggings/joggers in the Style row maps zones index by index (waist→waistband, waistBack→waistbandBack, rightLeg→rightLeg, leftLeg→leftLeg, back→seat) and pulls art into the new zone. Exports produce `print-sh-*` layers.

## Lower sleeves and hem band (Oct 31, optional v2 addition)
- **Long sleeve, hoodie and zip** get four lower-sleeve zones: `leftForearm` and `rightForearm` (3.5″×9″), and `leftWrist` and `rightWrist` (3″×3″, just above the cuff). They have `sleeve:1,low:1,side:±1`, show in both front and back views (mirrored like the upper sleeves), and clip to the lower sleeve outline. New stickers lie flat along the sleeve's length: wide art and text are rotated `side*(90-5.1)°` so they read along the arm, upright art is tilted `-side*5.1°`, and the scale fits the narrow zone. These zones have no wrap.
- **Hoodie and zip** also get `hemFront` and `hemBack` (20″×1.75″, `hem:1`) on the ribbed bottom band. Stickers there are horizontal and fitted to the band height. Row repeat is allowed; wrap is not.
- The tee does not get these zones. Switching a top to a style without them moves that art to the matching upper sleeve, or to the front/back body for the hem.
- Exports add `print-left-forearm`, `print-right-forearm`, `print-left-wrist`, `print-right-wrist`, `print-hem-front` and `print-hem-back`.

## Optional: saving & pairing (additive, v2-compatible)
- `saveId` (string): id of this design in the on-device library (`localStorage["jimmiDesigns"]`, array of `{id,name,kind,base,at,design}`).
- `pair` (object, optional): `{id, name, kind, setId}` — the partner design's `saveId`/name/kind and a shared `setId`. Both designs carry the same `setId`. On the store, items sharing a `setId` can be offered as a set; each item remains individually buyable.
