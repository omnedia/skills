<div align="center">

# Omnedia Motion Graphics

### Give the important moments a visual story.

Turn selected passages from your transcript into editorial collage motion graphics, with layered imagery, photographic depth, and drawn emphasis ready for your editing timeline.

[![Category: Video](https://img.shields.io/badge/category-Video-2563eb?style=flat-square)](../../README.md#video)
[![Powered by Remotion](https://img.shields.io/badge/powered_by-Remotion-0b84f3?style=flat-square)](#requirements)
[![Output: ProRes 4444](https://img.shields.io/badge/output-ProRes_4444-7c3aed?style=flat-square)](#what-you-get)
[![Resolution: 4K](https://img.shields.io/badge/default_export-4K-facc15?style=flat-square)](#export-defaults)
[![License: MIT](https://img.shields.io/badge/license-MIT-16a34a?style=flat-square)](../../LICENSE)

[Install](#install) · [Update](#update) · [Preview](#the-style) · [How it works](#how-it-works) · [Requirements](#requirements) · [Development](#development)

<br>

<img src="styles/editorial-collage/preview.gif" alt="Editorial Collage motion graphics demonstration" width="540">

**Editorial Collage — Vox-inspired**<br>
<sub>Representative style demonstration. Delivered clips preserve alpha where the scene leaves the canvas transparent.</sub>

</div>

---

## Made for your editing timeline

Give the agent your transcript and word timing. It selects explanatory moments covering approximately 50% of the video's duration, or more when useful, builds each insert from at least three freshly generated scene images, and opens the editable project in Remotion Studio for you to check. Every animation gets a distinct spatial composition and motion approach. Exported clips are created only when you explicitly request rendering.

| | What you get |
| :--- | :--- |
| **Visuals with a purpose** | Selected explanatory moments become full-size editorial scenes with imagery, depth, typography, and precise annotations. |
| **Motion that follows meaning** | Reveals use actual word timestamps, with animated entrances, continuing parallax, readable holds, and designed exits. |
| **An editable result** | The Remotion project open in the browser, local assets and saved settings. Silent ProRes 4444 clips and placement instructions when rendering is explicitly requested. |

## Install

Give this directory URL to an agent that supports installable skills:

```text
Install this skill: https://github.com/omnedia/skills/tree/master/video/motion-graphics
```

Install the **complete skill directory**, including its style, fonts, assets, references, and helpers.

> [!IMPORTANT]
> The **Remotion plugin must be installed and available in Codex**. It creates each new project in your selected folder. Dependencies and generated projects stay outside the installed skill directory.

Then attach your transcript:

```text
Use the omnedia-motion-graphics skill with this word-timed transcript. Name the
project “Launch inserts”. Select the passages that benefit from a visual
explanation, and use the default colors and 4K export.
```

The agent reuses known editor settings and personal defaults. You can save a preferred project folder and color choices for later runs.

## Update

To update an existing installation, give your agent this prompt:

```text
Update my installed omnedia-motion-graphics skill to the current version at:
https://github.com/omnedia/skills/tree/master/video/motion-graphics

Update the complete skill directory, including its style, fonts, assets,
references, and helpers. Preserve my existing configuration at
~/.config/codex-motion-graphics/config.json, saved preferences, and project
folder setting. Do not reset or migrate my configuration, modify existing
motion graphics projects or run files, or change unrelated skills or plugins.
```

## The style

The bundled **Editorial Collage — Vox-inspired** style is selected automatically. Open its folder for the design brief and motion direction.

<table>
  <tr>
    <td align="center" valign="top">
      <a href="styles/editorial-collage/"><strong>Editorial Collage</strong><br><img src="styles/editorial-collage/preview.gif" alt="Editorial Collage preview" width="540"></a>
      <p>Large photographic or illustrated subjects, foreground and background depth, bold headings, paper materials, and drawn emphasis.</p>
    </td>
  </tr>
</table>

Every insert uses separately generated background, subject/midground and foreground imagery. Overlap and differential motion create visible depth throughout entrance, reading hold and exit. SVG/CSS is limited to supporting notes, labels, arrows and highlights; it never builds the background or scene environment. Full-screen scenes are the default; overlays retain the image-based style while leaving the base shot visible.

The starting palette uses warm off-white, charcoal, yellow, and coral. Keep those defaults, specify your own colors, or ask for the local color picker. The [style brief](styles/editorial-collage/STYLE.md) and [motion direction](styles/editorial-collage/motion-direction.md) describe the intended look; the [catalog](styles/catalog.json) records bundled defaults. The Vox reference describes inspiration, not official fonts or brand colors.

## What to provide

| Your input | What happens |
| :--- | :--- |
| Complete transcript with word timestamps | The agent selects passages and anchors scenes and reveals to the supplied word occurrences. |
| Transcript with sentence or cue timestamps | The agent can prepare an untimed scene plan; synchronized export needs actual word timing. |
| Plain or partially timed transcript | Planning can begin, but missing word timing must be supplied before synchronized export. |
| Explicit standalone brief with authored timing | The agent creates independently timed scenes without claiming speech synchronization. |
| Reference images, supplied assets or brand colors | They guide the generated scene images and visual treatment. |

> [!NOTE]
> This skill does not analyze audio or perform forced alignment. It preserves supplied word timing and never distributes cue words evenly or estimates speech timing from reading speed.

You do not need to supply images. The agent generates multiple fresh images per insert. It animates the transcript as supplied, without fact-checking or adding “laut Sprecher,” verification disclaimers or source captions. See [image generation](references/asset-sourcing.md) and the [timing contract](references/input-and-timing.md).

## How it works

1. **Read the complete source.** Check timing, the Remotion plugin, local runtime, and saved editor settings.
2. **Choose the visual moments.** Plan enough useful beats for approximately 50% animated coverage or more. Record the duration calculation and compare every insert's fresh assets, composition and motion approach in `editorial-plan.md`; redesign repeated treatments before production.
3. **Build the visual world.** Inspect the style GIF, then generate separate scene images for every insert. Plan support, foreground crossings and distinct choreography before adding notes. Use default colors or your overrides.
4. **Create the project.** Validate the plan, freeze its inputs, scaffold through the Remotion plugin, and attach the skill's assets and helpers. Extend the generated scene code when the treatment needs it.
5. **Compile and open Studio.** Measure text and compile geometry/timing. Start `npm run motion:studio`, then open its actual local URL in the browser for scene review. Keep the server running. Render clips and a placement manifest only if you explicitly requested export, either initially or in a follow-up.

Saved run state supports resuming interrupted work at the allocated project path. Personal default changes do not alter prepared projects, and attachment preserves completed project edits.

Default delivery is the editable project open in Remotion Studio, with no exported video files. `renderByDefault` is `false`; “create an animation” or a request to review scenes does not request export. Say “render/export the clips” in your initial prompt or a follow-up when you want video files. Opening Studio does not render a preview MP4.

## Export defaults

| Setting | Default |
| :--- | :--- |
| Composition | 1080 × 1920 · portrait |
| Render scale | **2×** |
| Export resolution | **2160 × 3840** · portrait 4K |
| Frame rate | 30 fps |
| Video format | ProRes 4444 · `.mov` |
| Transparency | Straight alpha · `yuva444p10le` · PNG render frames |
| Audio | Silent |
| Delivery | Individual full-canvas clips for selected scenes |
| Scene mode | Full-screen inserts; overlays available by request or editorial choice |
| Render by default | **No** — explicit render/export request required |
| Default review | Remotion Studio opened in the browser |

Full-screen scenes carry their designed backgrounds. Overlays, unused canvas, and sequence gaps retain transparency; a full-screen insert is not transparent throughout its entire image. Preview placeholder backgrounds are excluded from production exports.

Request `sequence` delivery for one sequence with transparent gaps. Other canvas sizes, exact frame rates such as `30000/1001`, and export scales are configurable. A landscape composition needs deliberate recomposition: the bundled portrait design does not automatically redesign itself for another aspect ratio.

Personal defaults live in `~/.config/codex-motion-graphics/config.json`, independently of the Captions skill. See the [configuration guide](references/configuration.md) for precedence, offsets, and saved settings.

## What you get

```text
your-project/
├── out/                        # Created only when export is explicitly requested
│   ├── *.mov                   # Final clips, or the requested sequence
│   └── placement-manifest.json # Exact timing and editor placement
├── motion/                     # Editable renderer and compilation helpers
├── scene-plan.json             # Selected passages, assets, and motion choices
├── editorial-plan.md           # Coverage calculation and distinct scene concepts
├── source.json                 # Saved source words and timing
├── settings.json               # Resolved project settings
├── project.json                # Compiled geometry and frame intervals
├── compiled-motion.json        # Compiled Studio snapshot
├── EDITOR.md                   # Import and timeline placement instructions
└── …                           # Fonts, assets, plugin scaffold, and dependencies
```

Place the clips above your footage with alpha enabled, using `EDITOR.md` and the placement manifest for timing, offsets, and handles. The deliverables are rendered assets and editable Remotion source; they are not MOGRT templates. The skill does not assemble or retime your base footage.

After edits, recompile and reopen Studio. Only when export is explicitly requested, run:

```bash
npm run motion:compile
npm run motion:render
```

For the default browser review:

```bash
npm run motion:studio
```

## Example prompts

**Select explanatory moments**

```text
Use the motion-graphics skill with this word-timed interview transcript.
Create editorial collage inserts where a visual explains a relationship
or change. Keep the other passages on the speaker. Name it “Interview inserts”.
```

**Use your brand colors**

```text
Create motion graphics from this word-timed transcript. Use #F1EDE4 for
surfaces, #202124 for ink, #F6CE46 for highlights, and #36AADD for accents.
Deliver separate clips at the default 4K resolution.
```

**Keep the base shot visible**

```text
Use the attached word timing and product images to explain this comparison.
Make it an overlay so the speaker remains visible, and deliver a single
sequence with transparent gaps between the selected scenes.
```

## Requirements

| Requirement | When needed |
| :--- | :--- |
| **Remotion plugin in Codex** | Every project; standalone Remotion packages do not replace the plugin. |
| Node.js 22+, npm, and Git | Local runtime and project setup through the Remotion plugin. |
| Remotion's rendering browser and host libraries | Font measurement, compilation, and rendering. |
| Actual word timestamps | Transcript-synchronized export. |
| Image-generation tools | Every insert needs multiple separately generated scene images. |
| Prepared masks and clean backing images | Treatments that separate photographic subjects into moving layers. |

Segmentation, inpainting, and automatic face or footage tracking are not bundled capabilities. Asset preparation can use a separately available workflow. Remotion's own licensing terms apply to its use.

## Inside the skill

| Path | Purpose |
| :--- | :--- |
| [`SKILL.md`](SKILL.md) | Agent workflow, timing rules, and delivery requirements. |
| [`styles/`](styles/) | Editorial Collage brief, motion direction, preview, catalog, and font. |
| [`assets/`](assets/) | Reusable Remotion code and local color-picker UI. |
| [`config/defaults.json`](config/defaults.json) | Starting canvas, frame rate, delivery, and export settings. |
| [`references/`](references/) | Timing, scene planning, asset sourcing, configuration, and export details. |
| [`scripts/`](scripts/) | Configuration, project preparation, attachment, and gallery helpers. |
| [`preview-transcript.json`](preview-transcript.json) | Source transcript for the representative demonstration. |

<details>
<summary><strong>What do the helpers do?</strong></summary>

| Helper | Role |
| :--- | :--- |
| `motion-graphics.mjs` + `core.mjs` | Check the runtime, save defaults, validate and prepare a run, and attach assets to the plugin-created project. |
| `gallery.mjs` | Serve the local color picker and persist selections. |
| `motion/compile.mjs` | Measure fonts and compile saved plans into geometry, frame intervals, and fingerprints. |
| `motion/render.mjs` | Render saved clips or a sequence and publish the placement manifest. |
| `motion/studio.mjs` | Open the generated project's compiled composition in Remotion Studio. |

</details>

## Development

From this skill directory, check a prepared run's prerequisites and authored plan:

```bash
node scripts/motion-graphics.mjs doctor /path/to/run.json
node scripts/motion-graphics.mjs validate /path/to/run.json
```

The run must contain actual plugin evidence and paths to its plan and source. These checks precede project creation; exact font measurement happens later through `motion:compile` in the generated project. Recompile after changing scene code, settings, or assets before rendering again.

Keep development projects and installed dependencies outside the skill directory. The [project and export guide](references/project-and-export.md) explains compilation, attachment recovery, and resumable exports. The [style acceptance criteria](styles/editorial-collage/STYLE.md#style-acceptance) guide style development and requested previews.

## License

Skill code and documentation use the repository's [MIT License](../../LICENSE). Bundled Inter Bold uses [SIL OFL 1.1](styles/editorial-collage/fonts/LICENSE.txt); [font sources and checksums](styles/editorial-collage/fonts/source.json) are included. Additional supplied assets and fonts retain their own licenses.

---

<div align="center">

**Meaningful moments. Layered motion. Ready for the timeline.**

[Back to the skill library](../../README.md#skill-library) · [View on GitHub](https://github.com/omnedia/skills/tree/master/video/motion-graphics)

</div>
