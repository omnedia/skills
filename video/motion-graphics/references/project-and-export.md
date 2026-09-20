# Projects, compilation and recovery

`prepare` validates without Remotion dependencies, freezes settings/source/plan, and allocates an unused target. Save the run before scaffolding. The Remotion plugin creates the project there; install its dependencies, then `attach`. Attachment adds only helper-owned source, settings, asset copies, editor instructions and `motion:*` scripts. Pinned installed Remotion versions and `package-lock.json` stay in the generated project. No runtime import reaches another skill.

Attachment journals expected hashes before writing. Matching partial files resume; unknown or changed files fail safely. A complete attachment returns without overwriting renderer edits. It does not upgrade projects. Compile and render from the same project after revisions.

`motion:compile` first validates inputs, then opens the generated runtime's browser solely for exact local font loading and measurement. It writes `project.json` plus the Studio snapshot `compiled-motion.json`. This is deterministic compilation without screenshots or media inspection. Derived geometry includes intervals, relative transforms, complete bounds, labels and seeded material. Source/plan/settings/assets/font/license/renderer/compiler/schema/dependency hashes invalidate stale compilation. `motion:render` and `motion:studio` refuse stale input and request recompilation.

Normal export calls the renderer directly with saved data, local assets and no semantic/network asset choices. Silent ProRes 4444 with PNG frames preserves alpha. Scale affects encoded output, not design coordinates. The clip renderer offsets its frame by the saved clip start; a sequence keeps frame zero and transparent gaps. Full-screen background opacity is a saved scene choice.

`export-state.json` journals each temporary output, fingerprint and completed hash. A retry reuses only a matching completed output whose bytes still match. Conflicting output files are preserved. The final `out/placement-manifest.json` is published only when every requested output succeeds; partial progress remains in the journal. The manifest separates source interval, sequence interval, clip interval, local duration, editor placement, origin rounding, handles, track order, exact fps, dimensions and background/alpha behavior.

Deliver `out/*.mov`, the placement manifest, the complete editable project and [EDITOR.md](EDITOR.md). Successful renderer completion ends normal delivery. Do not run frame extraction, preview generation, silence checks, composite checks or automatic post-render visual diagnostics. Explicit `motion:preview` generates the separate demonstration MP4; it never changes production settings or bakes its portrait placeholder into MOV output.

Developer regression command: `node --test video/motion-graphics/tests/*.test.mjs`. See `tests/ACCEPTANCE.md` for the recorded bounded renderer/editor checks and limitations. Do not turn those checks into per-delivery requirements.
