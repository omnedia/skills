# Scene planning and renderer schema

Read the whole transcript and the [style brief](../styles/editorial-collage/STYLE.md) before selecting scenes. Write a visual explanation for each chosen passage and target approximately 50% of the complete video's duration, with higher coverage when useful. Leave passages without a useful visual argument alone; optionally record them as `graphicsPlan.omissions:[{sourceRanges,reason}]`. Derive clip count from the duration target and meaningful readable beats, not a fixed cadence or a small default count. Design a large scene with a focal subject and subordinate context, not a noun-to-icon pop-up.

## Coverage and variety plan

The main agent establishes the scene concepts and shared visual direction before handing off [asset generation and verification](asset-sourcing.md#parallel-generation-and-verification). Put worker briefs and progress in `editorial-plan.md` or a linked ledger, with stable scene/asset IDs and separate output ownership. Continue independent planning while generation runs; finalize image-dependent geometry only after inspecting returned assets. Only the main agent merges accepted asset records into `scene-plan.json`.

Keep a project-side `editorial-plan.md` alongside `scene-plan.json` with the following planning evidence; do not invent renderer schema fields:

- **Coverage:** record the complete source runtime and its basis, the selected animation seconds, percentage, and clip count. Use supplied video duration when available; otherwise use the complete timed transcript span as a labeled proxy, never the span of just the selected passages. Untimed plans have provisional coverage until actual timing is supplied. Compute animation seconds from the union of selected visible `[startMs,endMs)` intervals within that source span, including designed entry/exit but excluding transparent handles and gaps. Overlapping inserts count once. Recalculate after cuts, omissions or duration changes and report achieved coverage with delivery.
- **Scene concepts:** one row per insert with interval/duration, visual argument, at least three fresh generated scene image IDs, individual prompts, spatial roles, foreground crossings, support/contact, composition and distinct dominant motion. List SVG/CSS notes and marks separately as supporting graphics. Mirror the creative rationale in `selectionReason`; keep generation/preparation metadata in existing asset records.
- **Editorial check:** compare prepared images and planned motion with the style GIF and the full scene set. Reject missing image groups, vector-built environments, one-image collages, notes counted as depth, recropped reused art and text-swapped templates. Confirm that described choreography has a concrete implementation. Revisit the full transcript when coverage is below half; do not relax the image-layer requirement to reach coverage.

For a 209-second source, approximately half is 104.5 seconds of animation. Three inserts totaling 25 seconds cover only about 12% and require further selection under the default brief. Clip count follows the planned beat lengths; do not inflate those three holds to reach the target. Individual MOV delivery and sequence delivery use the same coverage goal.

In `selectionReason`, record the entry idea, element entrances, visual progression, moving reading hold and reason to return to footage. Plan layered parallax for every insert, including typographic claims, and continue its motion until the insert disappears. Use exact word events for meaningful changes within the insert; retain units and qualifiers actually spoken in the transcript, without adding verification language or source labels. Give each addition a perceptible reveal rather than an instantaneous visibility change. Do not stretch selections to accommodate effects or impose a fixed scene count. Coordinate with supplied caption exclusions; if footage/layout is unavailable, do not claim the placement was checked against it.

For the dynamic paper treatment, follow the [style brief](../styles/editorial-collage/STYLE.md). Save the intended motion in the rationale, but distinguish intent from executable schema: multi-stage camera impulses, blur, chromatic separation, torn reveals and additional fonts need project implementation. No such JSON switches are installed. Extend the compiler/renderer consistently when authoring them; preserve source timing, bounds and deterministic rendering.

For subjects interacting with the environment, also record in `selectionReason` the supporting surface, visible contact anchors, scale/perspective relationship, front/behind ordering and how contact survives the complete camera and subject motion. Follow [logical placement](../styles/editorial-collage/motion-direction.md#logical-placement-and-contact). Identify any required split occluder or shared transform before selecting assets. These are authoring decisions: the current schema and compiler do not solve contact, perspective or path following. Implement needed relationships in the generated project rather than adding unsupported plan fields or treating a successful bounds check as proof of plausible placement.

The authoritative plan has `schemaVersion:1`, `style:"editorial-collage"`, `mode:"transcript"|"standalone"`, `assets`, `graphicsPlan:{scenes:[...]}` and optional `authoredOverrides`. The visual reference is the supplied [style GIF](../styles/editorial-collage/preview.gif). Legacy compact/vector fixtures and runtime component availability do not define acceptable scene art.

## Scenes and geometry

Save `id`, installed `component`, `selectionReason`, source/timing fields, `order`, `placement:{x,y,width,height}`, `sceneMode`, `background`, ordered `layers`, and `camera`. Optional fields: `surface`, `depthStrength`, `motion`, `paperTreatment`, `content`, `sourceLabel`, `annotations`, `titles`, `strokes`, `events`.

`editorial-scene` supports 2–12 image planes with titles, strokes and reveals; `layered-parallax` also supports up to 12. These are runtime limits, not style acceptance: every new insert needs at least three separately generated scene images with meaningful depth. Use one of these enclosing scenes. Legacy compact components do not waive that requirement; implement useful note/annotation treatments inside the generated environment. Extend renderer/schema/compiler together when needed rather than inventing unsupported fields.

The default is `full-screen` with `fade-slide`, with a surface-colored backdrop if no background is saved. The backdrop fades along with the content; it must not replace the footage abruptly. Author an explicit background for intentional dark/light art direction. A portrait full-frame placement is `{x:0,y:0,width:1080,height:1920}`. Choose `overlay` explicitly when the footage should remain visible throughout. Save an explicit `cut` only for a motivated editorial boundary. Export canvas size does not determine the visible graphic size.

Coordinates remain 1080×1920 design pixels. Other canvases uniformly fit this space; they are not automatically recomposed. Background fills the editor canvas. For landscape-native art direction, adapt the generated Remotion layout/compiler rather than stretching a portrait composition. Overlay safe margin is 64px; material padding is usually 40px. Full-frame images may bleed, but headings and important details need deliberate safe placement. Exclusions are respected in both modes.

## Images, cutouts and backgrounds

Follow [asset generation](asset-sourcing.md) for every insert before implementation. Generate separate background, subject/midground and foreground images. SVG/CSS is restricted to supporting notes and annotations. Missing generation capability is a blocker, not permission to build vector scenery.

Assets: stable `id`, local `path` relative to the plan, supported `kind` (illustration/supplied/documentary/mask/texture), `provenance`, `license`. These are technical asset records. Generated images use `illustration`; record prompts/preparation in `provenance` and applicable provider terms in `license`. The existing `documentary` enum is compatibility data, not a verification workflow. Passive SVG is supported for supplementary notes and marks only; format support does not make it acceptable scene-building imagery.

Layers are back-to-front: `{id,asset,mask?,depth,rect,pivot:[x,y],crop?,opacity?,grayscale?,reveal?,coverage?}`. Depth is 0–4; crop x/y are object-position percentages. Opacity and grayscale are 0–1. A background can combine several subdued contextual images over the backdrop. Masks use alpha and stretch to the layer rectangle; preserve matching image/mask aspect ratios and object-fit geometry.

`coverage:"window"` requires `preparedBacking` describing actual preparation and overscan that covers the window at every rendered frame. This checks rectangular coverage, not opaque pixel coverage or successful inpainting. `coverage:"bleed"` is for intentionally clipped full-screen imagery/foreground; require a `bleedReason`. It never promises a clean backing. All other layer motion must remain inside the scene rectangle. Do not use bleed to conceal a missing subject, bad mask or edge hole.

A layer reveal is `{eventId,x:0,y:80}`: offsets in design pixels settle with cubic-out while opacity reveals. The event supplies the exact onset and duration. Do not add a reveal to a required opaque background; cover the scene independently throughout the reveal. Default layers are fully present on the cut.

## Camera, timing and continuity

`camera:{x,y,zoom,from?:{x,y,zoom},easing?:"linear"|"in"|"out"|"in-out"}` gives start/end displacement, multiplied by each layer's depth and `depthStrength` (0–2). Zoom endpoints are bounded to ±.15 before depth. Linear is useful for observational parallax; cubic in/out can support directional cut handoffs. Near planes respond more than far ones. Bounds sample every rendered frame to include combined camera and timed-reveal travel.

`motion:{entranceMs:250,exitMs:250,transition:"cut"|"fade-slide"}`. Fade-slide is the default for full-screen scenes and overlays: an eased visibility envelope fades the backdrop and settles the content vertically, then reveals the footage on exit. Author longer durations when appropriate, keeping the complete reading hold before exit. Cuts explicitly keep the scene opaque and the group stationary while layer camera motion continues to the boundary. The compiler still reserves entrance/exit reading time. No automatic cross-scene motion matching is implemented. Full directional slides, masked transitions and broad posterized transforms need authored renderer/compiler extensions; do not invent unsupported JSON fields.

`events:[{id,anchorWord,durationMs}]` use actual word occurrences for transcript plans; standalone events use `timeMs`. Layer reveal, title, stroke and annotation event IDs must resolve. Scene onsets remain tied to their exact anchor word; do not distribute or change speech timing. See [timing](input-and-timing.md).

## Typography and crafted lines

`titles:[{text,x,y,width,height,fontSize,color?,eventId?}]` adds deliberately positioned headings/labels. The compiler measures the bundled font, wraps before shrinking, rejects overlap/overflow and never drops below 36px. Height reserves the allowed text region. Titles appear at their event; they do not animate every spoken word. Legacy `content.label`, `sourceLabel` and callout labels remain available in the runtime. Never auto-populate them with speaker attribution, verification status or disclaimers.

`strokes:[{path,width,color?,eventId?,variants?,boilFps?,layerId?}]` draws a local SVG path via normalized path length. Paths use M/L/C/Q/S/T/Z commands with scene-local coordinates. Curves form arrows, underlines, brackets or imperfect circles; author arrowheads in the path when useful. Optional `variants` replaces `path` with a small list of near-identical contours, selected at `boilFps` (0–12). Keep variation slight (roughly 1–3px at design scale is a starting point), fixed in space and deterministic. Without an event the line is present immediately; use a positive-duration event for draw-on.

A stroke with `layerId` follows that image's camera/reveal transforms. Its path coordinates describe the image's untransformed position in scene space. With no layer it stays fixed. Paths are clipped to the scene; authored contours need visual judgment because the compiler does not infer their semantic target or exact path/text collision. Legacy `annotations` still produce straight labeled connectors; they are not the crafted-line style by themselves.

Paper material applies to `paper-clipping`; use prepared texture planes in `editorial-scene`. Options remain `textureSeed`/`textureAsset`, `textureStrength` (0–.3), `internalPaperOpacity` (.85–1), tint, shadow, tilt and backing. Disable texture where it reduces detail or text legibility.

## Overrides

Style defaults → authored scene → project overrides → scene overrides → component overrides. Objects merge, arrays replace. Supported override keys are enforced by the validator, including background, layers, titles and strokes. Overrides never bypass source ranges, exact timing, protected regions or asset existence. Keep authored choices separate from immutable compiled geometry.
