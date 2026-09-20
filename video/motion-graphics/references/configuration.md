# Configuration and run state

Precedence: shipped `config/defaults.json` → `~/.config/codex-motion-graphics/config.json` → explicit run settings. Nested export fields and color roles merge individually. `configure changes.json` updates personal defaults; `defaults` prints them. This namespace is independent of captions. `settings.json` in a prepared project freezes these choices; subsequent personal edits do not affect it.

Allowed settings: `projectFolder`, `width`, `height`, exact `fps` (integer or `30000/1001` string), `sourceOffsetMs`, `timelinePlacementMs`, `delivery` (`clips` or `sequence`), `colors`, `exclusions`, and `export`. Colors are six-digit hex roles `surface`, `ink`, `highlight`, `accent`. The export contract is fixed ProRes/4444/yuva444p10le/MOV/PNG; `scale` is configurable and must produce integer dimensions. Resolve explicit requested output dimensions against composition and scale once, without doubling an already-4K target.

Run example (paths are examples; use actual absolute paths):

```json
{
  "projectName": "mountain-overlay",
  "projectFolder": "C:/Video/Projects",
  "planPath": "C:/Video/run/scene-plan.json",
  "sourcePath": "C:/Video/run/source.json",
  "plugin": {"availableInApp": true, "instructionPath": "ACTUAL_EXPOSED_REMOTION_SKILL_PATH", "checkedAt": "CURRENT_ISO_TIME"},
  "fps": "30000/1001",
  "delivery": "clips"
}
```

Omit `sourcePath` only for explicitly standalone plans. `prepare` preserves frozen inputs, `projectPath` and status in the run. `attach` records scaffold/attachment completion; after successful compile and delivery the orchestrating agent records completion in the same run. Keep any blocker there. If input choices change before attachment, explicitly clear `prepared` and reprepare; never silently allocate another project after a failure.

Exclusion rectangles use `{x,y,width,height,space:"canvas"}` or explicit `space:"design"`. Optional `startMs,endMs` make a supplied track segment. Supply enough conservative rectangles to cover the track; there is no interpolation, detection or face-awareness claim. Canvas coordinates are transformed by the saved uniform fit. The design space is always 1080×1920. Exclusions are independent project inputs, not style defaults.
