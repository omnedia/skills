# Yellow Authority specification

The executable contract is `../../assets/caption-code/src/yellow.mjs`; the operational guide is [STYLE.md](STYLE.md). Values below are calibrated reproduction choices, not recovered source-project settings. The original supplied 720 × 1280, approximately 67-second video was sampled across its length and at four frames per second through the opening 16 seconds. The user's described entrance directions take precedence over earlier guesses. Test-fixture times are synthetic, not a transcription of its audio.

## Editorial intent and weighting

Captions underline a spoken statement. Plan the phrase first, then independently choose color, size, placement and motion. An emphasized word can be large and yellow while completely stationary. Ordinary speech mostly uses immediate phrase replacements, with word pull-ups considered for roughly one-third to one-half of timing-eligible ordinary groups. Do not animate every spoken word.

For a comparable complete talk, use these tendencies as review targets:

| Dimension | Target / decision |
| --- | --- |
| Ordinary white groups | Roughly 60–70%; meaning may justify more |
| Yellow tokens | Roughly 15–25%; never a quota |
| Motion | Timing-gated pull-ups and isolated focal additions mixed with static phrases; STYLE.md defines eligibility, not a fixed total-group quota |
| Multiline panels | Roughly 10–20%; support plus emphasis, not routine stacking |
| Placement | Middle anchor dominates; upper/side treatments require explicit comparison, value contrast or annotation structure |
| Italics | Concentrated in numbered headings, coherent problem lists and comparative tails |
| Exits | Hard cuts dominate; fade only animated hooks and monetary heroes |

The AI reads the full transcript and authors a contextual editorial plan as described in STYLE.md. The compiler validates coverage and timing, then preserves these choices. There is no keyword, suffix, terminal-word or positional selection policy. Balance and motion targets guide the AI's sequence review; they are not automatic quotas. Density informs that review, so changing it requires reconsidering the editorial plan.

Count a group containing any animated addition as animated, even when its first support line is static. Diagnostics separately report `motionGroups`, first-panel entrances, all reveal events, color-token shares, font presence, templates and exits. These denominators are not interchangeable. Historical reference estimates are guidance; `verification.json` reports actual synthetic fixture results.

## Reference sequence

| Statement | Treatment |
| --- | --- |
| People only / SPEND MONEY | Small stationary white support; connected yellow fade-up line |
| 1 / SOLUTIONS | Yellow numeral enters from right; larger white bold italic label independently enters from right into a pre-reserved slot |
| People will pay / almost | White stationary phrase replacements |
| anything | Oversized yellow, instant appearance |
| to make / a real pain / disappear | White stationary phrase replacements |
| DEBT / WEIGHT / STRESS / CONFUSION / LONELINESS | Replacing white bold italic words, consistent short fade-up, no accumulating stack |
| The bigger / the pain | Static white lead and yellow tail in lower comparison position |
| The bigger / the check | Both spans enter left to right with opacity, in upper comparison position |

The source visibly uses italic structural text; preserve that typography. Preserve supplied wording and spelling in production, including source mistakes. Casing changes are display-only. Default to the editorial mix in STYLE.md: retain all source records, but a separately documented display selection may omit dispensable speech without changing the claim. Verbatim requests retain every displayed word. The AI should interpret each transcript independently; it need not reproduce these exact boundaries or all visual beats. A supplied reference may inform the plan when requested; never infer missing word timing from its visuals.

## Typography and geometry

Bundle Poppins SemiBold 600 (ordinary), Poppins ExtraBold 800 (yellow display), and Montserrat ExtraBold Italic 800 (structural), with their license/source records. Disable synthetic faces and substitutions. Verify checksums and glyph coverage before shaping; unsupported characters fail explicitly.

All dimensions use 720 ×1280. Scale the entire layer by `min(width/720,height/1280)` and center that canvas. Normal anchor: x 360, baseline 688. Settled ink must stay within x 48–672, y 8–1272, including overrides. Use black 18% shadow at (0, 2), sigma 3; no backgrounds, strokes, glow, masks, icons or decorative objects.

