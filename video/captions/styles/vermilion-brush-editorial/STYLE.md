# Vermilion Brush Editorial

Stable ID: `vermilion-brush-editorial`. Transcript-only captions on transparent alpha, rendered in Remotion. No audio dependency, sound analysis, footage manipulation, transitions, or generated backgrounds.

## Appearance and evidence

The supplied brief describes very condensed vermilion block text balanced with flowing white script, separate upper/lower opening groups, whole-word upward entrances, instant ordinary replacements, and compact accumulating stacks. Script may overlap block text. The three supplied reference frames show script carrying connective phrases and trailing emphasis around strong block anchors. Balance applies across a sequence, not exactly within every frame.

All numeric settings are calibration defaults rather than measured source values: `#EB2F0C` vermilion, `#FFFFFF` script, a 240 ms monotonic cubic ease-out rise, 160 ms fade in place, vertical entrance blur, and no outline, shadow, glow, rotation, scaling, or blend effects. Ordinary captions cut instantly and share the font balance: Brunson uses `colors.ordinary` (vermilion), while Brush Script MT uses `colors.script` (white).

## Fonts

The `fonts/` directory contains the actual unmodified **Brunson.ttf** and **BrushScriptMT.ttf**, their checksums, codepoint coverage, and [source notice](fonts/SOURCE-NOTICE.txt). Metadata inspection confirms Brunson weight 400, upright; Brush Script MT weight 400, native italic (−37°). The renderer uses that face without synthetic bold or italic. These fonts have separate restrictions; the repository MIT license does not grant font rights.

Preparation checks file checksums; browser loading repeats validation and checks every displayed character against the font’s cmap. Missing assets, unsupported punctuation/numerals, or unusable metrics fail explicitly. There is no substitute font. Measurements wait for both faces before layout. Each script word is shaped as a whole with normal kerning and standard ligatures; contextual alternates are disabled consistently with the existing bundled-font renderer. No letter-by-letter animation or handwriting masks.

## Automatic editorial plan

`prepare` creates `settings.layoutPlan` with version, immutable source words/timestamps, global word indices, phrase boundaries, named templates, roles and treatment settings. `settings.styleOverrides` keeps the project’s authored overrides separately from resolved shared defaults. Rendering measures this plan once after fonts load and never chooses fonts or regrouping based on playback history.

Segmentation uses terminal punctuation (including commas and semicolons), gaps of at least 350 ms, and an eight-word fallback limit. User-provided sentence boundaries do not override word punctuation/timing. A long unpunctuated sequence is chunked rather than squeezed into a title.

Optional `styleOptions.phraseRanges` supplies reviewed `[from,to]` global index ranges covering the entire transcript once in order. This can keep an authored “WHY? YOU ASK?” stack together despite internal question marks. Ranges must not cross a genuine timing gap. All following `phrases` overrides refer to these saved range indices.

The first short phrase of three to eight words is eligible for decoration if each token has at most 18 letters. Later phrases remain ordinary except a readable callout beginning with “follow”, “subscribe”, “save”, “comment”, or “share” at least 10 seconds after the previous decoration. Time alone never triggers decoration. These conservative English rules are implementation policy, not a claim about the videos. For other languages or unsuitable semantics, explicitly select ordinary mode or author the roles.

Automatic font selection targets **50% of spoken words in Brush Script MT and 50% in Brunson** across automatically planned phrases (`styleOptions.scriptShare: 0.5`). Count words, not groups or pixel area: Brunson remains visually stronger at its larger sizes. Each phrase receives the rounded cumulative target, so short phrases vary without drifting toward all-block captions. Explicitly authored groups are preserved and excluded from this budget.

