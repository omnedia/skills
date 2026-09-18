# Project, preview and export

## Create through the Remotion plugin

After the startup gates and semantic timing review:

```text
node <skill>/scripts/captions.mjs doctor <run.json>
node <skill>/scripts/captions.mjs prepare <run.json>
```

`prepare` saves resolved settings in the run and selects an unused `<projectFolder>/<projectName>` path (adds `-2`, `-3`, etc. on collision). It does not scaffold or install a project. Report the selected path.

Next, follow the **currently available Remotion plugin's creation instructions** to scaffold and install a new blank project at `run.projectPath`. The plugin currently specifies `npx create-video@latest --yes --blank --no-tailwind <project-name>`, followed by `npm i` in that folder. Run it in the configured parent folder with the selected name and proper shell quoting. Recheck that the destination is unused immediately before scaffolding; if another process created it, select another unused name and update the run. Do not overwrite or repurpose an existing project. Perform this setup automatically within the user's authorized request.

Then run `node <skill>/scripts/captions.mjs attach <run.json>`. It preserves the scaffold's original entry point, configuration and scripts, adding `src/captions/`, named caption export helpers, bundled font/license, normalized captions and saved settings. It adds `captions:studio`, `captions:preview` and `captions:render` scripts. Caption/render dependencies are pinned to the scaffold's installed Remotion version, with the lockfile maintained **in the generated project**. There is no project package manifest, lockfile or `node_modules` in the skill.

If scaffolding or its initial installation fails, resume that plugin setup in the selected folder. If caption dependency installation fails after attachment, run `node <skill>/scripts/captions.mjs dependencies <run.json>`; do not attach again or recreate the project. `attach --no-install` is for staged setup/testing only. Later reproduction uses `npm ci` in the completed project. The run's prepared snapshot freezes choices; if they change before attachment, update that snapshot deliberately rather than reselecting a destination that has already been scaffolded.

Node 22+ and npm are required. FFmpeg/ffprobe must be on PATH for alignment and export verification. Remotion installs platform-specific render binaries and may download Chrome Headless Shell on its first render. On Linux the browser also needs its documented system libraries. Resolve installation/browser errors before promising an export. Relevant [Remotion prerequisites](https://www.remotion.dev/docs) and [Linux dependencies](https://www.remotion.dev/docs/miscellaneous/linux-dependencies) can change; consult current plugin guidance for the host. Observe Remotion's applicable license terms.

## Preview and inspect

In the generated project:

```text
npx tsc --noEmit
npm run captions:preview
npm run captions:studio
```

`captions:preview` renders at most five seconds starting just before the first spoken word, into `out/preview.mov`; its log reports the original first frame. It is a review excerpt, not the timeline-aligned final. Preview late passages too when long sentences, repetitions or format overrides introduce risk. Studio uses the same saved project and frame-derived component; open the exact printed local URL in the app browser. The preview is silent; play the supplied audio separately at the corresponding source times or add a temporary preview-only audio composition. Never add audio to the final `Captions` composition.

Inspect actual frames at starts/ends, gaps, repeated words, sentence switches, and arbitrary backward seeks. Check the bundled font, casing/punctuation, measured two-line breaks and safe margins. Re-group awkward phrases or use an explicit per-project override if needed; never change speech times merely to improve layout. The fade-out occurs after the last word, in available gap time, avoiding both speech truncation and overlap.

## Export

```text
npm run captions:render
```

The copied `captions-render.mjs` uses `@remotion/renderer` with `codec: 'prores'`, `proResProfile: '4444'`, `pixelFormat: 'yuva444p10le'`, `imageFormat: 'png'` and the saved `export.scale` (2× for new projects by default). A 1080×1920 composition exports at 2160×3840; a 1920×1080 composition at 3840×2160. Preview exports use the same scale. `jpegQuality: 90` is saved for potential opaque JPEG workflows but is not passed for PNG frames. It renders all frames from zero into `out/captions.mov`. No audio or solid background is included. Duration includes original leading silence, the explicit source offset, and a 120 ms final tail rounded up to a frame.

To verify, use Python with Pillow installed:

```text
python <skill>/scripts/verify-export.py <project>/out/captions.mov <project>/project.json <project>/out/qa
```

This probes actual codec/profile, alpha-capable pixel format, dimensions, fps, duration and absence of audio; it also decodes an actual frame and requires transparent, nonzero and partial-alpha pixels. It saves `alpha-frame.png`, light/dark composites and `verification.json`. Inspect the composites visually for halos, clipping and readability. `--time <seconds>` selects another sample; choose a visible speech frame, not leading silence. The duration check targets the full MOV, not the preview excerpt. Repeat samples where visual conditions change. A pixel-format label alone is not proof of working alpha.

Deliver links to the silent MOV, project folder, `project.json` and `EDITOR.md`. State the editor placement time and source offset explicitly. Import above the footage with alpha enabled (straight/unmatted); retain leading silence and match the project fps. If an editor interprets edges incorrectly, inspect its alpha interpretation rather than silently exporting opaque footage.

## Package verification and preview maintenance

From the repository or independently copied skill directory:

```text
node --test <skill>/tests/core.test.mjs
python -m unittest discover -s <skill>/tests -p "test_*.py"
node <skill>/scripts/render-check.mjs <currently-exposed-Remotion-SKILL.md>
```

Integration checks follow the available plugin's official scaffold command in temporary folders outside the skill, install dependencies in those projects and attach the caption code. No preinstalled skill-local dependency tree is needed. Verify app availability before supplying the plugin path; test helpers record that evidence rather than discovering the app plugin. The render check produces a portrait MOV, sampled frames, portrait/landscape long-text samples and a regenerated shipped GIF. Run `verify-export.py` against the reported MOV and project JSON. `tests/acceptance.md` records the behavioral/browser/audio exercises. Tests never impose a schema on user transcripts.

Use a full FFmpeg build for GIF generation; Remotion's reduced render binary may lack GIF filters. The standalone-copy test is `node <skill>/tests/portable.mjs <current-plugin-SKILL.md> [gallery-run.json]`; it installs and renders in an isolated temporary directory, then verifies pixel-identical reproduction.

Sources: [transparent rendering](https://www.remotion.dev/docs/transparent-videos), [local fonts](https://www.remotion.dev/docs/fonts), [Inter 4.1 official source and OFL](https://github.com/rsms/inter/tree/v4.1).
