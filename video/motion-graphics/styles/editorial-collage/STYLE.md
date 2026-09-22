# Editorial collage — Vox-inspired

## Editorial intent

Read the entire transcript, select passages where a visual explains something, and leave the rest of the video alone. **Sparse in time, expansive in the frame.** A selected passage is usually a full-size editorial insert: photographs, cutout subjects, context, foreground occlusion and drawn emphasis form one scene. The style is not a small icon appearing whenever a noun is spoken. Do not turn the transcript into a continuous illustrated slideshow either.

Use Remotion only. Build every selected insert around a layered parallax environment. Choose photographic subjects, large typography or diagrams as its focal explanation; paper notes and number treatments can sit within or over that environment. Use tactile reveals and camera impulses for emphasis, with quieter continuing motion while evidence is read. Vary visual forms while keeping materials, palette and annotation language coherent across the selected inserts.

The defining treatment is a composed editorial environment with visible depth, clean typography and continuous controlled movement. Prepare meaningful foreground, subject/midground and background planes with differential motion and changing overlaps. This also applies when a number or phrase is the hero: a flat typographic slide is not a separate treatment within this style. Read [motion direction](motion-direction.md) for practical transition, depth and annotation recipes before implementation.

## Visual vocabulary and motion character

Use a documentary explainer vocabulary: archival photographs or illustrations treated as hand-cut paper, bold flat fields (coral, navy or cream are useful options) against grayscale subjects, large kinetic headings, layered depth, and maps with drawn routes, arrows and callouts. Choose the devices that clarify the selected passage; this is not a checklist to apply to every insert. A flat color field can be a substrate beneath the spatial layers; it does not replace the parallax environment.

Choose a coherent motion character from the brief and save it in the scene's `selectionReason`:

- **Handmade / crisp (preferred):** keep the primary parallax camera moving at the actual composition frame rate, with motion blur off. Optionally sample a few decorative material transforms at about 18 poses per second for tactile character while the surrounding scene continues moving smoothly. Entrances, exits and semantic event onsets remain at the actual composition frame rate. Line boil is off by default.
- **Cinematic paper:** staggered layers, smoother camera impulses and brief movement-dependent blur. Use when the brief calls for a more dramatic treatment.

The 18-pose starting point is this style's art direction, not a verified universal Vox specification or the export frame rate. In authored Remotion code, quantize only the chosen decorative transform's elapsed time from its event; visibility and claim reveals use exact compiled event frames. Uneven pose holds at 30 fps are expected. Do not round the entire timeline or word timestamps onto a decorative grid. Broad stepped motion needs a renderer extension; existing `boilFps` only changes stroke contours.

Layered PNG planes can create a 2.5D parallax impression, with near elements moving more than distant ones. The bundled depth-relative transforms simulate this; a true perspective camera moving through 3D planes requires authored Remotion code. For maps, use verified geography/data, attach routes and location marks to the map transform, and time a zoom or line reveal to the relevant explanation. Generated decorative maps must not substitute for geographic evidence.

## Select the visual argument before the assets

For each candidate passage, finish: “Seeing ___ helps the viewer understand ___.” Choose a reveal, relationship, change, comparison, place, scale or consequential detail. A literal icon that repeats a noun rarely earns a scene. Save why you selected the passage and why neighboring passages remain unillustrated. There is no fixed interval, number of scenes or coverage percentage.

Examples (illustrative briefs, not facts to add to a transcript):

- “The cable car crossed above the valley”: a large cutout cabin against distant mountains, rocks crossing the foreground, one controlled move exposing depth. Not a cable-car badge over the speaker.
- “The policy changed who could enter”: a relevant building or supplied document fills the composition; reveal the operative passage and draw attention to it on the corresponding words. Do not decorate it with an unrelated courthouse icon.
- “This sounds simple, but it isn't”: usually keep the speaker. No generic lightbulb.
- “The route became shorter”: use a faithful supplied map and a traced route if the source supports it; do not invent geographic evidence. Extend the generated Remotion project when the supplied renderer cannot express the needed visual.

