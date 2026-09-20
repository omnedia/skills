# Plan: Omnedia Motion Graphics

Status: revised after council review and user direction; implementation plan only, no skill implementation yet.

## Objective

Create an independently installable Remotion skill at `video/motion-graphics` called "Omnedia Motion Graphics", using the workflow already established in `video/captions`. It should turn a timed transcript or a standalone animation brief into selectable motion-graphics treatments and editable, silent video assets for Premiere Pro and other editors.

Launch with exactly one style: **Editorial collage — Vox-inspired**, stable ID **`editorial-collage`**. Its identity is the animation language: photographic or illustrated cutouts, layered 2.5D depth, restrained camera travel, purposeful reveals, tactile surfaces and clear typographic accents. Apply it to people, objects, places, ideas, icons, diagrams or supplied material. A graphic does not need to prove a claim, cite a document or live in an evidence card to belong to this style. Select meaningful moments rather than animating every sentence. Additional styles are outside the initial implementation.

This replaces the earlier evidence-centered name and ID before implementation; no installed style or generated project needs migration. Documentary cards and charts remain possible components, not the definition or a prerequisite. The goal is to bring a selected image or concept to life, from a small transparent cutout to an explicitly requested full-screen animated collage.

Default to silent, transparent ProRes 4444 MOV overlays above the actual video. A cutout, icon, diagram or layered group floats directly on alpha; a paper card is optional. Texture and shadows are clipped to the relevant graphic objects, with unused canvas left transparent. A full-screen insert is available only when explicitly selected; it may contain a full photographic/illustrated background. Scene mode and background are saved choices, never inferred from the Vox-inspired name.

Normal delivery renders the final assets directly and stops after successful export. Do not extract frames, inspect graphics frame by frame, generate automatic previews, or run post-render visual/alpha/composite diagnostics. The user explicitly rejects that time and token cost. Deterministic input validation and layout compilation happen before rendering; they do not create a visual review loop.

## 1. What the captions skill already does

The following findings come from the current repository, not from running a new caption production job.

| Existing part | Observed behavior | Motion-graphics implication |
| --- | --- | --- |
| `video/captions/SKILL.md` | Coordinates intake, plugin checks, semantic timing review, style selection, project creation and delivery. | Preserve the overall workflow and its resumable behavior. Rewrite caption-specific instructions. |
| `scripts/captions.mjs` and `scripts/core.mjs` | Provide `defaults`, `configure`, `doctor`, `prepare`, `attach` and `dependencies`. `prepare` freezes settings and selects an unused destination; the Remotion plugin scaffolds it; `attach` adds rendering code. | Clone the lifecycle, with a motion scene plan in place of caption sentences as the rendering input. |
| `config/defaults.json` and `references/configuration.md` | Merge shipped settings, personal settings and explicit run overrides. Export fields merge individually. Generated projects freeze their settings. | Retain precedence and reproducibility; use a separate personal configuration namespace. |
| `styles/catalog.json` and `styles/*/STYLE.md` | Six installed looks, with color roles, previews, font assets and style-specific instructions. | Preserve discoverable styles, but add supported scene types, delivery capabilities and motion rules. |
| `scripts/gallery.mjs` and `assets/gallery/index.html` | Local token-protected picker; saves style/colors to `run.json`; emits `selection-saved`. Missing previews remain selectable. The agent continues after Save. | Reuse the interaction and continuation contract. Replace text-specific samples and hardcoded style branches. |
| `references/input-and-timing.md` and `scripts/align.py` | Semantically normalize inputs, preserve real word timestamps, optionally align supplied text with audio. Reject invented word timing. | Preserve immutable word timestamps and occurrence indices. This style does not analyze audio or align it; missing word timing produces an untimed plan and a request for timing before synchronized export. |
| Yellow Authority planning | The agent authors semantic decisions before preparation; deterministic code validates and compiles them; rendering consumes the saved result. | Strongest model for the new skill: agent-authored visual decisions, deterministic scene compilation, no semantic decisions during rendering. |
| `assets/caption-code/src/CaptionOverlay.tsx` | Routes to individual caption renderers through explicit style conditions. | Replace with a small style/scene registry rather than multiplying central conditionals. |
| `assets/caption-code/render.mjs` and `export-options.mjs` | Render a silent ProRes 4444 MOV with PNG intermediate frames, alpha and saved scale. Final output retains leading silence. | Reuse the alpha export mechanics. Add independent clip export and explicit background handling. |
| `tests/` | Tests configuration, timing, attachment, gallery continuation, fonts, layout and style behavior. Developer checks are separate from ordinary deliveries. | Adapt workflow tests and add meaningful scene/timing/export tests. |

### Boundaries that matter

- The source skill is more than instructions: it includes a working gallery, helpers, renderer code, bundled assets and tests. A prose-only copy would not reproduce its behavior.
- Timing, font handling, duration calculation and rendering are coupled to captions. `core.mjs` contains several style-specific branches; it is not a ready-made generic animation engine.
- The gallery's color sample is manually authored HTML, separate from the final Remotion renderer. A copied sample could misrepresent more complex graphics.
- The caption skill intentionally delivers without automatic preview renders or post-render diagnostics. Preserve that normal workflow as a requirement; keep bounded developer acceptance checks and user-requested previews distinct. Do not introduce frame-by-frame graphic verification in either workflow.
- The repository currently has no `video/motion-graphics` directory. Both skills must remain independently installable, as described in the root README.

## 2. Recommended product model

Separate three choices that would otherwise become entangled:

1. **Style:** the visual language; initially only `editorial-collage`.
2. **Component/treatment:** the visual construction, such as a cutout reveal, layered-photo parallax, paper clipping, annotated object or diagram.
3. **Delivery:** an isolated transparent clip or synchronized transparent sequence. An opaque background requires an explicit request and style support.

A style advertises the scene types it actually supports. Unsupported combinations fail clearly or receive an explicitly explained alternative; selecting a style must not silently fall back to another renderer.

Ship exactly one style in the catalog. A project may contain several supported components within it. Skip a redundant style-choice question; retain the gallery for color selection and the actual renderer preview. Future style additions are not a launch requirement.

### Scene, beat and clip

A **scene** is the atomic export unit: one independently placeable clip, with a complete entrance, readable content and exit, supporting one idea or subject. A **beat** is that selected moment; a scene may have internal steps, such as revealing a subject and moving through its layered surroundings. Shared objects and transitions belong to that scene. A local scene camera can move its cutout/image planes at different rates; it never manipulates the base video. Explanatory labels normally sit in a fixed overlay layer. A multi-beat preview contains several sparse scenes separated by clean intervals, not one continuous animation.

