# Editorial collage — Vox-inspired

## Editorial intent

Read the entire transcript and select useful visual explanations covering **approximately 50% of the video's duration, or more when editorially useful**. Leave unselected passages untouched. A selected passage is usually a full-size editorial insert: photographs, cutout subjects, context, foreground occlusion and drawn emphasis form one scene. The style is not a small icon appearing whenever a noun is spoken. Coverage comes from enough distinct explanatory beats throughout the source, not a few prolonged scenes or a continuous templated slideshow.

Use Remotion only. Every selected insert must be a Vox-like collage environment built from multiple separately generated images. Image-based scenery and subjects create the scene; typography, notes and diagrams support its explanation within that environment. Use tactile reveals and camera impulses for emphasis, with quieter continuing parallax while information is read.

The defining treatment is visible spatial depth: a generated background, generated subject/midground and generated foreground with differential motion and changing overlap. This also applies when a number or phrase is the hero. A flat typographic slide, vector-built setting or one image behind moving notes fails this style. Read [motion direction](motion-direction.md) before implementation.

## Required image layers

Before designing, inspect [preview.gif](preview.gif) at its animated scene moments. Use its photographic detail, distant setting, subject/structure and near foreground as the visual benchmark. Apply its spatial principles without reusing its artwork or finished composition.

For **each animation**, generate at least three separate images and prepare them as independently movable spatial groups:

1. **Background environment:** a relevant setting with depth cues and overscan.
2. **Subject/midground:** a large focal subject or structure, with plausible support and scale.
3. **Foreground:** relevant near imagery that overlaps other groups and changes that overlap as the camera moves.

All three must be scene-building imagery. Flat color, grain, grids, text, notes, arrows and masks do not count. One generated poster split into crops, duplicated images or rasterized vector scenery also fails. Generate a new image set for every insert; a new heading or camera direction does not make an old scene new.

SVG/CSS is only for supporting notes, labels, underlines, arrows, highlights and simple explanatory marks. Never build the scenery, background or physical subjects out of those shapes, and never make them the majority of the visual treatment. A large number can dominate the explanation while a substantial generated environment remains visible and moving around it. Generate the environment first, then integrate the information.

Specify foreground crossings, support/contact, perspective, scale and camera travel before animation. Depth values in JSON and technically nonzero movement do not establish visible parallax. If suitable generated images cannot be obtained, preserve the plan and report the generation blocker instead of substituting vector scenery.

## Transcript content

Animate the supplied content. Do not turn production into fact-checking, evidence gathering or source verification. Never add “laut Sprecher,” “according to the speaker,” “unverified,” “reported individual example,” source captions or similar qualifications just because the information came from the transcript. Preserve its numbers, units and qualifiers such as “approximately” when actually spoken. Do not add qualifying language or omit a useful passage merely because its statements were not independently verified.

## Visual vocabulary and motion character

Use an editorial explainer vocabulary: detailed photographic or illustrated image cutouts, coherent environments, tactile paper, bold type and selective drawn emphasis. Generate the scene imagery; grayscale subjects and coral, navy or cream accents are useful options. A flat color may underlay the image layers, but it never substitutes for the generated background environment.

Choose a coherent motion character from the brief and save it in the scene's `selectionReason`:

- **Handmade / crisp (preferred):** keep the primary parallax camera moving at the actual composition frame rate, with motion blur off. Optionally sample a few decorative material transforms at about 18 poses per second for tactile character while the surrounding scene continues moving smoothly. Entrances, exits and semantic event onsets remain at the actual composition frame rate. Line boil is off by default.
- **Cinematic paper:** staggered layers, smoother camera impulses and brief movement-dependent blur. Use when the brief calls for a more dramatic treatment.

The 18-pose starting point is this style's art direction, not a universal Vox specification or the export frame rate. In authored Remotion code, quantize only the chosen decorative transform's elapsed time from its event; visibility and claim reveals use exact compiled event frames. Uneven pose holds at 30 fps are expected. Do not round the entire timeline or word timestamps onto a decorative grid. Broad stepped motion needs a renderer extension; existing `boilFps` only changes stroke contours.