Script carries connective phrasing (such as “using your”, “you”, “make that”) and expressive endings (“wrong”, “again”, “tension”, “rhythm”). Prefer Brunson for strong anchors such as “STOP”, “MUSIC”, “WON'T”, “MISTAKE”, or “TIP”. The deterministic English heuristic ranks expressive words, then connectors, then other words, with strong block anchors last; shorter words and source order break ties. The longest remaining content word becomes the decorative hero. Review unfamiliar language or meaning-sensitive choices and author groups where needed. Font balance applies in ordinary and stack modes too; it does not increase animation frequency.

For authored layouts, keep natural script spans together and allow multiple spans around block anchors. “STOP / using your / MUSIC / wrong” has three script words and two block words; “you / WON'T / make that / MISTAKE / again” has four script words and two block words. “BECAUSE / AFTER / this / TIP” is a valid block-heavy beat between script-heavy ones. Aim for a near-even sequence without forcing every phrase to exactly half. No wording is inserted, removed, or paraphrased; casing is derived only for display.

## Roles and templates

| Role | Font | Size at 1080 × 1920 | Default casing / color |
| --- | --- | --- | --- |
| `hero` | Brunson | 280 | Uppercase / vermilion |
| `supporting` | Brunson | 150 | Uppercase / vermilion |
| `connector` | Brush Script MT | 150 | Lowercase / white |
| `emphasis` | Brush Script MT | 230 | Preserve editorial casing / white |
| `ordinary` | Brunson | 96 | Uppercase / vermilion |
| `ordinary-script` | Brush Script MT | 120 | Lowercase / white |

Use `mode: decorative`, `ordinary`, or `stack`. Entrance and persistence are independent: every group has `entrance: instant | rise-fade`, `behavior: replacement | accumulation`, and `exit: cut | fade`. Stack defaults to immediate accumulation; ordinary defaults to instant replacement; decorative defaults to rising accumulation with a short fade at its end. A replacement group can contain one to three words; it reserves all word positions but reveals each at its original onset. The default ordinary path uses one word per replacement.

| Template | Geometry / use |
| --- | --- |
| `ordinary` | Stable centered replacement anchor, y = 65%. Alternatives: 75% or about 35%. |
| `split-hook` | First row near y = 300, lower rows beginning near y = 1100; preserves the large opening gap. |
| `overlap` | Centered block rows; negative gap only before a script row, drawn above block. |
| `compact` | Centered closely spaced rows; useful for “DID YOU / hear that”. |
| `stagger` | Compact 62%-width stack, alternate rows offset right; useful for “WHY? / YOU / ASK?”. |
| `downward` | Completed stack centered around the anchor; new rows grow into reserved slots without moving earlier rows. |
| `callout` | Compact decorative arrangement; author role sizes and script offsets for “FOLLOW / for / MORE” if those words occur. |

Whole-word rows split at role boundaries, explicit lines, approved `breakAfter` indices, or a three-word row limit. Width overflow splits a row before modest size reduction (at most 28%). An indivisible overlong token fails clearly, requiring an explicit smaller size; it is never clipped or width-distorted. Geometry uses ink bounds, 60 px minimum horizontal margins, 88% maximum width, and extra room for script swashes and entrance blur. Extreme authored layouts that cannot remain inside the frame fail explicitly.

Everything scales uniformly from a 1080 × 1920 design space, centered in another aspect ratio. Text is never stretched. Text tracking starts at zero; block text can tighten to −0.025 em; script retains natural spacing. Default `lineSpacing` is 1. The complete phrase is measured before rendering any frame, so later word onsets cannot cause recentering or rewrapping. Placement is template-based, not face-aware.

## Overrides and precedence

Pass `styleOptions` on the run. Shared defaults are in `assets/caption-code/src/vermilion.mjs`. Precedence: style defaults → shared role overrides → phrase `defaults` → explicit group properties. Explicit role/group colors override gallery color roles. `colors.block`, `colors.script`, and `colors.ordinary` otherwise set the palette. Coordinates, sizes, offsets, travel and blur are design pixels; anchor x/y are normalized design-space ratios.