A synchronized **sequence** places those same scenes on the source timeline. It does not introduce extra transitions between scenes. Independent scenes may overlap with explicit layer order, but must not depend on a neighboring scene for their own animation. Cross-scene transitions and splitting internal beats into independently exported clips are deferred. This preserves continuity without requiring a general-purpose nested composition system.

The initial style supports compact graphics, wider layered arrangements and explicitly selected full-screen inserts. Individual clips retain the editor's full canvas with transparent unused space; do not automatically crop an object into a different-size video. A scene can have no text, no card, no paper texture and no source label when those elements do not serve the brief.

### Two entry paths

**Transcript-driven:** Read the complete transcript and retain its words/timestamps as immutable source data. Identify selected explanatory beats by meaning, with global zero-based, end-exclusive word ranges and exact anchor-word indices. Repeated spelling never identifies an occurrence. Without usable word timestamps, deliver an untimed plan and request timing before synchronized export; do not infer word onsets from cue intervals or distribute words evenly.

**Standalone:** Requests such as an animated cutout, a layered mountain image, an icon relationship or a paper reveal can use authored duration without a transcript. Mark timing as authored and make no speech-synchronization claim. This does not silently convert an untimed transcript request into a synchronized export.

Timestamped-word transcripts remain the primary path inherited from captions. Explicit standalone briefs use the same animation language without artificial transcript or documentary-evidence requirements.

## 3. Initial style: Editorial collage — Vox-inspired

Stable ID: `editorial-collage`. This section is the authored implementation brief, not a claim that a style, renderer, asset set or preview exists already.

**Style description:** Bring still imagery and ideas to life as layered editorial collage. Separate a subject from its surroundings, arrange foreground/midground/background planes, and use a controlled push, pull or lateral move to reveal depth. Combine photographic or illustrated cutouts with crisp type, graphic accents and optional paper material. Motion guides attention to the subject or relationship being explained. The style is defined by composition and movement, not by historical subject matter or an evidence-based content format.

### Style document structure and reference evidence

Create `styles/editorial-collage/STYLE.md` during implementation, using `video/captions/styles/vermilion-brush-editorial/STYLE.md` as a structural reference. Match its specificity, not its caption-only rules, fonts, word-coverage heuristics or screenshot diagnostics. Required sections: stable ID and scope; appearance and evidence; fonts/assets; automatic editorial plan; roles/components/templates; layering and geometry; timing; overrides and precedence; preview/export/validation.

