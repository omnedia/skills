# Active Word Highlight

Stable ID: `active-word-highlight`. Use the component in `assets/caption-code/src/CaptionOverlay.tsx`; its pure layout/timeline functions are in `src/layout.mjs`. The shipped `preview.gif` shows the component with a dark background added only for the gallery.

## Color roles

| Role | Default | Application |
| --- | --- | --- |
| `base` | `#FFFFFF` | All inactive words |
| `active` | `#FFD54A` | Only the word whose speech interval contains the current frame time |
| `shadow` | `#000000` | Shadow at 60% opacity; outline at 40% opacity |

Show defaults and the user's named brand palette. Map palette names to roles only by explicit user choice. A partial explicit color request overrides its specified roles and uses these defaults for the rest; show the resolved mapping without reopening a completed selection.

## Geometry and type

- Bundle Inter Bold 4.1, weight 700, WOFF2, under `fonts/`; verify `source.json` SHA-256. License is SIL OFL 1.1, included. Copy it to `public/fonts/` and use the unique `CaptionsBundledInter` family so an installed system font cannot mask a missing asset.
- Reference 1080×1920: 64 px text, 1.2 line height, 1 px outline, shadow offset 0×2 px with 4 px blur. Scale those sizes by `min(width,height)/1080`; landscape 1920×1080 therefore keeps readable 64 px text.
- Center horizontally with 8% side margins, 84% maximum width. Bottom of the block is 18% above the frame bottom. Maximum two measured lines. Preserve normal casing, punctuation and word order.
- Wait for the exact FontFace/weight before measuring with canvas or allowing a render. Missing/corrupt assets are packaging errors, not a request for the user to install a font.
- Greedily fit measured words to lines, preferring punctuation boundaries in the latter half of a full two-line block. Split overflowing sentences into sequential blocks using original word times. Review unnatural breaks and regroup at actual phrase boundaries without changing timing. An individual word wider than the safe area stops rendering; use a per-project smaller `styleOptions.fontSize` or a user-approved linguistic break.
- Per-project `styleOptions.fontSize` (output pixels) and `bottomRatio` may override the design. These never become shared defaults. A requested alternate font requires copying a licensed font asset and updating the saved font entry before measuring/rendering.

## Timing

Use `frame * 1000 / fps - sourceOffsetMs`. Speech intervals are start-inclusive/end-exclusive. Match words by their array object/index, not spelling, so repeated words work.

Fade the full block in over 120 ms, clamped to half its spoken duration. Only color changes during speech: no width/weight/scale/bounce changes. Between words, all words use the base color. After the final spoken word ends, fade out over at most 120 ms, clamped to the gap before the next block. If the next block starts immediately, switch with no overlapping tail; never shorten the final speech interval to make room for a fade. On any arbitrary seek, the same frame produces the same state.

The canvas stays transparent. Gallery checkerboards, dark preview backgrounds, and alignment audio are never final overlay layers.
