# Yellow Authority

Stable ID: `yellow-authority`. Compact, centered captions for assertive speech: mostly stationary white phrases, selective saturated yellow emphasis, and bold italic structural labels. Implement in Remotion using supplied word timestamps on transparent alpha. Ordinary production needs no footage or audio analysis; an explicitly supplied reference may inform editorial choices.

## Appearance and editorial intent

Make the spoken statement easy to absorb. White carries the explanation; yellow directs attention to the idea that matters; italics distinguish a heading, list item or comparison. Color, scale, placement and motion are independent choices. A large yellow word can remain completely still.

Read the complete transcript and choose treatments from its meaning, rhetorical structure and available reading time. The AI using this skill makes these decisions automatically as part of the task; the user does not need to mark words. Do not delegate emphasis to keyword lists, suffix matching, sentence-ending rules or an every-Nth-group cycle. Reference examples illustrate visual relationships, not trigger phrases. Apply the same judgment to unfamiliar topics, languages, questions and negations; keep qualifiers attached when they change a claim's meaning.

Keep connective speech quiet. Select yellow for a salient claim, contrast, benefit, consequence, instruction or payoff in context. Use a numbered heading only for actual spoken enumeration, a list treatment for a coherent list, and paired panels for a genuine comparison. Do not invent wording or force every available treatment into a clip. If the transcript has no meaningful emphasis, ordinary white captions are valid.

Across comparable speech, roughly 60–70% ordinary white groups and 15–25% yellow displayed words remain useful review targets, not quotas. Consider pull-ups for roughly one-third to one-half of **timing-eligible ordinary groups**, rather than a quarter of all white groups. Timing eligibility comes first; do not animate an unsafe group to meet a ratio. Balance these with static phrases and isolated focal additions; most displayed words should still read calmly. A group with one moving key word does not require its support words to move. There is no fixed one-animated-moment limit for short clips. `density` guides fewer nonstructural accents and entrances; at zero keep nonstructural speech white and static. Reconsider the plan when density changes.

## Choose what appears, then what moves

Default to an editorial mix of readable speech phrases and selected key information, rather than displaying or animating every spoken word. These are two independent decisions: a complete phrase may remain static with only its key word animated; a key-information caption may contain just a short source excerpt. Keep a verbatim display when the user explicitly requests full subtitles or every word.

Read the complete source first. Retain the claim, necessary context, negations, qualifiers, quantities, contrasts and outcomes. Omit only dispensable setup, repetition or connective wording when the remaining caption is faithful beside the speech. Do not turn “almost anything” into an unqualified promise of “anything,” or omit “only” when it limits the claim. Use exact source excerpts, not invented slogans, paraphrases or replacement synonyms. A blank interval is preferable to flashing an insignificant connector. Do not isolate a dangling article such as “a”; keep it with its noun phrase.

Choose from these treatments by meaning and timing, without a fixed rotation:

- **Quiet phrase:** the useful phrase appears as a unit where the existing lookahead allowance permits, or accumulates with stationary cuts at source onsets.
- **Word pull-up:** a short useful phrase builds at source word onsets and remains readable after its last addition.
- **Static support, moving focus:** keep supporting words anchored and animate only the key word or connected key phrase. Measure the whole layout first; additions never recenter settled text.
- **Key-information excerpt:** display a source-derived heading, list item, claim or payoff while dispensable speech is left uncaptioned. The original transcript remains complete in the project record.

The reviewed reference's opening holds “People only / SPEND MONEY” while its count is represented elsewhere visually. Around the problem statement it uses quiet “to make / a real pain / disappear” replacements; the generated MOV instead puts motion into the short connector and clears it too soon. Transfer the reference's hierarchy, persistence and selective motion, not its exact omissions: this caption-only style has no count icons, so information carried by those graphics may still need text. Do not add the reference's icons or footage effects to this style.

## Fonts and roles

Use the bundled Poppins SemiBold 600, Poppins ExtraBold 800, and Montserrat ExtraBold Italic 800 faces in `fonts/`, with their source records and licenses. Verify checksums and glyph coverage, wait for fonts before measurement, and reject unsupported characters. No substitute or synthetic bold/italic faces.

All values use a 720 × 1280 design canvas and are calibration defaults, not measured source-project settings.

| Role | Face | Size / tracking | Color and purpose |
| --- | --- | --- | --- |
| `ordinary` / `small` | Poppins SemiBold | 48 / −1 | White explanation / quiet yellow emphasis |
| `emphasis` | Poppins ExtraBold | 72 / −1.5 | Yellow focal phrase |
| `opening` | Poppins ExtraBold | 66 / −1.3 | Yellow uppercase hook |
| `hero` | Poppins ExtraBold | 108 / −2.5 | Rare oversized yellow anchor |
| `italic` | Montserrat ExtraBold Italic | 66 / −1 | White uppercase heading or list |
| `numeral` | Montserrat ExtraBold Italic | 112 / −2 | Yellow spoken enumeration |
| `lead` / `tail` | SemiBold / ExtraBold Italic | 62 / −1.3; 76 / −1.5 | White comparison lead / yellow tail |
| `closing` | Poppins ExtraBold | 70 / −1.5 | Yellow named title or payoff |
| `annotation` / `annotationYellow` | Poppins SemiBold | 44 / −0.8 | White / yellow annotation |
| `amount` | Poppins ExtraBold | 144 / −3 | Rare important spoken amount |
| `consequence` | Poppins SemiBold | 42 / −0.8 | White supporting consequence |