| Role | Font / size / tracking / color |
| --- | --- |
| Ordinary / small color emphasis | SemiBold 48 / −1 / white or yellow |
| Benefit | ExtraBold 72 / −1.5 / yellow |
| Opening | ExtraBold 66 / −1.3 / yellow uppercase |
| Hero | ExtraBold 108 / −2.5 / yellow |
| Category/list | Italic 66 / −1 / white uppercase |
| Numeral | Italic 112 / −2 / yellow |
| Comparison lead / tail | SemiBold 62 / −1.3 / white; Italic 76 / −1.5 / yellow |
| Closing | ExtraBold 70 / −1.5 / yellow |
| Annotation | SemiBold 44 / −.8 / white or yellow |
| Amount | ExtraBold 144 / −3 / yellow |
| Consequence | SemiBold 42 / −.8 / white |

| Template | Fixed geometry / purpose |
| --- | --- |
| plain-center | x 360/y 688, width 580; wrapped baselines 662/712 |
| word-build | Demonstration recipe for explicitly selected accumulation; premeasured lines 662/712; not automatically selected merely for questions |
| support-emphasis | Centered support 664, emphasis 726; widths 560/600; support stays fixed |
| numbered-heading | Complete width 600, 24 px gap, visual centers 671; reserve number and label slots from beginning |
| list-keyword | Centered baseline 680, width 600; all list members share treatment |
| yellow-keyword | Centered baseline 688, width 600 |
| comparative-pair | Lead left at 84/y 660; tail right at 636/y 724. Second panel uses 254/324, independently placed; no travel from lower to upper |
| reverse-payoff | Centered hero 688, consequence 738; width 600 |
| closing-title | Centered 668/730, width 580 |
| amount-hero | Centered 310, width 600 |
| comparison-annotations | Subject x 360 at 324/372, width 600; predicate x 530 at 620/666, width 270; first panel persists |

Measure complete shaped spans including spacing, kerning and overhang before animation. Ordinary overflow wraps at a balanced boundary. Display geometry may shrink uniformly to 80%; remaining overflow splits into ordinary groups without dropping words. Unbreakable overwide words fail explicitly. Never recenter visible text as later words appear.

## Entrances and exits

| Recipe | Motion / opacity / use |
| --- | --- |
| phrase-cut | Immediate opacity 1 at final coordinates; default, including static yellow |
| word-pull-up | Each complete ordinary white word rises y+24→0 over 250 ms, Bézier(.16, 1,.3, 1), 125 ms linear opacity; source-word starts, fixed slots, hard cut exit |
| word-fade | Fixed-position 125 ms linear opacity; deliberately selected accumulation, titles, annotations or consequences when budget allows |
| line-rise | y+24→0 over 250 ms, Bézier(.16, 1,.3, 1), 200 ms linear opacity; connected opening emphasis |
| quick-rise | y+24→0 over 167 ms, same curve, 125 ms opacity; list items and selected benefits |
| number-settle | **Horizontal** x+48→0 over 250 ms, Bézier(.22, 1,.36, 1), 208 ms opacity; retained recipe ID, corrected right-to-left direction |
| heading-glide | x+96→0 over 375 ms, same heading curve, 250 ms opacity; whole short label; shorten travel to canvas clearance |
| comparison-glide | x−48→0 over 250 ms, Bézier(.16, 1,.3, 1), 200 ms opacity; both spans of second comparison, independently started |
| line-fade | Stationary 250 ms opacity; legacy/manual demonstration capability, not opening default |
| comparative-tail-glide | Legacy/manual right-to-left tail recipe: x+48→0 over 208 ms, Bézier(.16, 1,.3, 1), 125 ms opacity; not automatic comparison selection |
| scattered-glyph-resolve | Fixed glyph positions, deterministic visibility over 500 ms (amount 333 ms); only eligible rare heroes when budget allows |

