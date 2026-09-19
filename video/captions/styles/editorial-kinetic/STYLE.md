# Editorial Kinetic

Stable ID: `editorial-kinetic`. Component: `assets/caption-code/src/EditorialKinetic.tsx`;
pure geometry and timeline functions: `src/editorial.mjs`. The gallery GIF shows this component.
Its dark background is preview-only.

## Color roles

| Role | Default | Application |
| --- | --- | --- |
| `base` | `#F7F4ED` | Supporting text and ungraded primary text |
| `creamTop` / `creamBottom` | `#E1F8F2` / `#77D8C8` | Vertical sea-glass teal emphasis |
| `pinkTop` / `pinkBottom` | `#FFF0CD` / `#E6BB70` | Alternate champagne-gold title emphasis |
| `accent` | `#F2C879` | Handwriting and thick underline |
| `stroke` | `#F7F4ED` | Thin curved underline |
| `shadow` | `#111B22` | Subtle 60%-opacity shadow; no outlines or boxes |

Show these defaults and the user's named palette. Map palette entries to roles only
by explicit choice. Partial explicit requests override those roles and accept the
remaining defaults. Do not reopen an accepted selection. Usually emphasize one
word/group per composition; gradients and underlines are optional.

Palette direction: luminous ivory for hierarchy, cool sea-glass teal for the main
focal word, and restrained warm gold for accents. The teal/gold temperature contrast
separates emphasis from decoration; the alternate title reuses the gold family to
keep the overall palette coherent. This is a design choice, not a guarantee of
contrast against every footage background: inspect over the intended footage.
Legacy keys `cream`/`pink` and `orange`/`white` remain stable for saved projects;
they now select primary/alternate gradients and accent/light underlines.

## Geometry and type

- **Poppins Bold** for primary and supporting sans text, **Libre Baskerville Italic**
  for editorial secondary phrases, **Paul Neave's Lazy Dog** for occasional handwriting.
  Libre Baskerville is the user-authorized free alternative to commercial Marion Italic.
  Lazy Dog is the public-domain Paul Neave face, not commercial Lazydog Kids.
  Fonts, licenses/dedication, original names, character maps and SHA-256 hashes are
  bundled in `fonts/`. Poppins and Libre Baskerville use SIL OFL 1.1.
- Copy the exact files into the project. Unique FontFace names prevent installed
  fonts from hiding missing assets. Verify SHA-256 before measurement, load all three
  faces, and measure canvas glyph bounds with the actual weight/style. Reject missing
  glyphs rather than silently falling back (Lazy Dog has a limited character set).
- At 1080×1920: primary 128 px (starting range 100–150), supporting sans 76 px
  (64–90), serif 86 px (70–100), handwriting 76 px. Scale by `min(width,height)/1080`.
  Center the whole composition around 60% frame height, maximum 84% frame width.
  Reserve entrance travel, italic overhangs, shadows and decoration inside safe bounds.
- Normally two lines, occasionally three. Choose a kicker/title, title/deck or
  sandwich template from emphasis position, preserving transcript casing,
  punctuation and reading order. Center rows with tight measured spacing. No overlap
  is required; add it only in a reviewed project when readability permits.
- Default focal word is the final word; override `emphasisIndex` based on meaning.
  Short supporting lines use serif; longer lines use sans. Explicit line roles let
  short phrases sit above or below the keyword. Handwriting is opt-in per line.
- Normalize into short, semantically reviewed phrases before layout. A supplied
  sentence is one composition. Split long text at natural boundaries using unchanged
  word objects/timestamps. Automatic uniform fitting stops below 65%; a phrase or
  individual long word that still cannot fit raises an actionable error. Review
  phrase segmentation or explicitly override sizes; never truncate words or timing.
- Measure the complete composition before revealing anything. All word/group
  coordinates are fixed and remain fixed during reveal. No active-word recoloring.

## Timing

Use `frame * 1000 / fps - sourceOffsetMs`. Indices identify words even when spelling
repeats. Reveal individual words or natural groups of 2–3, beginning at the first
word's original start timestamp. Default supporting lines of up to three words
enter together; longer lines reveal individual words. Review groups for meaning.

Opacity 0→1 plus 28 px translation, default 220 ms, cubic ease-out `1-(1-p)^3`.
Supporting kickers enter from left, primary keywords from bottom, following decks
from right; explicit group overrides also support top. Directions belong to groups,
not random words. Clamp duration to group speech duration and the next group's
start, never delaying later speech. Revealed words stay in place until phrase exit;
no bounce, overshoot or continuous movement.

