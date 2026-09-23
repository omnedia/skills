# Configuration and run state

Precedence: shipped `config/defaults.json` → `~/.config/codex-motion-graphics/config.json` → explicit run settings. Nested export fields and color roles merge individually. `configure changes.json` updates personal defaults; `defaults` prints them. This namespace is independent of captions. `settings.json` in a prepared project freezes these choices; subsequent personal edits do not affect it.

Allowed settings: `projectFolder`, `width`, `height`, exact `fps` (integer or `30000/1001` string), `sourceOffsetMs`, `timelinePlacementMs`, `delivery` (`clips` or `sequence`), `renderByDefault` (must be `false`), `colors`, `exclusions`, and `export`. Colors are six-digit hex roles `surface`, `ink`, `highlight`, `accent`. Export settings describe the requested file format, not authorization to render. The export contract is ProRes/4444/yuva444p10le/MOV/PNG; `scale` must produce integer dimensions. Resolve output dimensions once without doubling an already-4K target.

Default behavior is compile → start Remotion Studio → open its actual URL in the browser. Keep `renderByDefault: false`, including when the user requests an export; a request authorizes that export, not automatic future renders. Record `renderRequested` and the actual `renderRequest` in the run only when the user explicitly asks for video rendering/export in the initial prompt or a follow-up. These run fields are orchestration records, not renderer settings. Do not infer a new request from an old completed export. Browser review is not a request for a preview MP4.

Run example (paths are examples; use actual absolute paths):

```json
{
  "projectName": "mountain-overlay",
  "projectFolder": "C:/Video/Projects",
  "planPath": "C:/Video/run/scene-plan.json",
  "sourcePath": "C:/Video/run/source.json",
  "plugin": {"availableInApp": true, "instructionPath": "ACTUAL_EXPOSED_REMOTION_SKILL_PATH", "checkedAt": "CURRENT_ISO_TIME"},
  "fps": "30000/1001",
  "delivery": "clips",
  "renderByDefault": false,
  "renderRequested": false
}
```

Omit `sourcePath` only for explicitly standalone plans. `prepare` preserves frozen inputs, `projectPath` and status. `attach` records scaffold/attachment completion. After compilation and browser opening, record `compilationComplete: true`, `studioUrl`, `status: ready-for-review` and `exportComplete: false`. Mark export complete only after a requested render succeeds. Keep blockers in the run. If input choices change before attachment, clear `prepared` and reprepare; never silently allocate another project after a failure.

Exclusion rectangles use `{x,y,width,height,space:"canvas"}` or explicit `space:"design"`. Optional `startMs,endMs` make a supplied track segment. Supply enough conservative rectangles to cover the track; there is no interpolation, detection or face-awareness claim. Canvas coordinates are transformed by the saved uniform fit. The design space is always 1080×1920. Exclusions are independent project inputs, not style defaults.