```json
{
  "style": "vermilion-brush-editorial",
  "colorsAccepted": true,
  "colors": {"block":"#EB2F0C","script":"#FFFFFF","ordinary":"#EB2F0C"},
  "styleOptions": {
    "anchor": {"x":0.5,"y":0.65},
    "roles": {"hero":{"size":300},"ordinary":{"size":96}},
    "phrases": {
      "0": {
        "mode":"decorative", "template":"split-hook",
        "groups":[
          {"from":0,"to":1,"role":"hero","size":290},
          {"from":1,"to":3,"role":"connector","size":145},
          {"from":3,"to":4,"role":"hero","size":320},
          {"from":4,"to":5,"role":"emphasis","size":150,"travel":140}
        ]
      }
    }
  }
}
```

This example is only for an actual five-word phrase such as “STOP using your MUSIC wrong”. `from`/`to` are **global zero-based word indices**, end-exclusive, and must cover each phrase exactly once in order. Repeated spelling never identifies an occurrence. For “PERFECT / for” above “BUILDING / Tension”, select `split-hook` and explicit `line`/`offset`/role settings; use a negative script y offset and `zIndex:2` for the flourish. Never insert example words into the transcript.

Group properties: `role`, `casing`, `size`, `color`, `tracking`, `lineSpacing`, `line`, `breakAfter` (global indices before the next line), `anchor`, `align`, `maxWidthRatio`, `offset:{x,y}`, `zIndex`, `entrance`, `entranceMs`, `travel`, `blur`, `easing` (only `ease-out-cubic`), `behavior`, `endMs`, `exit`, and `exitMs`. Phrase properties: `mode`, `template`, `anchor`, `endMs`, `defaults`, `groups`. Global planner settings: `scriptShare` (0–1, default 0.5), `gapMs`, `maxPhraseWords`, `decorationIntervalMs`, and `holdMs` (80 ms maximum tiny-gap hold by default).

Independent group `endMs` can clear an upper group before a lower group; all endings must include the group’s spoken words and stay within the phrase. Phrase endings cannot overlap the next phrase. Genuine pauses clear captions. Fade occurs in place before the assigned end; there is no automatic slide/blur-out. Fast speech shortens the 240 ms entrance to the next onset, never retimes a later word.

To revise a saved project’s editorial decisions, update `settings.styleOverrides` and recompute `settings.layoutPlan = planVermilion(sentences, settings.styleOverrides)` using the shipped module. Update duration when extending timing. Changes to palette alone need no replanning. Geometry remains derived from the saved plan and font metrics; all motion/visibility is a pure function of frame, fps, offset and plan.

## Preview, export and development

`preview.gif` is 540 × 350, 20 fps, charcoal `#22242e`, rendered through the actual Remotion component. It uses the unchanged shared [preview-transcript.json](../../preview-transcript.json). Compact preview-only framing makes the portrait typography readable in the same 1080 × 700 crop used by the other recent previews. The final phrase explicitly demonstrates a stack; the automatic plan otherwise keeps it ordinary. The supplied transcript contains no callout, so the preview does not invent one.

Regenerate with:

```text
node scripts/vermilion-gallery.mjs <currently exposed remotion-create/SKILL.md> <existing Remotion runtime project>
node --test tests/vermilion.test.mjs
```

The maintenance helper writes the GIF into this style and a silent **1080 × 1920 ProRes 4444 alpha MOV**, editable project and seek-check PNGs into its reported temporary project directory. It compares entrance, settled, pause and stack PNGs requested in sequential and shuffled order. Gallery backgrounds are supplied only to the separate preview render. Normal skill exports use the shared 2× export default; source-over alpha includes only caption pixels.

Behavioral fixtures cover repeated words, 50–60 ms words, punctuation, gaps, long-text splitting, explicit overlap/stack choices, callout eligibility, and invalid indices. No audio inspection is involved. Font weighting is informed by the three supplied stills; geometry and motion remain calibration defaults.
