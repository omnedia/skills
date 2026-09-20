---
name: motion-graphics
description: Create sparse editorial collage motion graphics from timed transcripts or standalone animation briefs. Deliver editable Remotion projects and silent transparent clips for video editors, including cutouts, layered parallax, paper treatments, callouts and simple diagrams.
---

# Omnedia Motion Graphics

Use the exposed Remotion plugin to scaffold projects. This skill is independently installable: copy this complete folder. Keep runs, installed dependencies and generated projects outside the installed skill. Select the single installed style, `editorial-collage`, automatically. Read [its style brief](styles/editorial-collage/STYLE.md) before authoring scenes.

## Workflow

1. Resume `run.json` or create it near the intended output. Record input paths, choices, blockers and plugin evidence (`availableInApp`, current `instructionPath`, ISO `checkedAt`). Read [configuration](references/configuration.md). Reuse known editor settings and personal defaults. Run `node scripts/motion-graphics.mjs doctor run.json` before project creation.
2. Determine transcript-driven or explicitly standalone timing. Read the complete source and [timing contract](references/input-and-timing.md). Preserve actual word onsets, ends and occurrence indices. No audio analysis, forced alignment, even distribution of cue words, base-footage manipulation or automatic face tracking. Cue-only inputs support an untimed plan; request word timing before synchronized export. Do not silently relabel them standalone.
3. Use default colors unless overrides or a picker are needed. Launch `node scripts/gallery.mjs run.json` when selecting colors. Open its tokenized local URL. While it is open, inspect source timing and assets. Once opened, wait for Save and the `selection-saved` event, reload the run and continue automatically in the same task. Do not end with “tell me when you save.” Missing demonstration video does not prevent selection. Static swatches are not live animation previews.
4. Author `scene-plan.json` using [scene planning](references/scene-planning.md). Choose meaningful sparse moments by context, not keywords. Save selection reasons, exact anchors, prepared layers, placement, camera, mode and overrides. Generic illustration needs no documentary evidence or source label. Factual documents/claims retain provenance and faithful content. Use supplied masks or a separately available asset-preparation workflow honestly; this skill does not implement segmentation or inpainting.
5. Validate with `node scripts/motion-graphics.mjs validate run.json`. Resolve missing assets, unsupported glyphs, timing and factual ambiguity. Simplify or omit graphics that cannot fit. Do not alter speech timestamps. Preparation runs dependency-free checks; it does not claim to measure fonts.
6. Run `prepare run.json`; use the Remotion plugin to scaffold exactly the allocated `projectPath`, install it, then run `attach run.json` and `dependencies run.json`. See [project/export](references/project-and-export.md). A failed scaffold/attachment resumes at the saved path. Never reattach to overwrite edits.
7. In that generated project, run `npm run motion:compile`. It loads the exact bundled font in the installed renderer, measures complete labels and saves immutable geometry, frame intervals and fingerprints. Record `compilationComplete: true` in the run after success. Errors identify changes needed before rendering.
8. Run `npm run motion:render`. Default delivery is individual full-canvas transparent MOV clips; use `delivery: sequence` only when requested. A successful final render completes export. Deliver files, editable project, `settings.json`, placement manifest and `EDITOR.md`. Record completion in the run.

## Delivery boundaries

Silent ProRes 4444 MOV, PNG intermediate frames, `yuva444p10le`, straight alpha; default composition 1080×1920, export scale 2 → 2160×3840. Opaque backgrounds require explicit full-screen selection. Texture and shadows belong to graphic objects; unused canvas stays transparent. Preview portrait backgrounds never enter exports.

Normal work has **no automatic preview, frame extraction, frame-by-frame inspection, post-render visual/alpha/composite/silence checks or visual review loop**. Deterministic pre-render compilation is required. `motion:preview` and `motion:studio` are for an explicit preview request; the shipped representative demonstration is a bounded development fixture, not a per-job check. Do not copy diagnostics from another video skill.

If plugin/runtime/timing/assets block a step, preserve the run, resolve independent work, state the precise blocker and resume. Do not claim an editor import was tested without performing it. These are rendered assets plus editable Remotion source, not MOGRTs.
