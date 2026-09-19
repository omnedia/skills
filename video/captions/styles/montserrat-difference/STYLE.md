# Montserrat Difference

Stable ID: `montserrat-difference`. Deliberate, short Montserrat compositions over footage, with optional genuine Difference compositing. Default delivery is a single transparent MOV with normal source-color text. This style does not track the spoken word with an automatic highlight.

## Reference and design decisions

Reviewed the two supplied PNGs and the 11.00-second `SnapInsta.to_AQNu…` and 32.96-second `SnapInsta.to_AQPNkv…` videos. The first reference shows the oversized 10 near 0.6–1.2 s and the ERSTE / IMMOBILIE / KAUFST arrangement around 2 s. The second shows the targeted PERSÖNLICHEN → PROFESSIONELLEN replacement around 28–30 s, followed by individual word replacement. These time locations are approximate review cues, not recovered edit timestamps.

Starting design values at a 1080-pixel short edge: support 76 px (typical range 60–90), emphasis 126 px (100–150), number 290 px (240–330), 18 px inter-group gap, 12 px row gap, maximum width 86%. Scale by `min(width,height)/1080`. Position defaults to frame ratios `{x:0.5,y:0.22}` and is overridden per phrase. These are estimates, not exact measurements from compressed references. The reference sometimes overlaps adjacent lines; this implementation defaults to readable positive spacing.

Bundled licensed Montserrat variable fonts contain real upright and italic faces at 100, 200, 300 and 700; bold is always 700. Supporting default **ExtraLight 200** balances thin strokes and compressed-video readability; Thin 100 remains available for oversized numbers and other deliberate emphasis. Compare the [100/200/300 samples](font-weight-comparison.png) (top to bottom) to the references when choosing a project weight. This is an editorial approximation: the source project’s exact thin weight is not recoverable with certainty. Never synthesize bold or italic. German umlauts, ß/ẞ, punctuation and digits are verified in the manifest. Uppercase display normally maps ß to SS; original `Caption.text` is never modified. Set `uppercase:false` when preserving display case matters.

## Save editorial choices

Use the existing `sentences[].words[]` Caption data, including original timestamps, text, punctuation and order. A sentence is a reviewed composition, not necessarily a grammatical sentence. Split long material at a meaningful boundary while copying original word objects unchanged. Each phrase requires explicit groups: no random layout, emphasis, reveal selection or spelling-based lookup.

`styleOptions.phrases` is keyed by sentence index. Groups cover all local word indices in order, once, using inclusive `from` and exclusive `to`. A group may contain a short phrase that reveals together at its first word. Use one group per word for word-by-word timing. Line breaks are saved as numeric `line` values. Groups on the same line occupy fixed slots with saved spacing.

```json
{
  "style": "montserrat-difference",
  "colorsAccepted": true,
  "delivery": {"mode":"alpha"},
  "styleOptions": {
    "thinWeight":200, "supportSize":76, "emphasisSize":126,
    "numberSize":290, "reveal":"fade-ltr", "revealMs":200, "exitMs":0,
    "phrases": {
      "0": {
        "layout":"asymmetric", "position":{"x":0.5,"y":0.22},
        "behavior":"build",
        "groups":[
          {"from":0,"to":1,"line":0,"weight":200},
          {"from":1,"to":2,"line":1,"emphasis":true,"size":122,"colorRole":"accent","blendMode":"difference"},
          {"from":2,"to":3,"line":2,"italic":true}
        ]
      }
    }
  }
}
```

Project `run.json` and resolved `project.json` persist these choices; shared user defaults stay in the existing personal configuration. Shipped style defaults live in `src/montserrat.mjs`. `prepare` freezes those defaults; `attach` copies the renderer and exact font assets, hashes and license into the project. Example arrangements and authored timing are in [the gallery fixture](../../tests/fixtures/montserrat-example.mjs). The gallery preserves the supplied nine-second English transcript and every word timestamp exactly.

| Scope | Fields and meaning |
| --- | --- |
| Shared style options | `thinWeight`, `supportSize`, `emphasisSize`, `numberSize`, `position`, `reveal`, `revealMs`, `exitMs`, `maxWidthRatio` (at most .86) |
| Phrase | `layout`: `stacked`, `asymmetric`, `single`, `number`; `position:{x,y}`; `gap`, `rowGap` in reference pixels; `behavior`: `build` or `replace`; `groups`; `reveal`, `revealMs`; optional `endMs`, `exitMs` |
| Group | `from`, `to`, `line`, optional shared replacement `slot`; `weight`:100/200/300/700, `italic`, `size`, `uppercase`; `emphasis`, `number`, optional `shadow:true` on normally composited text; `sourceColor` or `colorRole`; `blendMode`:normal/difference; `reveal`:fade-ltr/instant; `revealMs` |

`stacked` centers each fully measured line. `asymmetric` aligns the first row left and final row right within the complete composition. `single` has one slot; use one group for a phrase, or `behavior:replace` for a word sequence. `number` places the first slot beside the other rows; mark its group `number:true,weight:100`. Additional short lines are allowed beside the number.

All alternatives are measured before the first reveal. A shared `slot` reserves the maximum ink bounds, keeping its left ink anchor and baseline fixed. For targeted replacement, retain a surrounding group on line 0 and assign successive alternatives on line 1 the same `slot:"adjective"`. In `behavior:replace`, all groups share one slot automatically. Previously revealed `build` slots persist until `endMs` (default last word end). End times cannot overlap the next composition. Optional exit fades occupy only the following gap and stop at the next phrase. Long compositions fail with actionable regrouping guidance instead of clipping or silently shrinking. Do not split a German word arbitrarily to satisfy width; split surrounding phrases, or explicitly select an appropriate readable size.

