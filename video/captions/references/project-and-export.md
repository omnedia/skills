# Project and export

All styles, including **Montserrat Difference**, default to the transparent-overlay workflow below. Only an explicit request for Montserrat footage or separate-layer delivery uses the alternatives in [STYLE.md](../styles/montserrat-difference/STYLE.md#delivery). Footage output is intentionally opaque and applies Difference against the intended footage. Separate layers retain alpha and require their recorded blend modes. Never use a gallery background as footage.

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

Node 22+ and npm are required. FFmpeg/ffprobe must be on PATH for audio alignment. Remotion installs platform-specific render binaries and may download Chrome Headless Shell on its first render. On Linux the browser also needs its documented system libraries. Resolve installation/browser errors before promising an export. Relevant [Remotion prerequisites](https://www.remotion.dev/docs) and [Linux dependencies](https://www.remotion.dev/docs/miscellaneous/linux-dependencies) can change; consult current plugin guidance for the host. Observe Remotion's applicable license terms.

## Export

```text
npm run captions:render
```

The copied `captions-render.mjs` uses `@remotion/renderer` with `codec: 'prores'`, `proResProfile: '4444'`, `pixelFormat: 'yuva444p10le'`, `imageFormat: 'png'` and the saved `export.scale` (2× for new projects by default). A 1080×1920 composition exports at 2160×3840; a 1920×1080 composition at 3840×2160. Preview exports use the same scale. `jpegQuality: 90` is saved for potential opaque JPEG workflows but is not passed for PNG frames. It renders all frames from zero into `out/captions.mov`. No audio or solid background is included. Duration includes original leading silence, the explicit source offset, and a 120 ms final tail rounded up to a frame.

Deliver after the final render succeeds. Do not screenshot frames or check placement, decoded alpha, composites, or audio silence. Preview rendering and diagnostics are opt-in only when explicitly requested.

Deliver links to the silent MOV, project folder, `project.json` and `EDITOR.md`. State the editor placement time and source offset explicitly. Import above the footage with alpha enabled (straight/unmatted); retain leading silence and match the project fps. If an editor interprets edges incorrectly, inspect its alpha interpretation rather than silently exporting opaque footage.

Sources: [transparent rendering](https://www.remotion.dev/docs/transparent-videos), [local fonts](https://www.remotion.dev/docs/fonts), [Inter 4.1 official source and OFL](https://github.com/rsms/inter/tree/v4.1).

## Montserrat Difference

The installed `montserrat-difference` style adds reviewed Montserrat compositions with per-group source colors and genuine Difference blending. Save explicit phrase groups, positions and reveal/persistence choices. Delivery defaults to `alpha`: one transparent MOV using normal source-color text. Only explicitly requested `footage` or `layers` delivery preserves the backdrop-dependent Difference effect. See [style configuration and delivery](../styles/montserrat-difference/STYLE.md).