Layered PNG planes create 2.5D parallax when near objects travel differently from far scenery and overlaps change throughout the shot. The bundled transforms can support this; a perspective camera or multi-phase move requires authored Remotion code. Attach any route, mark or label to the image it annotates. Choose imagery that fits the transcript; no source-verification step is required.

## Select the visual argument before the assets

For each candidate passage, finish: “Seeing ___ helps the viewer understand ___.” Choose a reveal, relationship, change, comparison, place, scale or consequential detail. A literal icon that repeats a noun rarely earns a scene. Save why you selected the passage and why neighboring passages remain unillustrated. Derive the scene count from useful beats and readable durations needed for approximately 50% coverage; there is no fixed interval or maximum number of scenes.

## Coverage and distinctness

Plan animated coverage by duration, not by number of sentences or clips. Aim for approximately half the complete source runtime and go higher when more ideas deserve explanation. Spread selections according to the source's arguments, including later sections. Do not stop after the first few obvious graphics. If a first pass is materially below half, revisit the whole transcript for processes, accumulating consequences, contrasts, scale, mechanisms and changes that visuals can clarify. Do not pad holds, loop animations or add decorative filler to reach the target. Preserve a readable beat's legitimate duration and add more distinct beats instead. If the source or an explicit user constraint prevents useful coverage near half, document the specific limitation and achieved coverage rather than silently delivering a sparse result.

For every animation, generate a new scene image set and a new motion approach. Do not reuse backgrounds, hero images, foregrounds, masks or completed artwork from another insert or earlier project. Renaming, recoloring, recropping or lightly editing old art does not make it new. A user-required recurring logo or supplied asset may recur as an additional element; generate a fresh surrounding environment and treatment each time.

Design every insert to look and feel different from every other insert, while retaining the shared editorial style. Give each a passage-specific visual metaphor, spatial arrangement and dominant motion progression. A new text string, color, hero image or reversed camera move on the same layout is insufficient. Shared fonts, palette, stroke conventions and low-level code helpers are allowed; a reusable finished scene or animation sheet with swapped content is not. Generate and prepare new art for each concept, and extend the authored Remotion implementation when the bundled layout would make scenes look alike.

For example, rent burden could become a room whose usable space contracts; accumulating costs could build a deep stack of newly designed receipts; two business paths could unfold into diverging environments; digital delivery could follow a package through a newly constructed distribution scene. These are possibilities, not a repeating sequence of templates. Each must still meet this style's layered depth, continuous motion and reading requirements.

Before production, compare all planned inserts together: if their artwork, composition or motion progression reads as the same animation with different labels, redesign the duplicate. Save the coverage calculation, per-scene assets and distinct approaches following [scene planning](../../references/scene-planning.md). This is an editorial planning check, not an automatic post-render preview loop.

Examples (illustrative briefs, not facts to add to a transcript):

- “The cable car crossed above the valley”: a large cutout cabin against distant mountains, rocks crossing the foreground, one controlled move exposing depth. Not a cable-car badge over the speaker.
- “The policy changed who could enter”: generate a building backdrop, a separate entrance/gate and a near barrier; reveal their relationship on the corresponding words. Supporting text sits within the moving scene.
- “This sounds simple, but it isn't”: usually keep the speaker. No generic lightbulb.
- “The route became shorter”: generate distant surroundings, a separate bridge/path and a near bank or railing; animate the connection and add a supporting route or time comparison.

## Compose an editorial environment

Start from an interesting full-size composition of the generated scene images. The focal subject reads immediately, often crossing the center or bleeding off an edge. Build background → subject/midground → foreground overlap, then add annotations and typography. Generated imagery provides the setting and visual richness even without information graphics.

