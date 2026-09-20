# Development acceptance

Checked on 2026-09-20 with Node 24.20.0, Remotion 4.0.526 and React 19.2.3. Generated dependencies, lockfiles, Chrome runtime and MOV smoke outputs stay in the ignored `.work/motion-preview` development project, not in the installed skill.

## Completed

- 20 dependency-free regression tests pass: `node --test video/motion-graphics/tests/motion.test.mjs` from the repository root (or `node --test tests/motion.test.mjs` from an independently installed skill).
- Skill Creator `quick_validate.py` passes in UTF-8 mode.
- Actual Chromium font loading and text measurement compiled the sparse transcript and standalone mountain fixtures. Exact bundled Inter bytes and glyph coverage are verified before measurement.
- Generated renderer passes TypeScript: `node node_modules/typescript/bin/tsc -p motion/tsconfig.json`.
- The real Remotion renderer completed the 660-frame / 22-second, 540×960 MP4 demonstration shipped at `styles/editorial-collage/preview.mp4`. Its synthetic source transcript spans 25 seconds; four selected treatments end at 22 seconds. Fixture paths, hash, renderer version and preview-only background are recorded in `preview.json`.
- The real exporter completed a standalone layered-mountain ProRes 4444 MOV using PNG frames, yuva444p10le and muted output. This bounded development run used composition 1080×1920 and explicitly selected export scale 0.5 (540×960). Shipped production defaults remain scale 2 (2160×3840).
- A final 30000/1001 ProRes alpha render completed using the exact-fraction FFmpeg argument override. Frame conversion, offsets and placement are saved as exact-rate frame counts; no media inspection followed the successful export.
- The generated project was reopened, its authored camera travel revised from 20 to 18 design px, and a renderer source comment added. Stale-plan rejection worked; recompilation and replacement export completed, preserving that renderer edit. The placement manifest and owned-output hash journal were published successfully.
- HTTP gallery tests verify token enforcement and Save-to-continue persistence. Simulated encoder failure exercises partial progress, matching reuse, conflicting-output preservation and delayed manifest publication with real filesystem operations.
- A copied installation in an isolated temporary folder loads settings and validates the standalone fixture without the captions skill. Captions source files were left untouched.

## Review limits

**Visual playback and editor import were not verified.** Browser discovery returned no connected browser; Windows Computer Use could not connect to its native helper. No phone-size playback judgment or Premiere Pro/other-editor import success is claimed. The shipped preview is available for that bounded human review.

No frames were extracted. No frame-by-frame visual review, PNG seek comparison, alpha/composite inspection, silence scan or other post-render media diagnostics were run. Assertions about settings come from saved inputs and successful renderer calls, not a separate media inspection pass. Normal user deliveries retain the same direct-final-render policy and do not inherit developer preview work.

## Reproduce the bounded renderer check

Use the actual exposed Remotion plugin to scaffold an unused development project. Prepare a run pointing at `tests/fixtures/preview-plan.json` and `preview-source.json`, attach this skill's source/assets, install matching pinned dependencies, then run `motion:compile` and explicitly request `motion:preview`. The gallery ships recorded playback from this same rendering implementation; swatches are clearly labeled static.

For a small alpha smoke run, use `mountain-plan.json` as explicitly standalone source and select scale 0.5 in that development project's `settings.json`. Compile and render once. For a revision check, edit the authored camera override, preserve any renderer source edits, recompile and render again. Use the unit timing fixture to assess clip/sequence arithmetic; do not extract media frames. An editor import check is optional when an editor is available, and must be reported honestly.