Default palette: `base: #FFFFFF`, `accent: #FFE600`. Add only a black 18% shadow at (0, 2), sigma 3. No stroke, background, glow, icons or decorative shapes. Preserve original wording and monetary formatting; uppercase is display-only.

## Layouts

| Template | Composition and use |
| --- | --- |
| `plain-center` | Center x 360, baseline 688, width 580. Ordinary replacement or quiet color emphasis; wrapped baselines 662/712. |
| `word-build` | Premeasured line slots at 662/712 for occasional explanatory accumulation. |
| `support-emphasis` | White support at 664, yellow addition at 726. Support stays anchored. |
| `numbered-heading` | Separate numeral and italic label, 24 px gap, visual centers at 671. |
| `list-keyword` | Replacing white uppercase italic items at 680; consistent treatment through the list. |
| `yellow-keyword` | Yellow focus at 688; choose size independently from motion. |
| `comparative-pair` | White lead at x 84/y 660, yellow tail right-aligned to x 636/y 724. Upper counterpart at y 254/324. |
| `reverse-payoff` | Yellow instruction at 688 with white consequence at 738. |
| `closing-title` | Yellow title in at most two centered lines at 668/730. |
| `amount-hero` | Important supplied amount centered at y 310 when its significance warrants the interruption. |
| `comparison-annotations` | Persistent subject at x 360/y 324, 372; predicate at x 530/y 620, 666. |

Scale the canvas by `min(width/720,height/1280)` and center it. Default anchor is (360, 688). Reserve ink, shadow and italic overhang inside x 48–672 and y 8–1272. Measure complete phrases before revealing words so later onsets never cause reflow. Wrap at meaningful boundaries. Display layouts may shrink to 80%; unresolved overflow splits into ordinary groups. Fail explicitly on an indivisible word that cannot fit.

## Motion and timing

Use `phrase-cut` for quiet speech and unsafe motion windows. For eligible speech, `word-pull-up` reveals complete words at their original timestamps, rising 24 px over 250 ms with Bézier(.16, 1, .3, 1) and a 125 ms fade. Previous words remain settled. It may also move just a focal word while its support stays static. Use `word-fade` (125 ms) for occasional accumulation when it serves the statement.

### Pull-up eligibility: budget the handoff

Plan the next **replacement or clear**, not merely the next word. A following word inside the same premeasured group can arrive during an entrance because the previous word stays visible. A new group removes that word, so its onset is a hard deadline. Count any exit fade's start as the deadline.

For every proposed moving word, compute `available = replacementOrExitStart - sourceWordStart`. A default pull-up requires its complete 250 ms entrance **plus at least 200 ms fully settled visibility**: 450 ms total, preferably 500–650 ms for a comfortably readable phrase. Round the required duration up to whole frames. Check the final word especially, and ensure the completed phrase itself is readable for at least 200 ms before it clears. Larger or less familiar phrases may need more time.

If the test fails, keep that span static, animate only an earlier focal span that passes, or regroup semantically connected words into a stable layout that survives the next addition. Recheck every word after regrouping and measured wrapping. Never rush a pull-up merely to fit, delay the next caption, extend a word's supplied timestamp, or carry an old statement over a conflicting new one. The renderer's 83 ms fallback is a technical safeguard, **not** editorial permission to select motion.

For the reported “to make a” at 7.68–8.21 s, the last word starts at 8.14 s and clears at 8.21 s: only 70 ms. “Make” has 380 ms, also below the 450 ms pull-up budget. Choose quiet “to make / a real pain,” or a genuinely useful larger stable group; do not mark the whole connector as `word-pull-up`. This is a timing example, not a trigger phrase.

`line-rise` introduces connected opening emphasis: 24 px over 250 ms, the same curve, 200 ms fade. `quick-rise` uses 24 px over 167 ms with 125 ms fade. Headings enter from the right: `number-settle` travels 48 px over 250 ms with 208 ms fade; `heading-glide` travels 96 px over 375 ms with 250 ms fade. Both use Bézier(.22, 1, .36, 1). Shorten travel when clearance requires it.

A comparison can establish its first panel statically, then introduce its counterpart from the left using `comparison-glide`: −48 px to zero over 250 ms, Bézier(.16, 1, .3, 1), 200 ms fade. Use `scattered-glyph-resolve` sparingly for major payoffs or amounts: fixed glyph positions, deterministic visibility over 500 ms (333 ms for amounts). Never scramble letters or animate scale, blur, rotation or overshoot. Cuts dominate exits; selected animated hooks and amounts can fade over 167 ms.

