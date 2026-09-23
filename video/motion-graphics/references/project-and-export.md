# Projects, compilation and recovery

`prepare` validates without Remotion dependencies, freezes settings/source/plan, and allocates an unused target. Save the run before scaffolding. The Remotion plugin creates the project there; install its dependencies, then `attach`. Attachment adds only helper-owned source, settings, asset copies, editor instructions and `motion:*` scripts. Pinned installed Remotion versions and `package-lock.json` stay in the generated project. No runtime import reaches another skill.

Attachment journals expected hashes before writing. Matching partial files resume; unknown or changed files fail safely. A complete attachment preserves renderer edits and does not upgrade projects. Compile and reopen Studio from the same project after revisions; export only on explicit request.

`motion:compile` first validates inputs, then opens the generated runtime's browser solely for exact local font loading and measurement. It writes `project.json` plus the Studio snapshot `compiled-motion.json`. This is deterministic compilation without screenshots or media inspection. Derived geometry includes intervals, relative transforms, complete bounds, labels and seeded material. Source/plan/settings/assets/font/license/renderer/compiler/schema/dependency hashes invalidate stale compilation. `motion:render` and `motion:studio` refuse stale input and request recompilation.

## Default browser review

After compilation, start `npm run motion:studio`, wait for its ready URL and open that exact local URL in the browser, showing the `Motion` composition. Use the available browser tool and its current instructions. The helper starts with `--no-open` to avoid duplicate windows; the agent must still open the browser. Keep the server alive for the user to play and scrub scenes. Reuse an existing current server instead of starting duplicates. If authoring inputs change, the helper stops stale Studio; recompile, restart and reopen it.

Deliver the editable project and live Studio link with `status: ready-for-review`. Do not create `out/*.mov` or a preview MP4 by default. If opening the browser fails, preserve the running server, provide its actual URL and report that limitation; do not claim the page was opened or render a video as a substitute.

## Explicitly requested export

Render/export requests in the initial prompt or a follow-up authorize `motion:render`; no additional confirmation is needed. “Create an animation” and “let me check the scenes” authorize the default Studio workflow only. `renderByDefault` stays false even during an authorized export.

Requested export uses saved data and local assets. Silent ProRes 4444 with PNG frames preserves alpha. Scale affects encoded output, not design coordinates. The clip renderer offsets its frame by the saved clip start; a sequence keeps frame zero and transparent gaps. Full-screen background opacity is a saved scene choice.

`export-state.json` journals each temporary output, fingerprint and completed hash. A retry reuses only a matching completed output whose bytes still match. Conflicting output files are preserved. The final `out/placement-manifest.json` is published only when every requested output succeeds; partial progress remains in the journal. The manifest separates source interval, sequence interval, clip interval, local duration, editor placement, origin rounding, handles, track order, exact fps, dimensions and background/alpha behavior.

After a requested export succeeds, deliver `out/*.mov`, the placement manifest, project and [EDITOR.md](EDITOR.md). Do not add frame extraction, silence/composite checks or automatic post-render diagnostics. `motion:preview` encodes a separate demonstration MP4 and requires an explicit request for a rendered preview file; it does not replace Studio review or change production exports.

For changes to the skill's helpers, run focused checks of the changed behavior. Developer checks do not authorize rendering a user's project or become additional per-delivery requirements.