Keep the full composition through its final word's end. Fade out over up to 140 ms,
clamped to the gap before the next phrase; adjacent phrases switch without overlapping
tails. Every value is a pure function of saved design, metrics and source time, so
arbitrary seeking gives the same pixels as sequential playback. The final overlay
has transparency and no audio.

## Underlines

### Choose by editorial purpose

There are **two distinct treatments**, not merely two colors of the same underline.
Choose per phrase while reviewing the transcript; the renderer does not interpret
meaning or automatically alternate treatments. Save the choice in
`styleOptions.phrases[phraseIndex].underline` along with the focal word/group.

| Treatment | Saved value | When to use it |
| --- | --- | --- |
| Curved ivory stroke, 5 px | `white` | The preferred underline for ordinary editorial emphasis: a revealing detail, reflective phrase, qualifier, or a conversational word worth noticing. Especially useful with italic serif text or a headline that already has strong size/color emphasis. It should feel like a handwritten annotation. |
| Bold gold bar, 12 px | `orange` | Reserve for a major structural beat: the central claim, a decisive contrast, a key result/number, or the main action in a closing CTA. Usually pair with a short bold sans keyword. It should feel like a deliberate headline marker. |
| No underline | `none` | Connective/explanatory phrases, very brief beats, or compositions already clear through typography, gradient, or handwriting. Most phrases do not need an underline. This remains the renderer's default. |

Choose **whether emphasis needs an underline first**, then choose its weight. When
an underline is useful but there is no strong reason for a headline marker, choose
`white`. A primary-sized word, gradient, or CTA does not automatically require the
bold bar. The legacy value `orange` means the accent bar (currently gold), and
`white` means the curved light stroke (currently ivory); do not select by literal
color names.

Plan across the whole passage, not by copying the first phrase's settings. When a
transcript has both major claims and quieter emphasis, use both treatments where
they serve those roles. Separate strong bars with undecorated or lighter beats;
avoid making every emphasized phrase a bold bar. Do not force an alternating
pattern, a quota, or decoration on a short transcript just to show both types.
Keep these deliberate choices saved and stable across renders.

Examples (choose the actual word indices from the supplied transcript):

- “The result: **40% faster**.” → bold bar on the result, when it is the main payoff.
- “It starts with **one small change**.” → curved stroke for a quieter observation.
- “Here is how it works.” → none; let the typography carry the transition.
- “**Save this** for later.” → bold bar if this is the primary closing action;
  curved or none if it is an incidental reminder.

An underline follows the group containing `emphasisIndex`, regardless of its font.
To annotate an italic phrase, put the emphasis index in that serif group and use
`gradient: "none"` if it should remain ivory. Do not add a second copy of the words
or reorder them to obtain the treatment.

### Geometry and motion

Both thicknesses are at reference resolution. A left-to-right clip mask reveals
the fixed stroke without changing thickness. Start 90 ms after associated text,
draw over 320 ms with quadratic ease-out (a quick start and soft finish), clamp delay/duration to remaining phrase display time. Anchor to
the measured emphasized group's ink bounds below its deepest descender, with at least 14 px
clearance. The stroke follows that group's entrance and the phrase's exit opacity.

## Per-project overrides

Save these in `run.json` → `styleOptions`; `prepare` freezes them into `project.json`.
They never become personal/shared defaults. Sizes/travel are reference-resolution
pixels. `phrases` is keyed by zero-based normalized phrase index; `emphasisIndex`
and direction keys are zero-based word indices within that phrase. A direction key
must identify the first word of a reveal group. Line counts and group sizes must
cover all words in order; a reveal group cannot cross a line boundary.

```json
{
  "centerRatio": 0.60,
  "sizes": {"primary": 128, "sans": 76, "serif": 86, "handwritten": 76},
  "entranceMs": 220, "travel": 28,
  "drawDelayMs": 90, "drawMs": 320, "exitMs": 140,
  "phrases": {
    "0": {
      "emphasisIndex": 2,
      "lines": [{"count": 2, "role": "serif"}, {"count": 1, "role": "primary"}],
      "groupSizes": [2, 1],
      "directions": {"0": "left", "2": "bottom"},
      "gradient": "cream", "underline": "white"
    }
  }
}
```

Other gradient values: `pink`, `none`. Other underline values: `orange`, `none`.
An emphasis index inside a multiword group emphasizes that whole group. Explicit
font changes require a licensed asset, updated manifest/checksum/character map and
measurement; never substitute a system font. Developer manifest generation:
`python scripts/font-manifest.py` (fontTools), after reviewing the asset licenses.

Normal delivery follows the shared create-and-render workflow; no preview or final-video inspection is required.
