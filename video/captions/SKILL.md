---
name: captions
description: Create animated caption-only overlays in a new Remotion project from timed transcripts or supplied text with matching audio. Includes style/color selection and silent ProRes 4444 export with alpha. Requires the Remotion plugin in Codex.
---

# Captions

Create an editable Remotion project and a synchronized transparent caption overlay. The shipped style is **Active Word Highlight**. This directory is independently installable; the Remotion app plugin and local runtime remain mandatory prerequisites.

## Start or resume

Read the request and existing run context first. Keep a `run.json` in a task workspace outside the installed skill to retain inputs, choices and blockers across turns. Never repeat resolved questions.

1. Verify **Remotion is currently exposed as an installed, available plugin in this Codex task** and read its creation, captions, font and transparent-rendering instructions. Cached files or standalone npm packages alone are not evidence of availability. If absent, explain: “This skill requires the Remotion plugin in Codex. Install or enable Remotion in the app’s Plugins interface, then reload this task so its instructions are available.” Stop project creation/rendering until reverified. Do not invent an installation URL or treat another framework as a substitute. If installation controls differ, use the app’s plugin help.
2. Record current plugin evidence in the run; run `node <skill>/scripts/captions.mjs doctor <run.json>`. This separately checks Node 22+, npm, FFmpeg and ffprobe. Rendering also needs Remotion’s Chromium download and system libraries; the first preview proves browser readiness. Audio alignment additionally needs the Python setup in [input and timing](references/input-and-timing.md).
3. Load defaults with `node <skill>/scripts/captions.mjs defaults`. On first run, collect the default project folder and optionally named brand colors, then save with `configure <changes.json>`. Use supplied settings; no required dimensions/fps questionnaire. See [configuration](references/configuration.md).
4. Identify the transcript, matching audio if provided, project name, style and explicit overrides. **Inspect timing semantically before creating a project or doing expensive renders.** Read [input and timing](references/input-and-timing.md). Untimed text without audio is a hard stop. Cue-only timing is valid input but may still require audio to locate words. Never distribute words evenly or invent speech timing.

## Choose the look

Load [styles/catalog.json](styles/catalog.json). Skip style selection when the request already picks a valid style. Otherwise start `node <skill>/scripts/gallery.mjs <run.json>`, open its exact local URL, and let the user choose. It displays four columns on wide screens, readable smaller layouts, and a selectable placeholder if a GIF is unavailable. Only installed styles appear.

Read only the selected style’s instructions: [Active Word Highlight](styles/active-word-highlight/STYLE.md). If colors are unresolved, use the gallery’s role-labeled pickers, visible hex values, brand palette and live sample. The save button writes style, colors and acceptance into the run; read it before proceeding. With an already selected style, the gallery goes directly to colors. Skip this step when colors are explicit or defaults are clearly accepted. Never infer a highlight role from an arbitrary brand palette entry.

If the browser is unavailable, show the actual preview/name in chat, list the style’s color roles/defaults and named brand colors, and accept a named style and explicit role mapping or acceptance of defaults. Save the same fields in `run.json`. Close the gallery server after selection. Missing timing must not erase completed choices.

## Produce and deliver

Follow [project and export](references/project-and-export.md). Normalize semantically reviewed word timing into the internal Caption representation. Once prerequisites, timing, name and choices are resolved, run `prepare` to select an unused destination and save resolved settings. **Use the available Remotion plugin's creation instructions to scaffold and install a new project in that destination**, then run `attach` to add the caption component, font, data and export helpers. Do this automatically as part of the authorized request. The plugin owns project setup; this skill carries no project template, package manifest, lockfile or installed dependencies. Keep all dependency installations in the generated project, never inside the skill.

Render and inspect a short representative preview: exact font loading, word boundaries including pauses/repetitions, two-line layout, safe margins and fades. Request review only when a choice remains unresolved or the user asked for it; a fully specified overlay request already authorizes rendering.

Render the silent caption-only ProRes 4444 MOV with alpha. New projects default to 2× export scale (2160×3840 from the portrait composition), using PNG frames. The saved JPEG quality of 90 applies only to explicitly opaque JPEG workflows; omit it for PNG. Verify actual scaled dimensions, decoded alpha and composite samples over light/dark backgrounds. Do not bake a checkerboard or audio into the export. A keyable solid background requires an explicit request/editor requirement.

Deliver the MOV, editable project folder, saved `project.json`, and timeline placement instructions from `EDITOR.md`. Report any failed verification honestly; an unverified export is not a completed overlay. Keep personal defaults outside this skill and do not change them for one-off overrides unless asked.