## Compose an editorial environment

Start from an interesting full-size still composition. The focal subject is large enough to read instantly at delivery size, often crossing the center or bleeding off an edge. Layer order generally reads as substrate → subdued context → hero image/cutout → foreground overlap → selective annotation → typography. This is a hierarchy, not a mandatory six-layer checklist. Use only layers with a purpose.

Choose backgrounds from the topic: enlarged/desaturated scans, architecture, maps, image fragments, restrained paper, photographic environments or deliberate flat color fields. Separate background values from the subject. Charcoal with faint contextual imagery, warm off-white, coral and navy are useful choices; beige paper is not mandatory. Use contextual layers when they add meaning. Avoid stock dashboard cards, rounded tiles, sticker outlines, default shadows, random tape and fake newspaper decoration.

Make placement explain a coherent spatial relationship. A person stands on a surface, wheels meet a road or deck, and an attached object stays attached as the camera moves. Match scale and perspective to that relationship, and let foreground structures occlude subjects where appropriate. A large hero is useful only when its position makes sense; use a closer supporting plane if enlarging it would make it float over distant scenery. A simple white paper ground shape is valid when it visibly supports the subject and moves with it. Typography and clearly separate editorial cutouts may float as graphic elements; a subject depicted riding, standing or resting in the environment needs physical grounding. See [logical placement and contact](motion-direction.md#logical-placement-and-contact) for implementation choices.

Use photographic or carefully art-directed illustrated subjects. Icons and simple vectors can serve a genuine diagram, but the original mountain/bulb SVGs are geometry regression fixtures, **not a visual style reference**. If prepared photographic assets are missing, source or prepare them through an available workflow, change the concept honestly, or report the missing asset. Do not quietly substitute emoji, clip art or crude vector stand-ins and call it Vox-like.

Actively obtain missing assets: use available image-generation/editing tools for original illustrations, textures and cutouts, or search the web for reusable photographs, scans and maps. Follow [asset generation and sourcing](../../references/asset-sourcing.md) for licenses, provenance and preparation. The user need not supply every image. Generated archival-looking material remains an illustration, never documentary evidence.

Typography explains relationships or singles out a detail; it does not transcribe every spoken word. A short large heading, label or genuine excerpt is enough. The bundled Inter Bold is a practical licensed default, not an identified Vox font. Keep small labels at least 36 design pixels. Palette tokens (#F1EDE4, #202124, #F6CE46, #D94A45) are starting choices, not an official Vox palette. Let source photographs retain meaningful color; one editorial accent usually suffices.

A number or consequential phrase can be the hero over a continuously moving parallax environment. Compose it at editorial scale, with paper notes or drawn marks integrated into the scene's depth and motion. A dimmed photograph behind stationary numbers, decorative grain, or a tilted rectangle with a shadow is insufficient. Pair narrow, high-contrast serif display type with small sans-serif labels when typographic contrast helps establish hierarchy. Use a licensed local display font when that treatment is selected, and extend font loading and measurement in the generated project accordingly. Inter Bold alone does not reproduce that typography; never merely name an unavailable font. Keep qualifiers such as “many,” “nearly,” dates and units readable beside the claim for its entire visible duration. Do not reveal an unqualified claim first and add its limitation later.

Recompose to the actual aspect ratio. A closing word can occupy most of the usable width; enlarge or reposition the hero before adding decoration to empty space. Preserve intentional breathing room and caption exclusions. A drawn starburst or underline can reinforce closing emphasis; avoid filling every corner with decoration. For portrait reels, build a readable vertical hierarchy rather than shrinking a landscape arrangement.

## Direct a short insert as a complete beat

Plan the surrounding unaltered footage along with the insert: exact entry anchor → establish the idea → reveal or emphasize the relationship → readable hold → return to the base shot. A second impulse needs a second meaningful narration event. Avoid selecting a whole sentence just because one word deserves emphasis; also avoid ending before the graphic's claim can be read. Save the editorial rationale and beat progression in `selectionReason`, using existing word-anchored `events` for supported reveals.

Keep ordinary setup, connective speech and personal delivery on the base shot unless a graphic adds explanation. Keep transitions and effects within the selected interval. Deliver silent inserts and placement instructions; do not assemble or retime the base video as part of this workflow.

Design both boundaries explicitly. Prefer a short eased slide with fade, a clean fade, or a motivated paper/matte reveal into the insert, followed by a designed exit revealing the continuing footage. Start around 300–450 ms for entry and 250–400 ms for exit, adjusting to the passage; these are authoring ranges, not automatic timestamp changes. The bundled `fade-slide` is the default baseline for full-screen inserts as well as overlays. Hard cuts require an intentional editorial reason, such as an internal match cut. They are not the default return to footage.

Animate the entire insert's visibility, including its opaque backdrop. Sliding text after instantly replacing the footage with a solid background still creates a hard cut. In previews, keep the footage placeholder mounted beneath the insert through both transitions. In production, preserve transparent transition frames for compositing over the editor's footage. Finish the reading hold before exit begins; reserve entrance, hold and exit within the planned interval instead of stealing the hold for a dissolve.

### Reading time and minimum duration

Measure the reading hold from the **completion of the last meaningful reveal to the start of the exit**, not from the scene's entrance or the onset of its last word. Include any trailing label, unit, connector endpoint or annotation needed to understand the finished composition. Entrance, reveal and exit time do not count as a fully revealed hold. Continue gentle parallax during the hold while keeping the content legible.

Use these art-direction defaults, not universal reading-speed claims:

| Content | Minimum fully revealed hold to budget | Typical total duration |
| --- | --- | --- |
| One simple word or number | 1.5–2 seconds | 3–4 seconds |
| Layered scene with a headline and relationship | 2.5–3 seconds | 4–6 seconds |
| Several labels or a detailed comparison | 3–4 seconds | 5–7 seconds |

Choose within or above these ranges for the actual content and playback size. Total duration must accommodate all transcript-anchored reveals plus the completed reading hold and exit; a late reveal can require a longer scene than the typical range. A technical compiler minimum is only a guardrail, not evidence of comfortable pacing.

Do not end an insert merely because a sentence ends or the next sentence begins. A relevant graphic may remain over subsequent narration while its explanation is still useful; preserve word timestamps and record that extended placement in the scene plan. If the available interval cannot support a readable hold, simplify or omit the insert rather than compressing it. For the bicycle example, a connection reveal finishing around 10.7–10.8 seconds should remain fully readable until roughly 13.3–13.7 seconds, then transition back to footage around 13.6–14 seconds.

Choose one dominant motion gesture and a few subordinate responses. For an emphasis beat, a close-to-wide camera reveal can establish the paper scene; stagger the subject and supporting paper, decelerate into gentle continuing parallax, then add an impulse on a meaningful spoken anchor. Motion must continue for the entire visible insert, through entrance, reading and exit; do not complete the camera move early and freeze the composition. A reading hold preserves the claim and its legibility, not a still frame. Keep evidence stable relative to its material while its plane or surrounding environment continues to move. Avoid perpetual bounce, random jitter and repeated zooms as substitutes for directed motion.

Every element needs a perceptible animated entrance and a designed disappearance: fade/slide, draw-on, mask reveal, unfolding or crumpled-paper opening, as appropriate to its material. Elements present at the start can participate in the scene's animated reveal; later additions need their own animation starting on the exact word event. Never switch a new note, number, heading or arrowhead directly from absent to fully visible. A nominal animation lasting only a few frames can still read as a hard pop; give it enough travel and duration to perceive at playback size. During the reading phase, elements can inherit the scene or material's gentle motion instead of animating independently. A motivated cut between complete shots is not permission to pop individual elements into a shot.

Paper should behave like material: rigid pieces placed with slight rotation, carefully prepared cut edges, overlap, and restrained contact shadows. Printed grain, fibers, halftone and scratches belong to chosen surfaces and move with them. Use only enough texture to establish material; several equally strong noise layers flatten the hierarchy. A drawn underline or circle completes a thought after its target appears. A simple fade/slide is a valid footage transition; if a torn-paper reveal is selected, implement its actual matte rather than describing a generic fade as a tear. Avoid arbitrary zigzag edges and full-frame procedural scratches as substitutes for prepared materials.

For fast camera moves in the cinematic treatment, use brief movement-dependent blur and, when appropriate, subtle chromatic edge separation. Both settle to a crisp reading state. Keep motion blur off in the handmade/crisp treatment. Keep critical text, qualifiers and document evidence clean; persistent RGB splits, blurred holds and whole-frame jitter weaken clarity. Yellow on charcoal is the preferred emphasis pairing for the cinematic treatment, while light-paper scenes provide contrast when useful. Preserve explicit user palette choices.

Author these effects from frame time in Remotion, not autonomous CSS animations or wall-clock timers. Temporal camera samples must evaluate the same deterministic scene at nearby times, stay within the insert's boundaries and avoid sampling future semantic reveals before their anchors. A CSS blur filter is a stylized smear, not a claim of temporal motion blur. Grain and displacement use fixed seeds; rendering order must not change them.

## Four motion treatments

### Photographic depth

Separate near, subject and far planes using actual prepared masks and backing. Near elements move more than distant elements under a coherent camera move; purposeful overlap reveals the separation. Keep the move modest enough to preserve photographic credibility. A scale-up of one flattened image is a push-in, not parallax. Removing a subject requires a clean backing or a new explicit collage environment: never animate a duplicate still behind its cutout and expose the old subject.

For every insert, record each plane's asset/mask, depth, framing, overlap and movement in the scene plan. Use at least three meaningful spatial planes for the foreground/midground/background treatment; texture and text alone do not count as spatial separation. Count coherent spatial groups: a subject and its supporting surface can share a camera transform while other groups provide parallax. Do not assign different depths to connected pieces merely to increase relative motion. Compose a foreground edge crossing the subject or context so differential travel is perceptible at playback size. Continue changing those overlaps after the entrance and through the reading phase until exit. Do not mistake staggered slide-ins followed by a flat hold for parallax.

Use the full frame or a deliberately large editorial crop. Edge bleed is useful for landscape and foreground; protect faces and important evidence from unintended cropping. Prefer subtle independent planes to spinning cutouts and constant bounce. Background texture can remain still while the camera and subject move.

### Contextual collage

Assemble a world around the selected idea: an oversized subject, one or two relevant secondary fragments, perhaps a foreground occluder. Bring a new element in when the narration establishes its relationship, then let the composition read. Do not reveal every layer with the same simultaneous pop-up animation. Texture belongs to the material; it should not obscure evidence or wash over all text.

### Crafted lines

Use precise Bezier curves, rounded caps/joins and a consistent stroke scale. Prefer one clean underline, bracket, route or arrow that targets a real detail. Draw it on from its exact narration event, then retain its shape while it follows the moving target or material plane. Begin with no contour variants, displacement or line boil. A hand-drawn treatment may introduce tiny intentional asymmetry when the reference benefits from it, but the silhouette must remain clean. Keep arrowheads proportionate and animate their reveal as the shaft reaches its endpoint. Avoid multi-subpath dash animations that reveal disconnected arrowhead pieces early. Keep underlines clear of glyphs and units; route thickness must not conceal the map or subject it explains.

### Motion across a cut

A cut can feel smooth when an outgoing move accelerates into the edit and the incoming move continues in a compatible direction before decelerating. Preserve a perceptual anchor (location, scale, edge or dominant direction). This differs from fading every graphic in and out or stopping both shots before cutting. Use it when two adjacent ideas genuinely connect, not at every scene boundary.

The renderer offers `camera.from`, `camera.easing` and `motion.transition: cut` for authored independent shots. Pair outgoing `in` and incoming `out` easing with compatible travel, timing and framing. Record the intended handoff in selection reasons. It does not automatically match objects, velocities or neighboring shots. More elaborate shared-camera or masked transitions belong in an authored Remotion composition; render the connected beat as a unit if it depends on continuity.

## Runtime and asset contract

Use [scene planning](../../references/scene-planning.md). `editorial-scene` supports 2–12 image planes, timed layer reveals, authored title positions and drawn paths. `layered-parallax` supports up to 12 planes. Legacy compact components remain available for purposeful overlays, not as the first-choice style vocabulary. Do not force every concept into the old five-template set.

The supplied camera interpolates between two endpoints; a multi-phase camera sequence requires authored project code. Torn/retracting masks, per-piece animated rotation, temporal blur, chromatic separation and mixed display/body fonts also require authored project code. Existing title events appear instantly and therefore do not satisfy this style's entrance rule without an authored reveal. Layer reveals use fade/translation. Extend the generated Remotion project and its compiler/render path where needed for perceptible entrances and continuing motion; do not use runtime limitations to justify a flat or frozen insert. Do not invent JSON effect switches or bypass timing/geometry checks.

Full-screen is the default selected-scene mode; save it explicitly with placement and background. Overlay is an editorial choice when the base shot remains useful or the user requests transparency. Both export on the whole editor canvas. Sparse timing and transparent gaps remain independent of scene size. Preserve explicit overlay choices in existing plans.

The shipped coordinate system is portrait 1080×1920, uniformly fitted on other canvases. For another aspect ratio, recompose the generated Remotion scene to its native canvas; merely enlarging the background leaves a portrait arrangement in a landscape frame. Do not claim the supplied compiler automatically redesigns layouts for every aspect ratio.

Frame-driven animation must be deterministic on direct/shuffled seeks. Source word occurrences and timing stay fixed. Choose readable beats based on the content and the reading-time guidance above, not a rigid sentence boundary. The bundled 1400ms technical minimum does not replace the longer style-level reading holds; budget and verify the hold after the last meaningful reveal in authored scenes. Use eased footage boundaries; reserve cuts for motivated editorial choices.

Preserve source originals, asset identity, licenses and preparation provenance. Documentary content stays faithful; illustrative reconstruction is labeled as such. Segmentation, inpainting, exact font matching and automatic base-footage tracking are not supplied capabilities.

## Style acceptance

For style development or an explicitly requested preview, inspect representative stills and motion: does the selected scene fill its intended frame, is the hero dominant, do overlaps and relative motion produce depth, are contextual layers subdued, does a drawn line target a real detail, and is there time to read? Assess the composition and explanatory value, not merely the presence of effects. A large generic icon or a zoomed flat poster fails this style check.

Also assess spatial logic through the full move: what supports each physical subject, do its contact points remain on that support, does its scale fit, and do railings or other occluders pass in front of the correct parts? Reject hovering, sinking, slipping attachments and paths that leave the supporting surface. A cyclist drifting in front of a bridge with no ground fails even when the cutout and parallax are attractive. During normal delivery, resolve these relationships in planning and authored transforms; this does not add a post-render inspection loop.

For the dynamic paper treatment, also assess each element's entrance, the moving reading hold, any secondary impulse and the return to footage. Does motion change what the viewer understands? Is the claim fully qualified throughout? Does the graphic end once its job is done? Number-led inserts must meet the same layered-parallax requirement. A paper-note layout that reads as a presentation slide fails even if its text technically fades in.

A representative preview must demonstrate layered parallax throughout every selected insert, plus animated element reveals and entry/exit over the footage placeholder. Evaluate full-speed motion through the middle and final reading phase as well as the boundaries, not just finished stills. Reject opaque pops, entrances so fast they read as cuts, abrupt disappearance, flat card layouts, camera motion that finishes before the insert does, imperceptible depth, crude cutouts and distracting stroke wobble. Technical compilation and regression tests establish correctness, not visual quality. A bicycle preview should place the number comparison and connection passage over a moving environment with the cyclist grounded on the bridge or a distinct foreground path. Existing preview assets are not proof of correct placement; apply the spatial criteria above. Keep editable development projects outside the installed skill.

Normal delivery retains the skill's direct-render policy. Development checks do not impose an automatic frame-inspection loop on every job.