No animated scale, blur, rotation, spring, overshoot or random state. Short connected spans reveal as a unit within the bounded lookahead allowance; no synthetic per-word stagger. Longer static spans remain timestamp-gated cuts, not implicit fades. Existing visible words never restart their motion.

Scattered reveal retains each original grapheme and position. Rank order: last, first, middle, second-last, second, then remaining indices nearest middle first (lower index breaks ties), deduplicated. At phase p=0…9, show ranks below `floor(N*p/9)` or satisfying `(rank+2*p)% 5===0`. At 500 ms all are visible. Words outside a connected phrase are gated by their source timestamps; do not scramble content.

Selected fade exits last 167 ms, within the existing group interval. Other groups cut; never delay the next statement to finish a fade.

## Timing and semantic selection

Preserve every original Caption field and stable word index. Reject invalid durations or unordered starts; overlapping durations are allowed. Clauses break at strong punctuation, commas or 350 ms pauses. Ordinary chunks target 2–3 words, max 4, avoiding article/noun and auxiliary/verb splits. Before an article after a complete short unit, prefer a new phrase (for example “to make / a real pain”).

Connected phrase lookahead is at most 600 ms between first/last word starts, with no strong punctuation or 350 ms pause. This applies to phrase cuts and short connected line-rise, quick-rise, heading and comparative spans. Other word additions start at original word timestamps. A salient intensifier can be isolated as a static oversized accent when context warrants it; its neighboring speech stays ordinary.

Keep a group until the next start if that start is within 350 ms of the final word end; otherwise clear 180 ms after speech. Never bridge 700 ms silence. At transcript end hold 180 ms then clear. The current runtime retains an 83 ms minimum and may shorten or downgrade tracks; this is a technical fallback only. Author plans with the stricter STYLE.md budget: full nominal entrance plus at least 200 ms settled visibility, including the final word before replacement. A default pull-up therefore needs at least 450 ms. Choose static spans or a better semantic grouping when that budget fails; do not rely on shortened runtime tracks. Do not retime audio or later captions to accommodate effects.

Select emphasis from context, including the effect of questions, negations and qualifiers. Benefits, contrasts, headings and payoffs are rhetorical roles, not vocabulary classes. The AI records its choices in `styleOptions.editorialPlan`, including exact display-transcript text, complete display group/span ranges and contextual reasons, with a separate original-source selection map when excerpts are used. The compiler rejects absent or stale source text, invalid roles/recipes, incomplete coverage and groups crossing speech pauses. It does not infer or replace creative decisions.

## Integration and maintenance

`prepare` validates and compiles AI-authored semantic selection. `captions:plan` loads exact fonts, measures geometry, resolves tracks and saves `settings.yellowPlan`. Its fingerprint includes planner source, captions, options, colors and font identity; regenerate after changes. React uses saved geometry and absolute frame time, never runtime measurement or editorial selection. Options include anchor, uniform scale, density and the editorial plan; palette uses the shared color roles. Output stays caption-only silent ProRes 4444 alpha; gallery backgrounds are not exported.

Run `node --test video/captions/tests/*.test.mjs`. Authored-plan tests cover arbitrary vocabulary, complete coverage and rejection of stale or missing plans; other tests cover complete source coverage, repeated words, timing, long words, safe bounds, recipe curves and seek determinism. The gallery generator takes AI-authored plans for the unchanged shared preview and editorial sequence, and separately renders the exhaustive treatment demo. The selected Yellow Authority preview now uses its own matching display transcript and selection map; follow STYLE.md preview maintenance rather than passing its plan against the unfiltered shared input. Supply `--plan <preview-editorial-plan.json>` and, for a full rebuild, `--sequence-plan <sequence-editorial-plan.json>`; files contain the editorialPlan object. Use `--preview-only` to rebuild just the preview. The treatment demo is not a selection policy. Use the real-font verifier for geometry, missing glyphs and shuffled-frame equivalence. Keep synthetic timing explicitly labeled and report actual diagnostics, not assumed reference counts.