Reference: [Chris Moran — How VOX gets that analog paper feel](https://www.instagram.com/reel/DYXFBeuqNPZ/) — user-identified technique-breakdown Reel, not an official Vox post. The online retrieval failed; the user subsequently supplied a local MP4, inspected for this revision. Local reference: `C:/Users/marku/Downloads/SnapInsta.to_AQNgqgRlN0RC6USIJFHIyelssluTIhOHjjIulQIJSrWRT2DQvebafZ_2K95nKWcLRIAPxgnbQzssoP1nZImsDO0f0a3FGk7Rla2mibc.mp4` (38.17 seconds, 720×1280, 24 fps). Reference identification comes from the user, not independent authorship verification. Ignore the attached text file from the earlier message.

Second reference: `C:/Users/marku/Downloads/transfer-01a0bf6d/Vox animation/How Vox brings their historical images to life .mp4` (37.38 seconds, 576×1024, approximately 23.98 fps). This user-supplied breakdown visibly demonstrates a cable-car image separated into depth layers and reanimated. Its title is context, not a requirement that our content be historical. No creator attribution beyond the supplied file is assumed.

Analysis status: sparse overviews and targeted frame samples from both files were visually inspected. This supports appearance and motion observations, not continuous playback, exhaustive frame analysis, audio analysis, font identification or measurement of exact easing/durations. Reference-only samples do not change the policy against post-generation frame-by-frame verification. Software/plugin screens inside the breakdown illustrate a technique; they are not instructions to install or use those tools.

#### Animation language established by the second reference

| Reference interval (approximate) | Visible observation | Style implication |
| --- | --- | --- |
| Opening, 1–4 s; result near 34–36 s | The cable car, foreground rocks and distant mountain/sky form a layered composition; their framing and relative scale change across the sampled states. | Make depth-separated still-image animation a core treatment, rather than moving one flat image and calling it parallax. |
| Breakdown, approximately 15–19 s | An isolated cable-car subject and foreground/midground/background layer organization are shown. | Store separate local image layers/masks, their anchors and depth relationships in the plan. Select a clear subject; layer count serves the composition rather than being decorative complexity. |
| Preparation, approximately 21–25 s | A removed subject leaves a hole in the background; a later sample shows the area filled. | Camera travel needs clean overlap or prepared backing imagery so motion cannot expose empty cutout holes. Plan available coverage before rendering. |
| Depth demonstration, approximately 27 s | A side view shows separated flat image planes in a 3D arrangement. | Support 2.5D planes with coherent depth-dependent transforms. A full 3D asset/model pipeline is not needed to achieve this look. |
| End, approximately 33–36 s | Camera controls and a reframed layered result demonstrate a controlled push through the scene. | Use one purposeful, restrained camera move per short beat; keep layer motion coherent and preserve the focal subject. Exact travel/easing is not measurable from this sampling. |

One opening sample is defocused and the result emphasizes visual depth. Treat depth blur as an optional accent, not mandatory motion blur or reduced readability. The primary observed technique is cutout separation plus camera-induced parallax. Promotional titles, presenter captions and software interfaces remain reference presentation, not required output elements.

#### Observed reference traits and scope of adaptation

| Reference evidence (approximate source time) | Visible trait | Adaptation for this style |
| --- | --- | --- |
| Opening, 0.25–1.75 s | Overlapping, slightly tilted paper documents; foreground article against a green graph-paper surface; monochrome photo and preserved newspaper typography. | Treat the focal evidence as a physical paper object with a restrained edge/shadow and optional backing sheet. Keep the external canvas transparent; the graph-paper background is not an overlay default. |
| Opening close-ups, 2.25–5.75 s | Enlarged article/photo details, visible paper fibers across light and dark regions, changing crop/scale and apparent paper curvature; one sample is noticeably defocused. | Use texture across the evidence composite, not just an empty card border. Allow an asset-only detail push/crop followed by a readable hold. Do not copy curvature, defocus or continuous dramatic movement into the default readable overlay. |
| Technique UI, 22.75–23.25 s | The selected paper layer's opacity visibly changes from 96% to 95%; underlying texture can show through. | This is a layer setting demonstrated in this composition, not a universal alpha-export setting. Offer slight internal paper translucency over a local backing, keeping labels solid and transparent output outside the card. |
| Technique UI, approximately 27–30.5 s | Curves adjustment, a color/tint picker, and a warmer, less digitally white paper treatment. | Gently soften highlights and warm the evidence surface. Do not infer exact curve points, color values or blend modes from the samples. Preserve colors when they carry evidential meaning. |
| Detail/final treatment, approximately 32.5–34.5 s | Fibers are visible over the dark photograph as well as the paper; the sheet reads as a printed object. | Use one coherent, low-contrast material treatment clipped to the evidence object, with source text and small details still readable. |

The first Reel's bright yellow promotional headline, italic tutorial callouts, presenter captions, graph-paper stage and software UI belong to its presentation. They do not define every output's typography/background. Together the references establish two complementary treatments within one style: tactile paper objects and layered still-image parallax. Neither requires every scene to contain documentary evidence, and neither verifies our exact typography, chart, locator or timing defaults.

All numerical defaults below remain proposed calibration values, not measurements of the Reel. The observed 95% editor-layer opacity is reference evidence only, not a mandatory setting. Do not claim fonts, licensed assets, previews, exports or checks exist until actually created and checked.

### Appearance, fonts and assets

Choose a focal subject, preserve a strong silhouette and create readable depth through overlap, scale, controlled motion and restrained shadows. Photography may retain natural color; illustrations and vector objects use the same compositional language. Paper fibers, warm matte surfaces and slight clipping tilt are available material treatments, not mandatory wrappers. The existing off-white `#F1EDE4`, near-black `#202124`, yellow `#F6CE46` and red `#D94A45` remain a configurable accent palette; do not recolor every source image into it. These exact colors were not measured from either reference.

For document/photo treatments, prefer subtle fixed paper fibers across the paper and embedded evidence image, including dark areas, rather than animated video noise or texture only on the card border. Bundle/source a legitimate texture or deterministically generate a non-evidentiary material pattern; freeze its asset/seed and record its identity. Make texture strength configurable and disable it if small evidence details lose clarity. Charts and small text may use a quieter surface so data remains crisp. No per-frame random flicker, artificial stains that resemble annotations, or invented documentary marks.

Optional internal paper translucency can blend the evidence surface with its own local paper backing. Keep the enclosing card's backing and explanatory labels opaque enough to remain readable; do not lower the opacity of the whole overlay or assume what footage lies behind it. Warm tint and subdued highlights apply only to the evidence treatment, never the actual video. Preserve meaningful source colors, fine print and factual details; a decorative monochrome conversion is inappropriate when color encodes evidence.

Use approved bold sans-serif font assets for headlines, with suitable readable faces/weights for labels and sources. Headline sizes: 76–104 design px; labels: 40–48 px; source attribution: at least 36 px. Do not assume a font from the reference or reuse Brunson/Brush Script merely because the caption style is the structural model. Select actual licensed font files during implementation, record family/weight, hashes, coverage, provenance and fallback policy, then measure after those files load. Default to a clear error for missing fonts/glyphs; a fallback must be explicitly recorded and trigger remeasurement.

Preserve native typography inside authentic document imagery, including its serif headlines; the sans-serif rules apply to newly authored explanatory labels, not a restyling of the evidence. Enlarge/crop a genuine excerpt or supply a faithful labeled transcription when its original text is too small. Do not reproduce a publisher masthead or fabricate a newspaper layout to make unsupported text look sourced.

Use supplied, licensed/sourced or explicitly created illustrative assets, frozen locally before rendering. Generic icons, illustrated objects, conceptual graphics and decorative textures do not need documentary evidence. When an image, quote, chart or map makes a factual claim, preserve its meaning and record the appropriate source; never fabricate quotations, values or documents. Visible source labels are conditional on content/attribution needs, not compulsory on an icon or generic cutout. Distinguish illustration from an authentic photograph where that distinction matters. Geographic data must be real when a component purports to locate a real place.

Initial scope includes a small layered collage and 2.5D parallax, not a general 3D modeling or character-animation system. Prepare cutouts from supplied masks/layers or an available image-preparation workflow, keeping original assets. Background cleanup may fill noncritical hidden texture where authorized; do not invent meaningful historical details. Record derived images/masks and preparation provenance. If clean layers or hidden-area coverage are unavailable, reduce travel, crop differently, use an honest single-plane reveal or request the missing asset. Do not silently promise automatic segmentation or inpainting that has not been implemented.

### Reels-first roles, components and templates

Default to compact 9:16 graphics supporting the speaker/footage, with one idea per beat. Skip title cards, long introductory reveals and end-card branding unless requested. Onsets follow semantic word anchors, never an every-two-seconds cadence.

Use at most one focal subject/group and two subordinate accents in a small overlay. Foreground/subject/background planes within one coherent group do not count as three unrelated ideas. Default labels use 1–4 words, simple processes 2–3 nodes, comparisons two values. Text and attribution are optional unless the content needs them. Simplify clutter rather than treating all available components as a checklist.

The launch components are `cutout-reveal`, `layered-parallax`, `paper-clipping`, `object-callout` and simple `text-diagram`. The remaining rows describe compatible later extensions; they are not an initial evidence-feature checklist and stay hidden from the catalog until implemented.

| Component | Selection purpose and constraints |
| --- | --- |
| `cutout-reveal` | A person, object, illustration or icon enters with a controlled mask/translation/scale and settles; no card or text required. |
| `layered-parallax` | Separate foreground, subject/midground and optional background planes; animate coherent depth-dependent translation/scale with a local camera. Use two or three planes by default. |
| `paper-clipping` | A photo, illustration or document behaves as a tactile sheet with optional texture, backing and slight tilt; factual evidence is only one possible use. |
| `object-callout` | Draw an arrow, line, circle or brief label toward a selected subject/detail; geometry follows the associated object transform where attached. |
| `quote-highlight` | A sourced assertion or precise quotation detail; one detail per beat, faithful wording and attribution. |
| `document-detail` | Crop a real document to the relevant evidence; retain source identity and factual context. |
| `photo-annotation` | Annotate a supplied/sourced photo with at most two supporting callouts. |
| `two-category-chart` | Compare two supplied values with units, labels, scale/domain and sources saved; zero-baseline bars, no unsupplied intermediate data or trend claims. |
| `timeline` | Chronology from real dated events; support 3–5 events, default to three per compact beat. Four/five-event layouts require explicitly selected space and narration time, usually a full-screen insert. |
| `geographic-locator` | Explain a place using real geometry and sourced coordinates; route growth only with supplied/sourced route information. |
| `text-diagram` | A generic concept, relationship or process rendered with concise labels/shapes; a first-class component, not merely a missing-evidence fallback. |

Selection is agent-authored judgment about which subject, action, relationship or detail benefits from movement or visual emphasis, not a keyword lookup or requirement to find evidence. Labels may faithfully summarize; actual claims, quotes, names, units and values retain source meaning. Unillustrated speech is expected. The core launch acceptance centers on cutout/parallax/paper treatments; specialist charts, timelines and locators are supporting extensions and must not displace that work.

### Layering and geometry

Design space: **1080×1920**, with **64 px outer margins**, uniform scaling and no stretched text. The **40 px padding** applies only when a card is used. Default export scale is **2×**, producing **2160×3840 portrait 4K**. All layout measurements remain design pixels; do not double them again. For other editor canvases, uniformly fit and center this design space, transform exclusion zones into it, and reject unreadable arrangements rather than stretching to fill.

Default layer structure: optional far/background plane → midground/subject → near/foreground plane → graphic accents/connectors → fixed explanatory type and conditional attribution. Paper/card surfaces are optional sub-compositions. Save depth, stack order, pivot, crop, masking, per-layer travel/scale and camera parameters explicitly. Overlay mode leaves pixels outside the chosen objects/group transparent. Do not introduce an opaque rectangle merely because a parallax background exists; a full background belongs in an explicit full-screen insert or deliberately bounded image window.

Parallax is relative motion: near layers usually move/scale more than far layers under one coherent camera path. A flat whole-image zoom is a valid simpler treatment but must not be described as layered parallax. Two-dimensional transforms can implement the depth impression; true perspective planes are optional if the renderer supports them deterministically. Do not require a particular After Effects plugin or copy software settings from the reference. Keep subject parts aligned unless independent object movement is explicitly authored.

Reserve each layer's full motion bounds and backing coverage before rendering. Use overscan, overlaps or a prepared background to avoid exposed cutout holes and edges. Decorative foreground may extend beyond a bounded image window intentionally; important subject details and labels must remain inside protected bounds. Shadows belong to the layered artwork; never invent a shadow cast onto unknown underlying footage.

Implement surface/evidence as a local material sub-composition: optional backing sheet, restrained edge shadow, paper surface, authentic evidence, then a clipped low-contrast material treatment. Authored labels, source attribution and chart annotations remain above that material pass and crisp. A document may use a slight fixed tilt and one backing sheet, provided its transformed bounds/shadow fit the safe region. The backing is part of the primary group, contains no invented evidence and does not license a sprawling collage. Default to no tilt for charts and small reading-heavy layouts. Reserve the complete transformed bounds before revealing content.

Reserve supplied caption, face and platform-UI regions/tracks. Exclusion zones are project inputs separate from the authored style; optional platform presets are configurable assumptions, not device guarantees. With no supplied face regions/tracks, use authored safe zones and never claim face awareness. No audio analysis, footage manipulation or automatic face tracking. Supplied tracks may constrain graphic placement; they do not authorize analyzing or modifying footage.

Premeasure complete labels and planned geometry after font loading. Reflow before shrinking; labels never fall below 36 design px and source text, when present, remains at least 36 px. No accidental clipping, rewrapping or re-layout as elements appear. Authored cutout/camera movement is intentional and uses precomputed bounds. If no placement fits protected regions, simplify or omit. The local camera affects only the graphics' image planes; explanatory labels remain fixed by default, while object-attached accents follow their associated saved transforms.

### Timing and motion

Target 1.5–3 seconds for a simple cutout/icon reveal and 3–5 seconds for a layered image, comparison or sequential process when narration permits. Use enough time for the intended movement to register. Reading-heavy paper/chart treatments retain a target of 2.5–4.5 seconds with at least 1,400 ms of completed readable content. That is not a mandatory frozen hold for every text-free parallax scene. Gentle coherent camera travel can continue during an image's viewing interval; labels and essential content must remain readable. These are calibration targets, not forced cuts; short beats simplify or disappear without retiming speech.

| Motion | Proposed default |
| --- | --- |
| Object/paper entrance | 250 ms mask/translation, cubic-out; optional restrained scale/tilt settle. |
| Layered scene camera | One slow push, pull or lateral move over the available viewing interval, with depth-dependent layer transforms. No fixed numeric depth/travel claimed from the reference. |
| Highlight sweep | 300 ms, nominally starting 120 ms after evidence arrival, aligned to the relevant phrase. |
| Chart/route growth | 500 ms, linear, anchored to the relevant spoken value/place; no elastic bars. |
| Label stagger | 120 ms within a semantically eligible group; never reveal a fact before its anchor just to satisfy stagger. |
| Transition/exit | 250 ms; all motion and hold fit within the saved scene interval. |

Record actual anchor/event times. If the nominal highlight delay conflicts with a phrase anchor, prioritize the semantic anchor and record the resolved delay; never shift the word. Keep the subject visible through its spoken reference and meet any component-specific reading hold. Simplify or omit when the window cannot support it. Precompute seeded randomness. Rendering is a pure function of frame, fps and the saved plan, including all layer transforms.

Motion grammar: **establish → reveal depth or a relevant detail → settle or continue a gentle viewing move → exit**. Choose one main camera direction per short scene. Maintain coherent layer relationships rather than assigning unrelated wiggles. For reading-heavy components, finish disruptive motion before their readable hold; a text-free layered scene need not freeze. Keep explanatory labels stable; object-attached accents follow the corresponding transform. Zero camera travel remains appropriate for the two-bar fixture. Large page bends, sustained defocus, arbitrary wobble, elastic data graphics and elaborate 3D modeling are outside the default. Exact easing, depth and travel values remain implementation calibration, not measured reference facts.

### Overrides and implementation deliverables

Precedence: **style defaults → project overrides → scene overrides → component overrides**. Keep authored overrides separate from resolved `graphicsPlan`. Expose `asset`, `layers`, `camera`, `depthStrength`, `surface`, `highlight`, optional `sourceLabel`, component-specific `chartDomain`, `annotations`, `crop`, `sceneMode` and `cameraTravel`. Each image layer specifies its asset/mask, pivot, depth/relative travel, scale and motion bounds; camera specifies the authored path and interval. Use `asset` rather than the earlier proposed `evidenceAsset` name. Required timing, factual fidelity where applicable, font coverage and protected regions are validation invariants.

Add a proposed `paperTreatment` override group for `textureAsset` or frozen `textureSeed`, `textureStrength`, `internalPaperOpacity`, `tint`, `edgeShadow`, `documentTilt` and `backingSheet`. Resolve these into the saved plan and include them in asset/layout fingerprints. Values are implementation calibration choices; do not hardcode the Reel's observed 95% as the output alpha. Keep readable-state geometry and evidence fidelity invariant across treatments.

Implementation must deliver the style Markdown, actual planner/renderer integration, a fixture-grounded override example and a representative preview through the actual renderer. Build a synthetic **20–30 second timestamped transcript** with **3–5 selected treatments** and clean transparent intervals: include a text-free cutout, a two/three-plane parallax composition, a paper/photo treatment and an optional callout/diagram. The preview must demonstrate the animation identity without relying on a chart or source card. Use a neutral portrait placeholder only as a preview background; never bake it into alpha export. Demonstrate phone-size readability in bounded playback, not exhaustive frame inspection.

Use the existing transparent ProRes contract. Development tests cover entrance/settled/exit state, fast speech, repeated words, long labels, protected regions and shuffled-frame determinism using saved geometry/state assertions and a bounded representative renderer preview. Do not copy the captions reference's seek-check PNG comparison workflow. Normal deliveries still have no automatic previews or frame-by-frame/post-render graphic verification.

## 4. End-to-end workflow

1. **Resume or initialize the run.** Preserve resolved choices, source paths and blockers outside the installed skill. Verify the available Remotion plugin and runtime before project creation, following the captions lifecycle.
2. **Resolve the brief.** Identify transcript-driven versus standalone work, existing source timing, intended editor canvas/fps, requested style and supplied assets. Use known settings and explicit requests without repeating questions.
3. **Resolve colors for the single style.** Select `editorial-collage` automatically. Use its defaults unless overrides are supplied; if color selection is needed, reuse the gallery's role mapping and Save-to-continue behavior. While it is open, inspect timing and assets. Do not render or finalize color-dependent scenes before an opened picker is saved.
4. **Author the visual plan.** The agent selects meaningful moments and explains the purpose of each scene. It chooses content, scene type, asset references, placement and entrance/hold/exit timing. Avoid keyword-to-icon lookup rules and animation for every sentence.
5. **Validate the plan and resolve assets.** Perform dependency-free schema, capability, source-reference, timing and asset checks. Resolve local assets, font coverage and data sources. Compile frame intervals, but do not pretend to measure text before the rendering runtime exists. Resolve ambiguous factual content or omit the affected graphic with a recorded reason; do not invent values, targets or visual specificity.
6. **Prepare, scaffold and attach.** Freeze the project settings; select an unused folder; let the Remotion plugin create the project; attach motion-graphics code, source plan and assets. Resume failures in the same project using the recovery contract below.
7. **Compile measured layout.** Use the generated project's installed runtime and exact local fonts to measure text and persist final geometry. Include compiler/renderer identity in fingerprints. Reject stale or incompatible plans before rendering. This is deterministic compilation, not screenshot-based graphic verification.
8. **Render the requested deliverables.** Render the final transparent ProRes overlays directly. Rendering consumes the saved compiled plan and local assets without model calls, asset searches or network-dependent semantic choices. Do not add frame extraction, frame-by-frame inspection, automatic previews or post-render diagnostics. Previews or diagnostics require a specific user request.
9. **Deliver editor-ready files.** Successful renderer completion finishes the export step. Include the MOV file(s), editable project, saved project settings, placement manifest and `EDITOR.md`. State exact placement times and any explicitly requested opaque background.

## 5. Scene plan and timing contract

Use separate artifacts for different responsibilities:

- `run.json`: mutable orchestration state, choices, blockers and project location.
- `source.json`: normalized, preserved transcript/timing when applicable.
- `scene-plan.json`: authoritative, editable authored `graphicsPlan`, selected scenes and source references; authored overrides stored separately from resolved decisions.
- `project.json`: frozen settings plus derived compiled `graphicsPlan`, measured geometry, asset hashes, schema/compiler/renderer identities and plan/source fingerprints consumed by the renderer. This is a compiled copy, not a second authoring source.
- `export-state.json`: recoverable per-scene export progress and fingerprints; not the final placement manifest.

Each planned scene needs:

| Field | Purpose |
| --- | --- |
| Stable scene ID | Relates plan, rendered clip and editor manifest through revisions. |
| Component and content | Validated treatment parameters and optional labels/content. Units, chart scale and attribution apply only to components that need them. |
| Source reference | Global zero-based, end-exclusive word ranges into immutable source data, with exact anchor-word indices; absent only for explicitly standalone scenes. Repeated text never identifies an occurrence. |
| Purpose | Brief explanation of what the visual clarifies and why it belongs at this moment. |
| Timing | Source anchor/range or authored standalone duration; separate reveal, visible start/end, entrance, readable hold and exit. Handles are optional and explicit. |
| Placement | Spatial coverage, anchor, bounding region, safe margins and explicit layer order where scenes overlap. |
| Assets and optional factual sources | Local asset/mask IDs; data/source references only where charts, quotes or factual content require them. |
| Mode and background | `overlay` by default: cutout/group with transparent unused pixels; optional local card/image window. `full-screen` only when explicitly selected. Preview background never enters alpha export. |

Before rendering, persist each scene's ID, source ranges, component, mode, start/end, anchor word when synchronized, ordered layers, asset IDs, optional content, resolved geometry, motion/camera parameters and selection reason in `graphicsPlan`. Include cutout masks, pivots, depth relationships and coverage bounds for parallax. Save immutable source fingerprints and precomputed random values. The renderer makes no new semantic choices. Documentary evidence and visible attribution are not required plan fields for generic imagery.

Retain captions' distinction between source offset and editor placement. For synchronized output, a source time `t` appears inside the file at `t + sourceOffsetMs`, and on the editor timeline at `timelinePlacementMs + t + sourceOffsetMs`.

For individual clips, trim to the scene's resolved start and record that start as the clip's placement. A scene starting at source 12 seconds with a 0.5-second source offset and a 10-second editor placement produces a clip placed at 22.5 seconds. Its local animation begins at frame zero. Optional handles must be explicit and included in the placement calculation.

### Frame conversion and visibility

Store fps as an exact numerator/denominator, for example `30/1` or `30000/1001`; do not substitute the rounded label `29.97` for `30000/1001`. Convert nonnegative time `t` in milliseconds using `Q(t) = floor(t * fpsNumerator / (1000 * fpsDenominator) + 0.5)` (nearest frame, half up), with rational arithmetic for the conversion. All intervals are end-exclusive. Reject collapsed or reversed required intervals rather than silently lengthening them.

Compile each absolute source event as `Q(t + sourceOffsetMs)`. Quantize the editor origin once as `Q(timelinePlacementMs)` and add it to those compiled boundaries for both export modes. Derive every beat's local frame by subtracting the compiled clip start; never separately round a local duration. Persist rounding differences, including the editor-origin difference, and derive manifest times from those frame counts. No exporter performs its own rounding. Adapt end-exclusive ranges to any renderer API's range convention in one place.

The source range identifies evidence; it is not automatically the visible interval. Each graphic onset/reveal is tied to an exact semantic word anchor; the card may enter at an earlier relevant word than its value reveal. The exit may finish after the source range if the plan records those bounds and the completed-state hold. Standalone timing uses an explicitly authored origin. Check any overlap through the saved layer order. Negative file-time boundaries are an error requiring an explicit timing/origin adjustment; never silently clamp or truncate them.

Optional leading/trailing handles extend the exported interval with transparent padding and do not retime the scene. Derive clip placement from the handle-inclusive compiled start and the animation's local origin from its offset inside that clip. Reject handles extending before file frame zero unless the plan's origin is explicitly adjusted. With no handles, the local entrance starts at frame zero.

Additional rules:

- This style requires actual word timestamps for synchronized transcript work. Cue-only or untimed material can support an untimed editorial plan, but export waits for the required word timing. No audio analysis or forced alignment is added.
- Never distribute words evenly or shift source speech to make an animation fit.
- Standalone animation duration can be authored freely within the brief; label it as authored timing.
- Duration includes the complete exit. Replace the caption-specific fixed tail with scene-specific timing.
- If a visual is too complex for its window, simplify it or report the timing conflict. Do not silently rush it.
- Gaps are intentional; transcript coverage is not required. Record overlaps and compositing order explicitly.
- Changes to source, plan, assets, layout-relevant settings, schema, compiler or relevant renderer code invalidate the compiled plan. Recompile before rendering; preserve pinned dependency versions and copied renderer source in generated projects.

### Primary animation fixture: a layered image without an evidence card

Prepare a small illustrative mountain composition with a foreground cutout, a midground subject and a distant mountain layer. Use properly prepared local illustrative assets with separate alpha/masks and sufficient coverage; these are proposed fixture assets, not files already created. The fixture is standalone, text-free, has no documentary claim and needs no source label or paper card. Render it as a bounded irregular/windowed graphic on transparent canvas; the same treatment can fill the frame only through explicit full-screen selection.

Proposed calibration: 3.5 seconds, 250 ms entrance, one camera move across the 3-second viewing interval, 250 ms exit. Example endpoint travel over that viewing interval: far layer 12 px, subject 30 px, foreground 60 px in a coherent direction. These are authored design-pixel defaults for this fixture, not measured reference values or independent wiggles. Reserve all motion bounds and keep plane coverage valid throughout. No base-video motion, fabricated source labels or random motion.

The final `graphicsPlan` must name all three asset/mask IDs, their stack/depth order, initial geometry, pivots, camera interval and resolved transforms. Its override example must target this fixture's real scene/layer IDs and demonstrate changing camera travel while preserving safe bounds. Test numerically that layer-relative positions change, the focal subject remains in its safe region, and evaluating shuffled frames produces the same transforms. One flat image scaled as a whole fails this parallax fixture. A bounded development preview confirms the intended depth impression; no exhaustive frame verification.

### Secondary timing fixture: two values at their own anchors

Retain the following chart example to specify indexing/placement arithmetic for a future/supporting component. It does not define the style, require charts at launch or replace the primary cutout/parallax acceptance fixture.

Synthetic fixture: **“In 2020, sales were 20 units; in 2024, 40 units.”** Treat this as supplied synthetic data, not a factual business claim. Render two zero-baseline bars in a 1:2 height ratio, with dates and units. Do not interpolate intermediate years or add a trend claim. The fixture's ten words occupy global indices `[0,10)`; an implementation embedding it in a longer preview must update those indices rather than identify repeated words by spelling.

| Global index | Immutable word | Start/end ms |
| --- | --- | --- |
| 0 | In | 9700 / 9800 |
| 1 | 2020, | 9800 / 9900 |
| 2 | sales | 10000 / 10100 |
| 3 | were | 10100 / 10200 |
| 4 | 20 | 10250 / 10500 |
| 5 | units; | 10500 / 10700 |
| 6 | in | 11300 / 11400 |
| 7 | 2024, | 11400 / 11700 |
| 8 | 40 | 12000 / 12350 |
| 9 | units. | 12350 / 12500 |

Proposed authored `scene-plan.json` shape, to become schema-validated during implementation (not an existing API):

```json
{
  "schemaVersion": 1,
  "style": "editorial-collage",
  "graphicsPlan": {
    "scenes": [{
      "id": "sales-comparison",
      "component": "two-category-chart",
      "sceneMode": "overlay",
      "sourceRanges": [[0, 10]],
      "anchorWord": 2,
      "startMs": 10000,
      "endMs": 14500,
      "exitStartMs": 14250,
      "selectionReason": "Compare two supplied sales quantities without adding intermediate years or a trend claim.",
      "layers": ["surface", "chart", "annotations", "labels", "source"],
      "assets": [],
      "content": {
        "unit": "units",
        "chartDomain": [0, 40],
        "chartScale": "linear",
        "sourceLabel": "Synthetic fixture",
        "values": [
          {"label": "2020", "value": 20, "anchorWord": 4},
          {"label": "2024", "value": 40, "anchorWord": 8}
        ]
      },
      "geometry": {"card": {"x": 120, "y": 900, "width": 840, "height": 640}, "padding": 40},
      "motion": {"entranceMs": 250, "growthMs": 500, "exitMs": 250, "growthEasing": "linear", "cameraTravel": 0}
    }]
  },
  "authoredOverrides": {
    "project": {"surface": "#F1EDE4", "highlight": "#F6CE46"},
    "scenes": {
      "sales-comparison": {
        "sceneMode": "overlay",
        "components": {"two-category-chart": {"chartDomain": [0, 40], "sourceLabel": "Synthetic fixture", "cameraTravel": 0}}
      }
    }
  }
}
```

This is an override example grounded in the specified fixture, with scene/component keys that resolve to the actual scene and component. The implementation must validate it against its final schema. The asset list is empty because this chart uses supplied values and vector geometry, not a fabricated document. Actual font identities and measured label/bar geometry are added by compilation. The proposed card fits the 64 px margins but must still pass supplied exclusion-zone and measured-text checks.

The card enters at word 2; the first bar grows at word 4 and the second at word 8. The second completes at 12,500 ms; the completed chart holds until 14,250 ms (1,750 ms), then exits. No source word moves. Dates/units are part of the chart, and the source label remains visible with it. With fps `30/1`, `sourceOffsetMs = 500`, `timelinePlacementMs = 10000`, and no handles:

| Compiled value | Result |
| --- | --- |
| Scene interval inside synchronized output | `[315, 450)` |
| Individual clip duration | 135 frames / 4.5 seconds |
| Local entrance / bar reveal frames | 0 / 8 and 60 |
| Second bar complete / exit start | Local frame 75 / 128 |
| Local exit interval | `[128, 135)` |
| Individual clip editor placement | Frame 615 / 20.5 seconds |
| First bar reveal on editor timeline | Frame 623 / approximately 20.7667 seconds |
| Synchronized MOV editor placement | Frame 300 / 10 seconds |
| Rounding differences | First bar reveal and exit start round +1/60 second; scene boundaries and second bar onset are exact. |

The placement manifest records this scene ID/file, `[0,10)` source range, source time range `[9700,12500)`, `[315,450)` sequence range, 135-frame duration, frame-615 placement, `30/1` fps, a 1080×1920 composition exported at scale 2 to 2160×3840, overlay mode, straight alpha, layer order and per-event rounding differences. Both export modes consume the same compiled scene/local frame function. Check placement with arithmetic/unit fixtures, not by extracting every rendered frame.

### Editing and recovery

Users revise `scene-plan.json` and the documented settings fields, then run a generated-project `motion:compile` command before `motion:render`. Compiled geometry is derived and is never a second authoring source. Studio and rendering must refuse stale compiled data with an actionable recompile message. Preserve user edits to renderer source; include them in fingerprints and never overwrite them through reattachment.

Record preparation, scaffold, attachment and compilation completion in the run. Attachment distinguishes a complete compatible project, a recoverable partial attachment and conflicting user files. Record helper-owned paths and expected hashes so a retry can complete matching partial files without overwriting unknown content. Resume the same allocated project instead of choosing a fresh suffix after a failure.

Render each clip to a temporary path, then rename it and mark it complete only after the renderer returns success. Save its scene/settings/code fingerprint and output hash without visual inspection. On retry, reuse only matching completed entries whose files still exist and match their recorded hash; incomplete outputs are not complete clips. Publish the final placement manifest only when every requested output succeeds. Keep partial progress in `export-state.json` and report failures honestly. A revised export replaces only helper-owned matching output paths; preserve conflicting files. Selective rendering optimizations beyond safe retry reuse may follow later.

## 6. Assets, rendering and extensibility

Bundle approved fonts and reusable cutout/collage primitives needed by `editorial-collage`, with source/license metadata and hashes. Prefer editable vectors for icons, masks, connector lines and diagrams; include actual prepared assets for the preview. Do not copy unrelated caption fonts or assume their notices apply to new uses.

Copy source imagery, derived cutouts/masks, textures and other assets into the generated project. Record provenance and attribution requirements without turning every graphic into a research task. Illustration can be created as illustration; it cannot impersonate documentary evidence. Source-backed/data-driven components preserve supplied or verified values and wording. An inability to source a document does not block an unrelated icon, conceptual diagram or image animation.

One machine-readable capability registry drives gallery availability, plan validation and renderer dispatch. Each style supplies supported scene/beat types, parameter schemas, spatial coverage (compact/full-canvas), aspect-ratio constraints, background support, required assets/fonts, default color roles, layout/motion guidance and a preview fixture. Each scene renderer has deterministic frame-based behavior. Shared primitives can handle entrances, masks, arrows, shapes and layout without trying to build a general animation framework.

Use design-pixel coordinates in the 1080×1920 reference space with origin at the top left, x increasing right and y increasing down. Compile the uniform fit transform once; do not mix pixel/normalized coordinates implicitly. Save layer-local anchors/crops and their scene transforms. Supplied face/caption/platform exclusion regions or tracks map into this space and remain separate from style defaults. Without supplied face regions/tracks there is no face awareness. Preparing still-image cutouts and animating the graphics' local camera is allowed; analyzing/manipulating the underlying video is not part of this skill.

Use the same rendering components for shipped gallery demonstrations and real outputs. The gallery may offer immediate palette swatches or a clearly labeled static sample; it must not claim those are a live animation preview unless they actually use the renderer. Demonstration backgrounds stay separate from production content.

## 7. Delivery contract for editors

Recommended default: **one silent ProRes 4444 alpha MOV per selected scene**, plus a placement manifest. This intentionally differs from captions' one long overlay: independently adjustable clips are the primary output requested here.

Also offer **one synchronized sequence MOV** on request. Preserve transparent gaps and source timing. Do not automatically render both modes, which would add unnecessary rendering work and files.

The style defaults to cutouts or compact layered groups on transparent canvas. Paper cards and bounded photographic windows are optional. Full-screen inserts require explicit `sceneMode: full-screen`; record whether their background fills the canvas. Never export a gallery background or portrait placeholder, or silently turn an overlay into a full-screen insert. The actual video remains in the editor beneath the overlay and is never baked into it.

Reuse the source pipeline's exact alpha export settings: MOV container, `codec: prores`, `proResProfile: 4444`, `pixelFormat: yuva444p10le`, PNG intermediate frames and no audio. Omit JPEG quality for PNG. Document straight/unmatted alpha interpretation for editor import. These settings apply to both compact overlays and explicitly selected full-screen scenes, and to both clip and synchronized sequence exports. A selected full-screen surface can be opaque even though the file format supports alpha.

Honor supplied editor dimensions/fps and saved personal defaults. Ship `config/defaults.json` with **width 1080, height 1920, fps 30 and export.scale 2**, matching captions. Default final output is **2160×3840 portrait 4K**; a 1920×1080 landscape composition at scale 2 exports at 3840×2160. The design space remains 1080×1920 when adapting to another canvas; fit uniformly, never stretch. Export scale remains explicitly configurable and frozen in the project. Report composition and actual exported dimensions separately; explicit output-size requests must resolve scale without accidentally doubling an already-4K target. A landscape adaptation must still satisfy readable text and exclusion-zone constraints; it is not a separate launch style.

The placement manifest should list each file, scene ID, source interval, local duration, placement frame/time, exact fps, dimensions, alpha/background behavior, handles and track order. `EDITOR.md` should explain importing clips above the actual footage, matching sequence settings, alpha interpretation, and editing/recompiling/rerendering. These are rendered video assets plus editable Remotion source, not native Premiere MOGRT templates.

A successful final render completes normal delivery. No automatic preview, frame extraction, frame-by-frame graphic review, placement screenshots, alpha/composite checks, silence checks or post-render visual diagnostics follow it. Export bookkeeping and manifest generation are ordinary file operations, not a media-verification pass. Do not turn developer acceptance fixtures into mandatory checks for every user's generated video.

## 8. Proposed directory and reuse map

```text
video/motion-graphics/
  SKILL.md
  agents/openai.yaml
  config/defaults.json
  references/
    configuration.md
    input-and-timing.md
    scene-planning.md
    project-and-export.md
  scripts/
    motion-graphics.mjs
    core.mjs
    gallery.mjs
  styles/
    catalog.json
    editorial-collage/    # the only initial style: STYLE.md, preview, required assets
  assets/
    gallery/index.html
    motion-code/           # compiler, registry, scene components, export helpers
  tests/
    fixtures/
    ...focused workflow and scene tests
```

Clone useful workflow helpers into this skill and adapt them locally. Do not import `../captions` at runtime or refactor the existing captions skill as a prerequisite. Some duplication is acceptable to preserve independent installation. Consider shared tooling only later if there is a packaging solution that keeps both skills self-contained.

Do not copy caption-specific line breaking, active-word state, per-style phrase logic, Difference delivery, or `@remotion/captions` as a rendering dependency unless an actual feature requires it. No audio analysis or forced alignment in this style: use supplied word timestamps for synchronization, or authored durations for an explicitly standalone request. Preserve an untimed plan and request timing when synchronized export lacks it.

As with captions, dependencies, lockfiles and generated renders belong in generated projects. The skill ships rendering source and assets, not an installed Remotion project.

## 9. Implementation phases and acceptance

### Phase 1 — Single-style contract and first complete component

Inspect the actual repository/runtime before choosing paths/APIs. Author `editorial-collage/STYLE.md` with these sections. Implement intake, configuration, single-style color selection, two-stage `graphicsPlan` compilation, resumable preparation/attachment and a cutout reveal. Support immutable word anchors, untimed planning, standalone timing and exact fractional fps. Introduce the registry, asset/mask provenance, schema/code fingerprints, override precedence and editable-source contract immediately.

Acceptance: a generic text-free cutout animates in/out on transparent canvas without requiring evidence, a source label or a card. Its override example validates against the schema. Missing timestamps block only synchronized export while retaining the untimed plan. Test word occurrence indices, timing, invalid overrides, stale plans and missing assets without screenshot rendering.

### Phase 2 — Layered parallax, material and safe geometry

Implement two/three-plane `layered-parallax`, `paper-clipping`, `object-callout` and simple diagrams within the same style. Support prepared assets/masks, planned background coverage, coherent scene-local camera movement, optional texture, measured labels, protected regions and explicit full-screen mode. Establish an honest asset-preparation path and fallback when clean layers are missing. No additional styles or full 3D modeling pipeline.

Acceptance: the primary layered-image fixture visibly expresses depth rather than a flat zoom. Saved transforms preserve coverage, safe regions and intended layer alignment. Long labels reflow; impossible/fast beats simplify. State tests cover entrance/viewing/exit and shuffled-frame determinism. Unsupported glyphs follow the saved policy. Full-screen mode is explicit. Supporting documentary/chart/map components can be added later using the same style; do not list them as installed until implemented.

### Phase 3 — Export workflow and representative preview

Complete individual silent ProRes 4444 alpha clips, placement manifest, synchronized export on request, retry bookkeeping and editor instructions. Build the 20–30 second synthetic preview with 3–5 sparse treatments: cutout, layered parallax, paper/photo material and optional callout/diagram. Use only a preview-local portrait placeholder. Keep supplied exclusion data separate from style defaults. The preview must show the core animation language rather than only cards and charts.

Acceptance: arithmetic/state tests establish equivalent placement across export modes, complete exits and empty gaps. Review the representative preview in bounded playback for depth, coherent movement, subject clarity and phone-size legibility; no frame-by-frame review or PNG-seek comparison. Perform one representative development editor import smoke check if available and name untested editors honestly. Alpha excludes preview backgrounds. Reopen, revise, recompile and rerender without changing frozen defaults or overwriting user source edits. These development checks never become automatic per-delivery diagnostics.

### Phase 4 — Packaging and regression checks

Complete skill metadata and references, validate the skill, add its root README entry and consolidate the focused regression tests introduced with each feature. Include configuration precedence, collisions/resume, gallery Save continuation, stale-plan rejection, deterministic seeking, unsupported scene/style combinations, missing assets, frame boundaries and export-mode behavior. This phase does not defer core correctness checks until the end.

Development checks are bounded fixture-based tests and representative smoke checks, never exhaustive graphic verification frame by frame. Reuse their results unless a relevant implementation change warrants repeating them. Normal delivery follows captions' direct-final-render policy: no automatic previews or post-render diagnostics. Re-run the existing captions tests if shared source files are changed; the proposed implementation should leave those files untouched.

Map retained captions behavior to fixtures: configuration freeze, gallery Save continuation, independent installation and transparent export. Separately cover sparse word-anchored graphics, untimed planning, per-scene placement, relative layer motion, coverage bounds, optional material, full-screen selection, protected regions and revision recovery. Do not demand caption-specific feature parity. Verify independent installation without the captions directory.

## 10. Decisions carried into implementation

| Decision | Starting point | Why it matters |
| --- | --- | --- |
| Default output | Individual clips; sequence export available. | Easier to reposition and adjust in an editor. |
| Transparency and codec | Silent ProRes 4444 MOV, yuva444p10le, PNG frames, straight alpha. Opaque backgrounds require an explicit request. | Graphics overlay the actual video in the editor. |
| Default canvas/scale | Honor editor settings and saved defaults; shipped defaults: 1080×1920 composition, 30 fps, export.scale 2 → 2160×3840 portrait 4K. Fixed design space with uniform fit. | Matches the captions 4K export default while keeping layout coordinates unchanged. |
| Spatial coverage | Cutouts/layered groups on alpha; optional card/window; full-screen insert only when explicitly selected. | No mandatory evidence-card wrapper or background. |
| Atomic export unit | One scene/idea per clip; internal reveals follow word anchors and scene-owned transitions. | Preserves continuity and independent editor placement. |
| Initial style | Exactly one: Editorial collage — Vox-inspired (`editorial-collage`). | Complete one authored preset rather than launching three unrelated styles. |
| Vox-inspired scope | Cutout reveals, 2.5D parallax, controlled local camera moves, tactile paper/photo treatment and crisp graphic accents. | Animation and composition define the style; documentary subject matter does not. |
| Evidence requirements | Only where factual claims, actual documents or attribution require them. Generic illustration/animation needs no documentary proof. | Preserve factual honesty without making an evidence-generation product. |
| Transcript coverage | Select useful moments, leave gaps. | Avoids turning the skill into another caption renderer. |
| Audio/footage | No audio analysis, forced alignment or base-footage manipulation. | Work on graphic assets and still-image layers; supplied timing anchors synchronized output. |
| Review before rendering | Optional storyboard/preview when requested. | Preserves the established workflow without adding an obligatory approval round. |
| Verification after rendering | None by default; no frame-by-frame graphic verification. Successful final render completes export. | Avoids unnecessary runtime and token cost. |
| Face avoidance | Supplied regions/tracks only; otherwise authored safe zones with no face-awareness claim. | Semantic transcript understanding is not visual tracking. |

This revised plan is the deliverable for the current request. Updating it does not create or implement `video/motion-graphics`.
