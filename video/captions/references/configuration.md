# Configuration and resumable runs

Personal settings live at `~/.config/codex-captions/config.json` on every OS (on Windows, under the user's home directory). No personal path or palette belongs in committed defaults. Read shipped `config/defaults.json` and then saved user settings. Explicit run settings win over both. Style-owned font/placement come from the style and per-project overrides only.

On first run, save a supplied or newly collected project folder. Named brand colors are optional. Example changes file:

```json
{"projectFolder":"/absolute/path/to/caption-projects","brandColors":{"Gold":"#DDBB44"}}
```

Run `node <skill>/scripts/captions.mjs configure <changes.json>`. This allowlists shared fields: projectFolder, brandColors, width, height, fps, export. It excludes font/position. One-off choices go in `run.json`; only save them as defaults when requested.

## Export defaults

`export.scale` defaults to `2`: the 1080×1920 composition renders at **2160×3840**, or **3840×2160** for a 1920×1080 landscape composition. Remotion renders at the higher resolution; this does not enlarge an already encoded video. Layout, timing and frame rate stay the same. Both preview and final exports use the saved scale. Studio keeps the composition dimensions.

`export.imageFormat` is `"png"` for alpha. `export.jpegQuality` defaults to `90` (0–100), but is dormant for PNG and is never passed to Remotion's PNG renderer. JPEG quality concerns intermediate JPEG frames, not ProRes compression. The transparent overlay helper rejects JPEG because it cannot retain alpha; use that quality only if explicitly implementing an opaque JPEG workflow.

Export fields merge individually across shipped defaults, personal defaults and run overrides. For a one-off native-resolution export, add `"export": {"scale": 1}` to the run. Saving that same partial object with `configure` changes the shared default without losing codec/profile settings. Values are frozen into each new project; existing projects are unchanged. A legacy project with no saved scale continues rendering at 1×.

See [Remotion render options](https://www.remotion.dev/docs/renderer/render-media) for `scale` and `jpegQuality` semantics.

## Run record

This is agent-owned workflow state, **not a transcript input schema**. Use absolute paths. Write current plugin evidence only after verifying the plugin is exposed in this task and reading its instructions; a helper cannot independently inspect the app's installed-plugin UI. The helper checks the assertion, readable instructions, and freshness (24 hours), not standalone package installation. Reverify on every resumed task regardless of the freshness window.

```json
{
  "plugin": {
    "availableInApp": true,
    "instructionPath": "/actual/available/remotion/skills/remotion-best-practices/SKILL.md",
    "checkedAt": "<current ISO timestamp>"
  },
  "projectName": "launch-captions",
  "style": "active-word-highlight",
  "colors": {"base":"#FFFFFF","active":"#FFD54A","shadow":"#000000"},
  "colorsAccepted": true,
  "normalizedPath": "/task/normalized.json",
  "timing": {
    "status": "word-timing-reviewed",
    "provenance": "User-supplied word timestamps in seconds, source file transcript.txt"
  },
  "sourceOffsetMs": 0,
  "timelinePlacementMs": 0
}
```

Before timing is resolved, retain `timing.status` such as `untimed`, `cue-only` or `ambiguous`, and `audio` when supplied. Record unresolved questions in the run. The helper stops until semantic review produces `word-timing-reviewed`; never set this just to bypass a blocker.

`sourceOffsetMs` adds to every source timestamp inside the output. `timelinePlacementMs` is where MOV frame zero is placed in the editor. They are distinct. Example: words start at source 1500 ms, offset 500 ms, and MOV placed at 10000 ms: speech appears 2000 ms into the MOV / 12000 ms on the editor timeline. Preserve leading silence; do not subtract the first word time automatically. A negative offset that would truncate speech is rejected.

Saved `project.json` contains resolved shared settings, style, explicit colors, font asset/checksum, style options, timing provenance, both offsets and duration. Editing personal defaults does not alter it. `prepare` saves `projectPath` and a `prepared` snapshot of settings/captions in the run. The Remotion plugin scaffolds that path, then `attach` adds captions. Resume failed setup in the same folder; after attachment, use the `dependencies` helper to retry caption dependency installation. Keep node_modules and the project lockfile in that generated folder.
