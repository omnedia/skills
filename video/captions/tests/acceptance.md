# Acceptance exercises

## Editorial Kinetic — 2026-09-19

Palette/underline refinement: default ivory, sea-glass teal and champagne gold;
14 px minimum descender clearance, 12 px accent / 5 px curved strokes, 90 ms draw
delay and 320 ms quadratic ease-out. Regenerated the component GIF and inspected
the four-design contact sheet. All 15 behavioral tests, all 262 decoded-frame
safe-bound checks, arbitrary-seek PNG comparison and ProRes/alpha checks passed
again with these defaults.

Added `editorial-kinetic` with bundled Poppins Bold, Libre Baskerville Italic
(user-approved free Marion alternative), and Paul Neave's public-domain Lazy Dog.
Font identities/character maps were inspected using fontTools; bundled binary
hashes and licenses are checked before project creation, and the renderer verifies
hashes again before measuring. No system-font fallback.

- `node --test tests/core.test.mjs tests/editorial.test.mjs`: 15 tests passed,
  including existing style behavior, fixed geometry, repeated words, short speech,
  immediate transitions, clamped underline drawing, safe geometry and font hashes.
- `node scripts/editorial-render-check.mjs <available-plugin-SKILL.md> [runtime-project]`:
  actual component compiled and rendered 262 frames / 8.733333 seconds, 1080×1920
  at 30 fps, silent ProRes 4444 with decoded alpha 0–255. Gallery GIF generated
  from that MOV. Inspected four complete mixed-font headline designs, both
  gradients and underline treatments; gallery includes single/group entrances
  and all four directions. The optional runtime reuses existing test dependencies
  through a directory link; all project files/output remain in a new temp folder.
- `node tests/editorial-render.mjs <reported-project>`: actual sequential PNG
  rendering matched arbitrary-seek PNG bytes. Rendered fast repeated words,
  adjacent phrases, a long word with smaller project size, and the unchanged
  Active Word Highlight style. An oversized word rejected with safe-width guidance.
- `python tests/editorial-frames.py <reported-project>`: all 262 decoded frames
  remained in safe bounds with transparent leading silence; additional fast/long
  stills fit, and the old style's spoken-word highlight remained present.
- `python scripts/verify-export.py <project>/editorial.mov <project>/project.json
  <project>/qa --time 1.13`: actual codec, alpha, dimensions, fps and silence passed.
- Browser gallery: both style cards appeared; all eight Editorial color roles and
  the bundled-font sample loaded. Explicit Ocean→accent selection saved and
  restored on reload, skipping the already resolved style choice.
- Skill frontmatter validation passed. Font assets, sources, licenses, style
  documentation and the actual-component GIF are included in the skill directory.

The original Active Word Highlight exercises below are historical results.

Executed on 2026-09-18 on Windows, Node 24.20.0, Python 3.12, Remotion 4.0.526 and its Chrome Headless Shell 149. Package requirements and model setup are in the skill references. Tests use isolated configuration/project directories; personal defaults were not changed.

## Reproduce

1. Verify the Remotion plugin is available. Integration checks use its official scaffold command in temporary project folders; no skill-local dependency install is needed. Make full FFmpeg and ffprobe available on PATH. Remotion's bundled ffprobe can be used, but its reduced FFmpeg build lacks some GIF filters; use a full FFmpeg build for `render-check.mjs`.
2. Run `node --test tests/core.test.mjs` from the skill directory: ten behavioral tests, covering separate plugin/runtime gates, missing/cue/ambiguous timing, config persistence and precedence, export scale/quality settings, collisions, copied assets, timing state, wrapping, and gallery persistence. The plugin-negative cases are simulations with explicit unavailable evidence; they do not uninstall the user's plugin.
3. Run `python -m unittest discover -s tests -p "test_*.py"`: three alignment-normalization tests. Install the alignment requirements in an isolated Python environment, then run `python tests/audio-integration.py [--model-dir <cache>]` for actual inference on the bundled speech fixture. It checks untimed supplied wording, preserved punctuation, pauses/repeated words, cue-constrained alignment and mismatched text stopping without timing output.
4. Run `node scripts/render-check.mjs <current-available-plugin-SKILL.md>` after verifying the plugin is exposed in the task. Then `python tests/check-frames.py <reported-project>` and `python scripts/verify-export.py <project>/captions.mov <project>/project.json <project>/qa`. Inspect the PNGs. This also rebuilds the shipped GIF from the real component.
5. Run `node tests/portable.mjs <current-available-plugin-SKILL.md> [gallery-run.json]`. This copies only the skill to an isolated temporary directory, uses the plugin scaffold workflow to create a project there, installs matching dependencies and compares decoded frame checksums from two complete renders. It intentionally retains that directory for inspection. The generated project does not import anything from the original skill or another repository skill.
6. Run the skill-creator `quick_validate.py` against the skill folder, with `PYTHONUTF8=1` on Windows if necessary. Inspect relative Markdown links and catalog paths as well; the frontmatter validator is not a behavioral validator.

