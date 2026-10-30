# `.jimmi.json` — Jimmi's Design Shop design file (schema v1)

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
