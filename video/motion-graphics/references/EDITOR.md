# Editing your motion graphics

By default, review the editable scenes in Remotion Studio in your browser. The agent starts the server and opens its actual URL. Video files are exported only when you explicitly request rendering/export in the initial prompt or a follow-up.

After export, import the MOV files above your actual video. They contain silent ProRes 4444 with straight (unmatted) alpha. If your editor asks how to interpret alpha, choose straight. The footage is not included or modified. These are editable Remotion projects and optional rendered clips, not native Premiere MOGRT templates.

Match the exact frame rate in `out/placement-manifest.json`. Composition dimensions and exported dimensions are listed separately: the shipped 1080×1920 canvas at scale 2 produces 2160×3840. Fit the clip to the editor sequence without stretching.

For individual clips, use each entry's `placementFrame` and `trackOrder`; the placement already includes handles and source offset. For a synchronized MOV, place the entire file once at `sequencePlacementFrame`. Do not also offset each scene. Transparent gaps are intentional. Full-screen inserts intentionally cover the footage during their selected passages. Overlay scenes preserve it. Read sceneMode and background in the manifest; a ProRes 4444 container does not imply that every scene is visually transparent.

Edit `scene-plan.json`, `settings.json`, or the local files under `public/assets`. Source word timestamps in `source.json` remain the supplied speech reference. Preserve occurrence indices when revising ranges. Keep source and derived cutouts and their provenance. Geometry in `project.json` and `compiled-motion.json` is derived; do not edit it.

After edits, run `npm run motion:compile`, then `npm run motion:studio` and open the printed URL. The Studio helper stops when inputs become stale; recompile and restart it. Keep the server running while reviewing. Use `npm run motion:render` only when you want exported clips. `motion:preview` produces a demonstration MP4 and is not required for browser review. No automatic post-render visual, alpha, silence or frame inspection is performed.

Failed exports can be retried with `motion:render`. Matching completed files are reused; partial outputs remain in `export-state.json`. The placement manifest is published only after all requested renders succeed. Conflicting manually edited files are preserved and must be moved or renamed before retry. Keep `package-lock.json` and local renderer source for reproducibility. Reattachment never updates a completed project's renderer; edit it directly and compile again.
