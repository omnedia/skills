# Editing your motion graphics

Import the MOV files above your actual video. They contain silent ProRes 4444 with straight (unmatted) alpha. If your editor asks how to interpret alpha, choose straight. The footage is not included or modified. These are editable Remotion projects and rendered clips, not native Premiere MOGRT templates.

Match the exact frame rate in `out/placement-manifest.json`. Composition dimensions and exported dimensions are listed separately: the shipped 1080×1920 canvas at scale 2 produces 2160×3840. Fit the clip to the editor sequence without stretching.

For individual clips, use each entry's `placementFrame` and `trackOrder`; the placement already includes handles and source offset. For a synchronized MOV, place the entire file once at `sequencePlacementFrame`. Do not also offset each scene. Transparent gaps are intentional. Backgrounds are present only for explicitly selected full-screen scenes.

Edit `scene-plan.json`, `settings.json`, or the local files under `public/assets`. Source word timestamps in `source.json` remain the supplied speech reference. Preserve occurrence indices when revising ranges. Keep source and derived cutouts and their provenance. Geometry in `project.json` and `compiled-motion.json` is derived; do not edit it.

Run `npm run motion:compile`, then `npm run motion:render`. To inspect or request a preview, use `npm run motion:studio` or `npm run motion:preview` explicitly. Preview backgrounds are demonstration-only. Normal export renders the final assets and stops; it does not run visual, alpha, silence or frame inspection.

Failed exports can be retried with `motion:render`. Matching completed files are reused; partial outputs remain in `export-state.json`. The placement manifest is published only after all requested renders succeed. Conflicting manually edited files are preserved and must be moved or renamed before retry. Keep `package-lock.json` and local renderer source for reproducibility. Reattachment never updates a completed project's renderer; edit it directly and compile again.