## Entrance and compositing

`fade-ltr` fades each complete group from transparent to opaque while gliding gently from 12 reference pixels left of its final position to its reserved slot. Scale the travel by `min(width,height)/1080`; keep it subtle regardless of word length. Default duration is 200 ms (useful range 160–240 ms), with linear opacity and cubic ease-out movement. The entire group appears together: no left-to-right mask/wipe, letter-by-letter reveal, scaling or bounce. The saved `fade-ltr` name is retained for compatibility. Its duration clamps to the group’s duration and the next group’s start. `instant` is fully visible at the first frame whose source time reaches its start, without any intermediate animation. Every group in stacked, asymmetric and number compositions must use this fade, including targeted replacements. The renderer overrides legacy `instant` settings and replaces zero reveal duration with 200 ms for these layouts. Only non-stacked `single` text may use `instant` (its default); an explicit fade is also supported there. Positive fade-duration overrides remain available.

Time is `frame * 1000 / fps - sourceOffsetMs`. No wall-clock timers or CSS animation clocks. Font loading blocks rendering; layout is measured independently of visibility and frame order.

Colors are **source colors**, not promises of output hues. Shipped adjustable sources are off-white `#F7F5EF`, red `#FF3030`, blue `#208CFF`, turquoise `#20D6BE`, gold `#D8B86C`. Difference computes a background-dependent result; a red source can appear cyan over a bright region. Exact original source colors cannot be inferred reliably from finished video. Normally composited supporting text uses `base`; `emphasis` and `number` default to Difference and `accent`. Choose at most one accent source color plus the base white/off-white per displayed composition. The next composition may use another accent. All groups and replacement alternatives in one composition must share that accent; multiple resolved accent colors are rejected. Roles that resolve to the same hex color count as one accent. Per-group overrides may select base or that one accent, including normally composited emphasis. A group may request a subtle normal-text shadow with `shadow:true`, as in the footage gallery. No text gradients, video-filled text, recoloring at speech boundaries, underlines, thick outlines, or default boxes. The reference’s gold SCHRITT 1 card is a separate optional normal-composited card composition, not a style-wide background.

In explicit footage mode, every group’s SVG is a sibling of the video; `mix-blend-mode:difference` applies to that group against the real backdrop. Never wrap captions alone in an isolated group, opacity container, filter, or opaque layer that changes their backdrop. The renderer applies entrance and exit opacity to individual groups, preserving the external backdrop.

## Delivery

Default to `delivery:{mode:"alpha"}` (also used when delivery is omitted). It produces **one silent `out/captions.mov` with ProRes 4444 alpha**, preserving Montserrat typography, positions, source colors and animations. All groups composite normally in this mode, including groups authored with `blendMode:"difference"`. No gallery background or footage is included. This is the standard Premiere Pro overlay workflow. It does not reproduce backdrop-dependent Difference; a flattened RGBA clip cannot preserve mixed per-group blend operations against footage added later.

Use the following modes only when explicitly requested. Selecting the Montserrat style alone does not request them. Do not render multiple layers or bake a preview backdrop merely to match the GIF:

- `delivery:{mode:"footage",footage:"source.mp4",trimBeforeFrames:0}`: copy the intended source into the generated project’s `public/` directory. Rendering produces silent `out/captions.mov` containing that footage and the final Difference appearance. `trimBeforeFrames` selects the footage start independently of caption source offset; review synchronization. Use source footage with enough duration for the entire output, including holds/exits.
- `delivery:{mode:"layers"}`: render a separate source-color ProRes 4444 alpha MOV for **each group** and `out/layers.json`. Keep each file at the same timeline origin, in recorded bottom-to-top order, using its recorded normal or Difference mode and straight alpha. Individual groups remain separate so overlap order is preserved. Use the same underlying footage/crop/color management. This workflow does not bake Difference into an alpha file: it records the downstream operation. `EDITOR.md` explains it. A normally composited alpha overlay alone cannot reproduce the effect.

The Studio preview in layers mode has no final footage relationship until a backdrop is provided. Do not call it the final appearance. Preview ranges report their first frame; final layer outputs preserve the full timeline. The optional `layer` renderer prop is an export selector, not a user style option.

## Gallery

The [gallery GIF](preview.gif) is rendered from the actual Remotion component with the supplied nine-second English transcript and exact word timing. It demonstrates fading stacks, instant single-word replacement, italic/thin/bold faces, and one accent plus base per composition with normal/Difference text. It matches Editorial Kinetic's preview presentation: solid `#22242e` background, compositions centered at 60% of a 1080×1920 canvas, a 1080×700 crop starting at y=800, and 540×350 output at 15 fps. Montserrat's own reveal animations and font sizes are preserved. The background is applied inside Remotion only to demonstrate optional Difference blending. It is gallery-only and must never be included in production exports. Default alpha output uses the chosen source colors and may therefore differ from the GIF’s blended hues. No reference footage or MP4 is included in the gallery; temporary PNG frames are encoded directly to the looping GIF.

Gallery generation is separate maintenance, not part of caption delivery. Follow the shared create-and-render workflow.
