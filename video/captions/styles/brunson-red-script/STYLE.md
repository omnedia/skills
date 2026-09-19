# Brunson Red Script

Stable ID: `brunson-red-script`. Normal alpha compositing; silent caption-only ProRes 4444 export through the existing workflow. The strong opening uses red Brunson and overlapping white Brush Script MT. Most speech remains small white Brunson, appearing immediately.

## Authoring

Use original Caption word records, unchanged text and timestamps. `styleOptions.phrases` is keyed by sentence index. `groups` uses zero-based sentence-local `from` (inclusive) and `to` (exclusive) indices, covering each word exactly once in transcript order, including repeats. Store semantic grouping and hero selection in project.json. No text matching or random editorial decisions.

Each phrase has `mode: "hero" | "default"` and optional `endMs`. Default is `default`; absent groups become single-word replacement units. Short reviewed semantic phrases should be explicitly grouped. Each default group has role `default`, optional size/color/shadow, `anchor`, and `endMs`. Units start at their first word and end at their last word unless extended explicitly within the next start. Gaps remain blank. Default units always use `instant`: no movement, blur, fade, scaling, active-word highlights or exit.

Hero groups have role `headline` or `script`, a named `region` and zero-based `line`. `phrases[n].regions[name]` saves `anchor: {x,y}` (frame fractions), `align: "left" | "center" | "right"`, `wordGap`, and `rowGap` (1080-reference pixels). Each region is laid out independently. Measure complete rows before rendering; word slots never move during reveals. To reveal a red line word by word, place its separate indexed groups on the same region/line. To reveal a short red group together, give it one range. Script words remain whole shaped text nodes, never individual letters.

Create an accent region at the intended overlap location. `offset: {x,y}` adds reference pixels; `zIndex` controls layer order (default script 2, headline 1). Use the script region's anchor to overlap lower red ink while retaining both words' readability. Check the speaker's face in the actual footage; anchors do not automatically detect faces.

Default text is centered at x=.5, y=.62. Hero anchor defaults: upper x=.5, y=.25; lower x=.5, y=.65. Text uses measured ink bounds, including script overhang. Lines wider than 85% are rejected with an editorial error; split long phrases rather than stretching/shrinking them. An explicit default `breakAfter: [index]` breaks before that sentence-local word index, producing exactly two lines. Each default unit centers independently and remains fixed during its interval. Use a modest size override (example 66 px) for quoted captions.

## Typography and motion

Reference-pixel sizes at 1080×1920: headline 200, support override 135, script 125, default 54. These scale with the shorter frame dimension. Headlines and defaults display German-locale uppercase (ß becomes SS), without changing transcript text. Script retains transcript casing, native connections and shaping. Contextual swash alternates (`calt`) are disabled at FontFace and text level to match the reference; letters remain shaped together.

Solid palette: headline #EA1315, script/default #FFFFFF. No boxes, outlines, gradients or blending effects. Optional `shadow: {color:"#000000",opacity:.3,x:0,y:2,blur:3}` is subtle; absent by default.

Hero `entrance: "rise-fade"`: 160 ms, 130 px travel, `ease-out-cubic`; optional `ease-out-quart`. `motionBlur: 10` is a vertical Gaussian softness in reference pixels, reduced to zero by the frame-driven ease. Override entranceMs, travel, easing and motionBlur per group or globally. Motion shortens to the group's speech duration/next start when needed. Revealed hero words persist to phrase end. Composition clears by cut; no exit animation.

All state uses `frame*1000/fps - sourceOffsetMs`. No timers or independently running CSS animations. Source offset remains independent from editor timeline placement.

## Fonts and glyphs

Brunson Regular and Brush Script MT Italic are loaded from bundled local files and awaited before canvas measurement. Font loading, measurement and SVG text all use the manifest’s declared style. The manifest records original family identity, SHA-256, source and cmap coverage. Unsupported characters produce an explicit error rather than a fallback font.

Read [font source notice](fonts/SOURCE-NOTICE.txt): Brunson's downloaded version is personal-use-only; Brush Script MT's third-party archive supplies no license grant. Commercial use and redistribution rights are not established. Exact downloads are present for this user-requested local implementation; this is not a claim that they are freely redistributable.

## Example and gallery maintenance

[Representative fixture](../../tests/fixtures/brunson-example.mjs) saves the multiregion opening, separate red entrances, overlapping `machen`, a clean cut, single-word/phrase replacements, pauses and a larger quoted caption. It has authored synthetic timing, not inferred/aligned speech.

Gallery regeneration is a separate maintenance task, not a delivery step. The gallery uses [the user-supplied nine-second transcript](preview-transcript.json), with all 22 word timings preserved. Rebuild it with `node scripts/brunson-gallery.mjs <current-Remotion-SKILL.md> <existing-Remotion-project>`. Remotion renders at 60 fps; the looping GIF uses 20 fps and a 540×350 caption crop, matching Editorial Kinetic and Montserrat Difference. Gallery-specific anchors keep the complete design inside that crop without changing the style defaults. No audio is supplied.

The supplied reference is 720×1280 at 25 fps. Layout/color/motion settings are estimates based on visible reference frames, not exact source design values. The example refines the large upper headline to 270 px, supporting line to 165 px and BACKFLIP to 215 px based on actual glyph bounds; shared defaults remain conservative. The supplied video already contains captions; any preview over that source must identify baked-in reference captions and avoid claiming they were removed.