Generate backgrounds from the topic: workshop interiors, architecture, streets, terrain, rooms, shelves or other relevant environments. Separate background values from the subject and prepare enough backing for camera travel. Charcoal, warm off-white, coral and navy can be underlying color fields or accents. A procedural grid, geometric field, blank paper or vector room is not a scene background. Avoid dashboard cards, rounded tiles, sticker outlines, random tape and fake newspaper decoration.

Make placement explain a coherent spatial relationship. A person stands on a surface, wheels meet a road or deck, and an attached object stays attached as the camera moves. Match scale and perspective to that relationship, and let foreground structures occlude subjects where appropriate. A large hero is useful only when its position makes sense; use a closer supporting plane if enlarging it would make it float over distant scenery. Generate a compatible supporting surface with the subject or as a separate image; an SVG ground strip must not replace the physical setting. Typography and clearly separate editorial cutouts may float as graphic elements; a subject depicted riding, standing or resting in the environment needs physical grounding. See [logical placement and contact](motion-direction.md#logical-placement-and-contact) for implementation choices.

Use detailed photographic or carefully art-directed illustrated imagery for every spatial group. Simple vectors may annotate a relationship inside the generated environment; they cannot be the environment. Legacy mountain/bulb SVGs are geometry fixtures, not visual examples. Generate or prepare replacements for unsuitable imagery instead of substituting icons, clip art or vector stand-ins.

Actively generate every insert's missing scene images. Follow [asset generation](../../references/asset-sourcing.md) for separate prompts, compatible layers, cutouts, backing and local files. The user need not supply images. This is visual asset creation, not a search for proof of the transcript.

Typography explains relationships or singles out a detail; it does not transcribe every spoken word. A short large heading, label or genuine excerpt is enough. The bundled Inter Bold is a practical licensed default, not an identified Vox font. Keep small labels at least 36 design pixels. Palette tokens (#F1EDE4, #202124, #F6CE46, #D94A45) are starting choices, not an official Vox palette. Let source photographs retain meaningful color; one editorial accent usually suffices.

A number or consequential phrase can be the hero within the generated parallax environment. Integrate notes and drawn marks into its depth and motion while keeping substantial contextual imagery visible. A dimmed photograph behind stationary numbers, decorative grain or a tilted rectangle with a shadow is insufficient. Use actual loaded fonts and measure complete labels. Keep numbers, dates, units and qualifiers already present in the transcript readable together; do not invent additional qualifications or verification captions.

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

Choose one dominant motion gesture and a few subordinate responses. For an emphasis beat, a close-to-wide camera reveal can establish the paper scene; stagger the subject and supporting paper, decelerate into gentle continuing parallax, then add an impulse on a meaningful spoken anchor. Motion must continue for the entire visible insert, through entrance, reading and exit; do not complete the camera move early and freeze the composition. A reading hold preserves the claim and its legibility, not a still frame. Keep text stable relative to its material while its plane or surrounding environment continues to move. Avoid perpetual bounce, random jitter and repeated zooms as substitutes for directed motion.

Every element needs a perceptible animated entrance and a designed disappearance: fade/slide, draw-on, mask reveal, unfolding or crumpled-paper opening, as appropriate to its material. Elements present at the start can participate in the scene's animated reveal; later additions need their own animation starting on the exact word event. Never switch a new note, number, heading or arrowhead directly from absent to fully visible. A nominal animation lasting only a few frames can still read as a hard pop; give it enough travel and duration to perceive at playback size. During the reading phase, elements can inherit the scene or material's gentle motion instead of animating independently. A motivated cut between complete shots is not permission to pop individual elements into a shot.

Paper should behave like material: rigid pieces placed with slight rotation, carefully prepared cut edges, overlap, and restrained contact shadows. Printed grain, fibers, halftone and scratches belong to chosen surfaces and move with them. Use only enough texture to establish material; several equally strong noise layers flatten the hierarchy. A drawn underline or circle completes a thought after its target appears. A simple fade/slide is a valid footage transition; if a torn-paper reveal is selected, implement its actual matte rather than describing a generic fade as a tear. Avoid arbitrary zigzag edges and full-frame procedural scratches as substitutes for prepared materials.

For fast camera moves in the cinematic treatment, use brief movement-dependent blur and, when appropriate, subtle chromatic edge separation. Both settle to a crisp reading state. Keep motion blur off in the handmade/crisp treatment. Keep critical text and units clean; persistent RGB splits, blurred holds and whole-frame jitter weaken clarity. Yellow on charcoal is the preferred emphasis pairing for the cinematic treatment, while light-paper scenes provide contrast when useful. Preserve explicit user palette choices.

Author these effects from frame time in Remotion, not autonomous CSS animations or wall-clock timers. Temporal camera samples must evaluate the same deterministic scene at nearby times, stay within the insert's boundaries and avoid sampling future semantic reveals before their anchors. A CSS blur filter is a stylized smear, not a claim of temporal motion blur. Grain and displacement use fixed seeds; rendering order must not change them.

## Four motion treatments

### Photographic depth

Generate separate near, subject and far images with compatible perspective and lighting, then prepare cutouts/masks and backing. Near elements move more than distant ones under a coherent camera move, with overlap exposing that separation. Scaling one flattened image is a push-in, not parallax. Never duplicate a flattened subject image behind its moving cutout.

For every insert, record each plane's asset/mask, depth, framing, overlap and movement in the scene plan. Use at least three independently generated spatial image groups for foreground/midground/background; textures, notes, vectors and text do not count toward them. Count coherent spatial groups: a subject and its supporting surface can share a camera transform while other groups provide parallax. Do not assign different depths to connected pieces merely to increase relative motion. Compose a foreground edge crossing the subject or context so differential travel is perceptible at playback size. Continue changing those overlaps after the entrance and through the reading phase until exit. Do not mistake staggered slide-ins followed by a flat hold for parallax.

Use the full frame or a deliberately large editorial crop. Edge bleed is useful for landscape and foreground; protect faces and important details from unintended cropping. Prefer subtle independent planes to spinning cutouts and constant bounce. Background texture can remain still while the camera and subject move.

### Contextual collage

Assemble a world around the selected idea: a generated background environment, an oversized generated subject and a separate generated foreground occluder, with relevant secondary fragments as needed. Bring a new element in when the narration establishes its relationship, then let the composition read. Do not reveal every layer with the same simultaneous pop-up animation. Texture belongs to the material; it should not obscure detail or wash over all text.

### Crafted lines

Use precise Bezier curves, rounded caps/joins and a consistent stroke scale. Prefer one clean underline, bracket, route or arrow that targets a real detail. Draw it on from its exact narration event, then retain its shape while it follows the moving target or material plane. Begin with no contour variants, displacement or line boil. A hand-drawn treatment may introduce tiny intentional asymmetry when the reference benefits from it, but the silhouette must remain clean. Keep arrowheads proportionate and animate their reveal as the shaft reaches its endpoint. Avoid multi-subpath dash animations that reveal disconnected arrowhead pieces early. Keep underlines clear of glyphs and units; route thickness must not conceal the map or subject it explains.

### Motion across a cut

A cut can feel smooth when an outgoing move accelerates into the edit and the incoming move continues in a compatible direction before decelerating. Preserve a perceptual anchor (location, scale, edge or dominant direction). This differs from fading every graphic in and out or stopping both shots before cutting. Use it when two adjacent ideas genuinely connect, not at every scene boundary.

The renderer offers `camera.from`, `camera.easing` and `motion.transition: cut` for authored independent shots. Pair outgoing `in` and incoming `out` easing with compatible travel, timing and framing. Record the intended handoff in selection reasons. It does not automatically match objects, velocities or neighboring shots. More elaborate shared-camera or masked transitions belong in an authored Remotion composition; render the connected beat as a unit if it depends on continuity.

## Runtime and asset contract

Use [scene planning](../../references/scene-planning.md). `editorial-scene` supports 2–12 image planes, timed layer reveals, authored title positions and drawn paths. `layered-parallax` supports up to 12 planes. Legacy compact components remain available for purposeful overlays, not as the first-choice style vocabulary. Do not force every concept into the old five-template set.

The supplied camera interpolates between two endpoints; multi-phase motion requires authored code. Do not reuse one slow linear drift plus fade/slide for every insert. Give each scene a dominant movement that reveals its relationship, then decelerate into continuing readable parallax. Described effects must actually be implemented: never call moving a flattened image a fan, unfold or draw-on. Existing title events appear instantly, so author perceptible title reveals. Extend renderer and compiler where necessary instead of accepting flat or frozen scenes.

Full-screen is the default selected-scene mode; save it explicitly with placement and background. Overlay is an editorial choice when the base shot remains useful or the user requests transparency. Both export on the whole editor canvas. Sparse timing and transparent gaps remain independent of scene size. Preserve explicit overlay choices in existing plans.

The shipped coordinate system is portrait 1080×1920, uniformly fitted on other canvases. For another aspect ratio, recompose the generated Remotion scene to its native canvas; merely enlarging the background leaves a portrait arrangement in a landscape frame. Do not claim the supplied compiler automatically redesigns layouts for every aspect ratio.

Frame-driven animation must be deterministic on direct/shuffled seeks. Source word occurrences and timing stay fixed. Choose readable beats based on the content and the reading-time guidance above, not a rigid sentence boundary. The bundled 1400ms technical minimum does not replace the longer style-level reading holds; budget and verify the hold after the last meaningful reveal in authored scenes. Use eased footage boundaries; reserve cuts for motivated editorial choices.

Preserve generated originals, asset identity, image-provider terms, font licenses and preparation metadata for editing. These are file-management details, not transcript-verification requirements or on-screen labels. Segmentation, inpainting and automatic footage tracking are not supplied capabilities.

## Style acceptance

Before opening Studio, reject plans missing three separately generated scene images per insert, vector-built environments, notes counted as depth, or reused finished scenes. Compare prepared layers and planned movement with the existing GIF. Coverage and technical validation cannot compensate for failing this image-based style contract.

In the default Studio review, inspect representative motion: does the selected scene fill its intended frame, is the hero dominant, do overlaps and relative motion produce depth, are contextual layers subdued, does a drawn line target a real detail, and is there time to read? Assess the composition and explanatory value, not merely the presence of effects. A large generic icon or a zoomed flat poster fails this style check.

Also assess spatial logic through the full move: what supports each physical subject, do its contact points remain on that support, does its scale fit, and do railings or other occluders pass in front of the correct parts? Reject hovering, sinking, slipping attachments and paths that leave the supporting surface. A cyclist drifting in front of a bridge with no ground fails even when the cutout and parallax are attractive. Resolve these relationships in planning, authored transforms and Studio; this does not require rendering or a post-render inspection loop.

For the dynamic paper treatment, also assess each element's entrance, the moving reading hold, any secondary impulse and the return to footage. Does motion change what the viewer understands? Does the wording preserve the transcript without added qualifications? Does the graphic end once its job is done? Number-led inserts must meet the same layered-parallax requirement. A paper-note layout that reads as a presentation slide fails even if its text technically fades in.

The Studio scenes must demonstrate layered parallax throughout every selected insert, plus animated element reveals and entry/exit over the footage placeholder. Evaluate full-speed motion through the middle and final reading phase as well as the boundaries, not just finished stills. Reject opaque pops, entrances so fast they read as cuts, abrupt disappearance, flat card layouts, camera motion that finishes before the insert does, imperceptible depth, crude cutouts and distracting stroke wobble. Technical compilation and regression tests establish correctness, not visual quality. A bicycle preview should place the number comparison and connection passage over a moving environment with the cyclist grounded on the bridge or a distinct foreground path. Existing preview assets are not proof of correct placement; apply the spatial criteria above. Keep editable development projects outside the installed skill.

Default delivery is the compiled editable project open in Remotion Studio. Render video files only after an explicit user request in the initial prompt or a follow-up. Studio review does not require a preview MP4, frame extraction or post-render diagnostics.