## Observed results

The original render results below used 1× export scale. New projects now default to 2×; `render-check.mjs` explicitly keeps the gallery fixture at 1×. Run `node tests/scaled-render.mjs <current-plugin-SKILL.md>` for the separate real 2160×3840 export check, followed by `verify-export.py` against its reported project/movie. The tests also verify partial export-setting merges, omission of JPEG quality for PNG, invalid-setting rejection, and legacy projects retaining 1× when no scale was saved.

| Area | Exercise / observed result |
| --- | --- |
| Plugin and runtime | Missing-plugin state stopped before runtime/project creation, despite available Node/Remotion packages. Available-plugin state still stopped on missing runtime. Restoring evidence retained style/colors. Actual app exposed the Remotion skill instructions for real renders. |
| Semantic input | Manually interpreted the arrow/prose seconds in `fixtures/timed-notes.txt` into the bundled normalized fixture. Original word timing, order and punctuation reached the rendered project unchanged. Untimed text with no audio and cue-only text with no word timing stopped. Ambiguous `01:02` requires units/frame-rate clarification; no timing is fabricated. |
| Audio | Real local Whisper base + stable-ts alignment preserved “Every word matters. Go, go!” exactly. Actual sentence and repeated-word pauses remained. Cue-constrained alignment also completed. Unrelated wording produced a review file and no normalized output. |
| Configuration | Isolated first-run folder/palette were saved and reused; overrides did not rewrite defaults. Font and position were excluded from shared settings. Existing project contents survived collision handling. |
| Gallery | Browser test at 1440 px showed four columns and one installed-style card. At 390 px it used one readable column. With the GIF initially absent, the same-sized named placeholder remained selectable. Choosing Ocean for the active-word role changed the live sample and hex to `#36AADD`; saving wrote the run. Reload after save skipped the style grid and restored colors. |
| Fully specified run | Project creation directly accepted resolved style/colors/dimensions without gallery or further questions. Missing timing/plugin states preserved those choices. |
| Font | Render used a new FontFace family with the packaged Inter Bold WOFF2 and checksum. No `local()` font lookup or system-font installation; copied project rendered with the packaged asset. |
| Style/timing | Actual PNG checks passed for transparent leading silence, active-word boundaries, pauses with no highlight, repeated words and stable glyph bounds. Pure frame-state tests cover arbitrary backward seeks and adjacent/short captions. Full export reproduction produced identical decoded frames. |
| Wrapping | Real long-caption samples at 1080×1920 and 1920×1080 fit within side/bottom margins and two lines. Visual review confirmed punctuation and readable phrase segmentation. |
| Alpha | Actual 1080×1920 MOV: ProRes 4444 (`ap4h`), decoded `yuva444p12le`, 30 fps, 88 frames / 2.933333 s, no audio. Decoded alpha spans 0–255 with partial-alpha edges. Light/dark composites inspected. The render request uses documented `yuva444p10le`; decoder reporting 12-bit ProRes is expected. |
| Independent installation | Copy-only installation, `npm ci`, and two complete exports succeeded outside the repository. Decoded frames matched. A 540×960, 24 fps override with +250 ms source offset and 7000 ms editor placement passed duration/alpha checks (77 frames / 3.208333 s). Browser-selected blue was confirmed in actual rendered pixels. |
| Packaging | Frontmatter validator passed. Preview GIF and font/license are bundled. README includes Video and counts two skills/two categories. Test environments/build outputs are ignored. |

These checks cover this implementation and fixtures; acoustic alignment still needs passage review for new recordings/languages, and app availability must be rechecked in each task. User inputs remain semantically interpreted, not constrained by a parser schema.


## Plugin-owned setup revision

Project scaffolding now belongs to the Remotion plugin. The skill only contains caption source/assets and helpers. `prepare` leaves the selected project directory absent; `attach` requires a Remotion scaffold and preserves its original entry/configuration/scripts. Unit tests cover absent-scaffold rejection and overwrite refusal. The revised real integration check used the official `create-video` blank scaffolder in a temporary folder, installed matching Remotion dependencies there and rendered a 2160×3840 alpha MOV successfully. Earlier reference image, audio and gallery checks above still describe the unchanged caption component. Local development environments and generated projects are kept outside the skill.