Target short natural groups, usually two or three words. Connected spans reveal together only within 600 ms of first-to-last word starts, without strong punctuation or a 350 ms pause; otherwise additions use original word timestamps. Split groups at genuine pauses. Hold until the next group if it starts within 350 ms of speech ending; otherwise clear after 180 ms. At transcript end, hold 180 ms. For authored motion, reserve at least 200 ms settled visibility after the full entrance; pull-ups must pass the stricter eligibility test above. For other recipes use their nominal entrance plus that hold, or choose a static treatment. A connected key phrase uses the connected span onset; word additions use each word onset. Do not rely on the renderer shortening or downgrading an unsafe entrance. Never retime speech to accommodate effects.

## Save the AI's editorial decisions

Before `prepare`, write `run.styleOptions.editorialPlan`. This is part of implementing the style, not a user questionnaire. Review the whole sequence for faithful meaning, restrained motion and clear focus. The supplied compiler validates and executes your plan; it does not decide what the transcript means. Missing plans fail explicitly instead of silently using word-list heuristics.

Keep the full, untouched source transcript in the project. When selecting excerpts, also save an agent-authored `display-selection.json` with the retained original word indices and contextual reasons for every omitted range. Produce a separate normalized **display transcript** by selecting those exact Caption records in source order; preserve their whitespace, punctuation, starts and ends. No inferred timing, renumbering of the archived source, or destructive edits to it. The renderer's local indices refer to the selected array; the selection map links them back to the original indices. In verbatim mode the arrays are identical.

`editorialPlan.source` must exactly match the display transcript's `text` fields. `groups` cover every **display** word exactly once in order; this coverage requirement does not force every archived speech word onto the screen. Select excerpts before `prepare`; never add unsupported hidden/skip flags, leave gaps in group coverage, or hide glyphs with CSS. The current compiler treats a 350 ms gap between selected records as a pause: split there, even when omitted speech occupied the gap. It also clears after the existing 180 ms hold on longer gaps; do not claim arbitrary persistence or change word ends to fake it. Prefer a complete static phrase or a deliberate blank interval within these limits. Each group contains zero-based display-transcript `from`/`to` indices (end-exclusive), a template, a brief contextual `reason`, and `spans`. Record the replacement deadline and settled-time calculation in the reason for animated spans. Spans cover the group exactly once and contain `from`, `to`, `role`, `recipe` and optional `line` (default 0; 0–1, or 0–3 for annotations). Group flags include `upper`, `structural`, `hook` and `fade`. An amount span can set `nominalDuration: 333`.

For an actual three-word transcript such as “Preserve the nuance.”, the AI might emphasize its subject without motion:

```json
{
  "anchor":{"x":360,"y":688}, "scale":1, "density":1,
  "editorialPlan":{
    "source":["Preserve"," the"," nuance."],
    "groups":[{
      "from":0,"to":3,"template":"support-emphasis",
      "reason":"Nuance is the instruction's focus; color is enough emphasis.",
      "spans":[
        {"from":0,"to":2,"role":"ordinary","recipe":"phrase-cut","line":0},
        {"from":2,"to":3,"role":"emphasis","recipe":"phrase-cut","line":1}
      ]
    }]
  }
}
```

Use the actual input's spelling, spacing, indices and timing; never copy example text into a different transcript. `prepare` saves compiled choices in `settings.yellowPlan`. `captions:plan` loads exact fonts and saves shaped geometry before Studio or export. Re-review editorial choices after transcript or density changes, then rerun planning; palette or geometry changes require remeasurement. Rendering consumes saved geometry with absolute frame time and never makes editorial decisions during playback.

Final output is a silent caption-only ProRes 4444 MOV with alpha. Detailed renderer mechanics live in [specification.md](specification.md); they do not replace the AI's contextual choices. Editorial selection and the 200 ms settled hold are authored-plan requirements, not new runtime enforcement.

## Preview maintenance

The style preview uses the shared nine-second sample's original timing, with its full source preserved in `preview-selection.json`, selected records in `preview-transcript.json`, and the contextual plan in `preview-plan.json`. Its omitted low-information setup is deliberate; inspect the selection before reuse. Regenerate through the same production `prepare` / `attach` / `captions:plan` renderer with that selected transcript, the default fonts and palette, and a gallery-only background. The shared `yellow-gallery.mjs` assumes an unfiltered shared transcript; do not pass this selected plan to it without supplying the matching display transcript through the ordinary production flow. Do not weaken source-match validation.

Check actual compiled replacements, full entrance durations and settled holds for every moving word after measurement; inspect the preview handoffs. Export the gallery crop at 540 × 350 and 20 fps, looping. Preview maintenance does not authorize regenerating an existing user MOV.
