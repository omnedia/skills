# Scene planning and renderer schema

Read the whole transcript and the [style brief](../styles/editorial-collage/STYLE.md) before selecting scenes. Write a visual explanation for each chosen passage. Leave passages without a useful visual argument alone; optionally record them as `graphicsPlan.omissions:[{sourceRanges,reason}]`. No fixed cadence or coverage quota. Design a large scene with a focal subject and subordinate context, not a noun-to-icon pop-up.

In `selectionReason`, record the entry idea, element entrances, visual progression, moving reading hold and reason to return to footage. Plan layered parallax for every insert, including typographic claims, and continue its motion until the insert disappears. Use exact word events for meaningful changes within the insert; retain qualifiers and units whenever their claim is visible. Give each addition a perceptible reveal rather than an instantaneous visibility change. Do not stretch selections to accommodate effects or impose a fixed scene count. Coordinate with supplied caption exclusions; if footage/layout is unavailable, do not claim the placement was checked against it.

For the dynamic paper treatment, follow the [style brief](../styles/editorial-collage/STYLE.md). Save the intended motion in the rationale, but distinguish intent from executable schema: multi-stage camera impulses, blur, chromatic separation, torn reveals and additional fonts need project implementation. No such JSON switches are installed. Extend the compiler/renderer consistently when authoring them; preserve source timing, bounds and deterministic rendering.

For subjects interacting with the environment, also record in `selectionReason` the supporting surface, visible contact anchors, scale/perspective relationship, front/behind ordering and how contact survives the complete camera and subject motion. Follow [logical placement](../styles/editorial-collage/motion-direction.md#logical-placement-and-contact). Identify any required split occluder or shared transform before selecting assets. These are authoring decisions: the current schema and compiler do not solve contact, perspective or path following. Implement needed relationships in the generated project rather than adding unsupported plan fields or treating a successful bounds check as proof of plausible placement.

The authoritative plan has `schemaVersion:1`, `style:"editorial-collage"`, `mode:"transcript"|"standalone"`, `assets`, `graphicsPlan:{scenes:[...]}` and optional `authoredOverrides`. The [editorial fixture](../tests/fixtures/editorial-plan.json) and [its source](../tests/fixtures/editorial-source.json) demonstrate the current visual direction. The older mountain, diagram and preview fixtures are regression inputs for compact overlays, not style targets.

## Scenes and geometry

Save `id`, installed `component`, `selectionReason`, source/timing fields, `order`, `placement:{x,y,width,height}`, `sceneMode`, `background`, ordered `layers`, and `camera`. Optional fields: `surface`, `depthStrength`, `motion`, `paperTreatment`, `content`, `sourceLabel`, `annotations`, `titles`, `strokes`, `events`.

`editorial-scene` supports 2–12 planes with titles, strokes and reveals. `layered-parallax` supports 2–12 planes with distinct depths and actual relative movement. `paper-clipping`, `cutout-reveal`, `object-callout`, and `text-diagram` retain their legacy narrow roles. The registry is a starting implementation, not a prohibition on authoring more capable Remotion scenes. If extending it, update renderer, schema, compilation and meaningful tests together; do not emit unsupported plan fields and pretend they work.

The default is `full-screen` with `fade-slide`, with a surface-colored backdrop if no background is saved. The backdrop fades along with the content; it must not replace the footage abruptly. Author an explicit background for intentional dark/light art direction. A portrait full-frame placement is `{x:0,y:0,width:1080,height:1920}`. Choose `overlay` explicitly when the footage should remain visible throughout. Save an explicit `cut` only for a motivated editorial boundary. Export canvas size does not determine the visible graphic size.

Coordinates remain 1080×1920 design pixels. Other canvases uniformly fit this space; they are not automatically recomposed. Background fills the editor canvas. For landscape-native art direction, adapt the generated Remotion layout/compiler rather than stretching a portrait composition. Overlay safe margin is 64px; material padding is usually 40px. Full-frame images may bleed, but headings and important evidence need deliberate safe placement. Exclusions are respected in both modes.

## Images, cutouts and backgrounds

Follow [asset generation and sourcing](asset-sourcing.md) when imagery is missing. Available image tools can create illustrations, textures or prepared cuts; web search can supply reusable documentary assets. Verify the individual asset's usage terms and preserve required credits before including it in a render or editable project.

Assets: stable `id`, local `path` relative to the plan, `kind` (illustration/supplied/documentary/mask/texture), `provenance`, `license`. Preserve source identity and record preparation for derived cuts. Self-contained passive SVG is supported alongside PNG/JPEG/WebP. Do not invent document text or pass off an illustration as evidence.

Layers are back-to-front: `{id,asset,mask?,depth,rect,pivot:[x,y],crop?,opacity?,grayscale?,reveal?,coverage?}`. Depth is 0–4; crop x/y are object-position percentages. Opacity and grayscale are 0–1. A background can combine several subdued contextual images over the backdrop. Masks use alpha and stretch to the layer rectangle; preserve matching image/mask aspect ratios and object-fit geometry.

`coverage:"window"` requires `preparedBacking` describing actual preparation and overscan that covers the window at every rendered frame. This checks rectangular coverage, not opaque pixel coverage or successful inpainting. `coverage:"bleed"` is for intentionally clipped full-screen imagery/foreground; require a `bleedReason`. It never promises a clean backing. All other layer motion must remain inside the scene rectangle. Do not use bleed to conceal a missing subject, bad mask or edge hole.

A layer reveal is `{eventId,x:0,y:80}`: offsets in design pixels settle with cubic-out while opacity reveals. The event supplies the exact onset and duration. Do not add a reveal to a required opaque background; cover the scene independently throughout the reveal. Default layers are fully present on the cut.

## Camera, timing and continuity

`camera:{x,y,zoom,from?:{x,y,zoom},easing?:"linear"|"in"|"out"|"in-out"}` gives start/end displacement, multiplied by each layer's depth and `depthStrength` (0–2). Zoom endpoints are bounded to ±.15 before depth. Linear is useful for observational parallax; cubic in/out can support directional cut handoffs. Near planes respond more than far ones. Bounds sample every rendered frame to include combined camera and timed-reveal travel.

`motion:{entranceMs:250,exitMs:250,transition:"cut"|"fade-slide"}`. Fade-slide is the default for full-screen scenes and overlays: an eased visibility envelope fades the backdrop and settles the content vertically, then reveals the footage on exit. Author longer durations when appropriate, keeping the complete reading hold before exit. Cuts explicitly keep the scene opaque and the group stationary while layer camera motion continues to the boundary. The compiler still reserves entrance/exit reading time. No automatic cross-scene motion matching is implemented. Full directional slides, masked transitions and broad posterized transforms need authored renderer/compiler extensions; do not invent unsupported JSON fields.

`events:[{id,anchorWord,durationMs}]` use actual word occurrences for transcript plans; standalone events use `timeMs`. Layer reveal, title, stroke and annotation event IDs must resolve. Scene onsets remain tied to their exact anchor word; do not distribute or change speech timing. See [timing](input-and-timing.md).

## Typography and crafted lines

`titles:[{text,x,y,width,height,fontSize,color?,eventId?}]` adds deliberately positioned headings/labels. The compiler measures the bundled font, wraps before shrinking, rejects overlap/overflow and never drops below 36px. Height reserves the allowed text region. Titles appear at their event; they do not animate every spoken word. Legacy `content.label`, `sourceLabel` and callout labels remain available.

`strokes:[{path,width,color?,eventId?,variants?,boilFps?,layerId?}]` draws a local SVG path via normalized path length. Paths use M/L/C/Q/S/T/Z commands with scene-local coordinates. Curves form arrows, underlines, brackets or imperfect circles; author arrowheads in the path when useful. Optional `variants` replaces `path` with a small list of near-identical contours, selected at `boilFps` (0–12). Keep variation slight (roughly 1–3px at design scale is a starting point), fixed in space and deterministic. Without an event the line is present immediately; use a positive-duration event for draw-on.

A stroke with `layerId` follows that image's camera/reveal transforms. Its path coordinates describe the image's untransformed position in scene space. With no layer it stays fixed. Paths are clipped to the scene; authored contours need visual judgment because the compiler does not infer their semantic target or exact path/text collision. Legacy `annotations` still produce straight labeled connectors; they are not the crafted-line style by themselves.

Paper material applies to `paper-clipping`; use prepared texture planes in `editorial-scene`. Options remain `textureSeed`/`textureAsset`, `textureStrength` (0–.3), `internalPaperOpacity` (.85–1), tint, shadow, tilt and backing. Disable texture for fine evidence or color-sensitive content.

## Overrides

Style defaults → authored scene → project overrides → scene overrides → component overrides. Objects merge, arrays replace. Supported override keys are enforced by the validator, including background, layers, titles and strokes. Overrides never bypass source ranges, exact timing, protected regions or asset existence. Keep authored choices separate from immutable compiled geometry.
