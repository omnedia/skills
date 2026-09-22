# Practical motion direction

These are starting recipes for this style, not official Vox production specifications. Choose the recipe that explains the passage and adjust its timing to the actual word anchors. Keep asset preparation, spatial composition and motion direction connected.

## Footage → insert → footage

Save the entry, reveal, hold and exit in `selectionReason`, with actual transition durations in supported `motion` fields. Start the visibility transition at the selected word onset. Animate the entire insert's alpha; its background must participate. Let the backdrop establish first and supporting layers settle a few frames later. Fade/slide the insert away after a complete reading hold while the footage beneath continues normally.

For the bundled renderer, `motion: {transition: "fade-slide", entranceMs: 350, exitMs: 300}` is a useful explicit choice. Its backdrop fades while the content has a modest vertical settle; this is not a full-canvas directional wipe. A lateral slide, paper mask, independent entry/exit directions or a pure fade requires authored project code and consistent bounds/timing compilation. Keep the production root transparent. In a preview, mount the checkerboard beneath the whole timeline and composite inserts over it; do not choose between placeholder and opaque scene with a conditional cut.

At the first entry frame, composite visibility is zero; it rises smoothly to the fully visible scene. Before the end-exclusive boundary, return to zero so removing the insert cannot flash. Test explicit cuts separately; their opacity remains one through the last visible frame. Do not quantize these visibility envelopes to the decorative cadence.

## A spatial collage that reads as depth

Before animating, prepare a background plate, a subject/midground cutout and a foreground cutout. Establish a coherent perspective and light direction. Extend or reconstruct the backing where removed subjects would otherwise leave holes. Keep matte edges clean; inspect for halos, duplicate subjects and cutout seams. Add texture to each material, not a static noise layer covering unrelated planes.

Compose the subject large, let a foreground edge overlap it, and retain enough context to explain the place or relationship. As an initial 2.5D setup, use relative depths around 0.15 / 0.5 / 1.0. A camera translation of roughly 3–6% of scene width produces substantially different travel across those depths. Adjust to asset overscan and content; the goal is visible changing overlap without a floating-paper look. Extend the camera trajectory through the whole visible insert, including the reading phase and exit. Decelerate emphasis into a slower moving phase instead of reaching a clamped endpoint early. Size the overscan for the complete travel. One directed move with changing pace is preferable to repeated zooming or unrelated loops.

The bundled depth-relative transforms can produce this 2.5D effect. For a tilted map or an actual perspective camera, author a shared 3D/perspective scene in Remotion. Parent geographic marks, routes and labels to the same map transform. Use verified map geometry when describing a real location; a conceptual illustration can explain an unnamed river crossing but is not a geographic map.

For the bicycle transcript, combine a subdued city/river background with a bridge and a cyclist placed using one of the grounded arrangements below. For the 20→10 minute claim, place the comparison over a moving view of that environment, or use another relevant layered composition. Introduce each paper number with a visible material reveal on its word anchor, retain its unit, and let it inherit restrained plane motion while the environment keeps its depth. For the connection passage, use the continuing camera move and a drawn line attached to the bridge to expose the relationship. These may be separate inserts, but neither becomes a static slide. Source or generate suitable prepared imagery before authoring; a ground shape can support a prepared subject but does not replace the contextual imagery.

## Logical placement and contact

Choose the subject's relationship to the environment before setting layer depth: on a surface, behind an obstruction, attached to another object, or deliberately separate as an editorial graphic. For physical subjects, identify the supporting surface and actual contact points in the visible artwork. Transparent image padding makes the image rectangle an unreliable foot or tire baseline. Match the subject's scale, viewing angle and horizon to its support; a shadow can reinforce contact but cannot repair a gap.

Keep contact under motion. In authored Remotion code, place a subject's contact anchor on a path in its support's local coordinates, then apply the shared camera transform to both. Add the subject's own travel within that coordinate system. Connected pieces must not acquire unrelated translations, zooms or pivots from independent depth values. Sharing a depth number alone is insufficient if their scaling pivots differ. Use differential motion between spatial groups, and preserve the relationship during entrances and exits too: reveal a supported group together or let the subject enter along its surface.

For a bicycle, choose an arrangement that the available assets can support:

- **On the bridge:** scale the rider to the deck and railing. Keep both tire contact points on the deck profile, with orientation following its slope. Prepare separate far structure/deck and near railing planes where needed: the rider sits between them, and the near railing occludes the appropriate parts. Putting the rider behind an opaque flattened bridge may hide it entirely. Use a restrained, compatible deck path if the cutout cannot follow a strong curve without a tire lifting or sinking.
- **On a foreground path:** retain a larger rider and add a visible road, bank or simple white paper ground plane in front of the bridge. Place both tires on its upper surface and move the rider within that plane's coordinates. The bridge stays a separate, more distant layer. Extend the ground across the complete visible travel; a short rectangle that slides away beneath the wheels does not establish support.

If assets cannot express the chosen relationship, prepare the needed mask/surface, simplify the move or recompose. Do not conceal a placement failure with stronger shadows, faster motion or an arbitrary foreground crop. Before rendering, reason through the contact and occlusion geometry across the complete path, including camera extremes and reveals. The bundled bounds checks do not understand physical contact; shared transforms, surface-following paths and split occluders may require an authored renderer extension. Record the intended relationship in `selectionReason`, not invented executable JSON fields.

## Element choreography and reading motion

Give every arriving element a visible entrance and every departing element an animated exit, individually or through its parent material/scene. Start later entrances at their exact narration anchors. Try roughly 250–450 ms for a note's fade/slide, an unfolding reveal or a short stroke, then tune to the actual motion and available time. A four-frame fade at 30 fps is only about 133 ms and can read as a pop; existence of interpolation is not evidence of a perceptible entrance. Do not stretch word timing to fit: simplify the content or omit a beat if its entrance, reading and exit cannot fit.

Stage related layers with purpose: establish context, reveal the focal material, then complete its annotation. Avoid identical simultaneous fades, stationary title rows above a boxed comparison, decorative drop shadows and generic bullet-slide layouts. Paper texture, overlap and movement should make the note belong to the environment. Unfolding or crumpling is optional; if selected, implement the changing material/mask rather than naming a scale tween after it.

During a reading hold, preserve content, contrast and stable letterforms while restrained parallax continues. Text and completed strokes can ride their material plane without independently wobbling. Keep the primary camera at full frame rate and visibly moving until the insert disappears. Do not add random animation to every letter just to avoid stillness. Unselected footage/placeholder intervals are outside this continuous-motion requirement.

## Posterized decorative motion

Author eased transforms at the actual composition frame rate first. Keep the primary parallax camera at that rate. For selected secondary material movements only, evaluate elapsed decorative time as `floor(elapsedSeconds * 18) / 18`; keep semantic visibility checks on the original frame. Anchor elapsed time to the relevant event and clamp that subordinate gesture to its interval, while the parent plane or surrounding scene continues moving. Do not quantize every plane together and freeze the whole image between poses. Keep footage and entry/exit alpha smooth. The number 18 is an optional texture of motion, not a required global cadence.

Do not apply line-boil settings to approximate posterized camera motion. The bundled renderer currently needs a project extension for broad transform sampling. A 15 fps GIF cannot faithfully demonstrate an 18-pose treatment: use the source-rate MP4 as the motion reference and derive any GIF at the source rate, allowing for GIF's centisecond timing precision.

## Typography and annotations

Use a coherent sans-serif hierarchy, measured with the actual loaded font. Prefer fixed-width numeral regions, stable units, common baselines and consistent margins. Animate a highlight behind a phrase, a short clipped reveal or a controlled scale change; avoid simultaneous bouncing labels. Keep all qualifiers visible with the claim. Balto is a possible reference when an appropriately licensed file is available; the bundled Inter is a fallback, not a claim of a matching typeface.

For general annotation, start around 4–7 px stroke width at a 1080 px short edge and scale with the canvas. Use about 250–450 ms for a short draw-on, then retain the completed shape on its moving target plane. Tune to path length and speech rather than stretching every line to the same duration. An arrow shaft and head should read as one continuous animated gesture, without a suddenly appearing head. Keep map routes distinct from broad highlight bands. A line should guide the eye without obscuring labels or becoming the dominant object.

## Reference grounding

- [Adobe: time effects](https://helpx.adobe.com/after-effects/desktop/apply-effects-and-animation-presets/list-of-effects/time-effects.html) describes Posterize Time as locking a layer to a specified rate; it does not establish an 18 fps Vox standard.
- [Type Supply: Balto](https://typesupply.com/fonts/balto) is the primary font source. Choose a suitable license before bundling a font; naming it in CSS does not provide the asset.

The recipes above are project art direction informed by the requested look. Do not present search-result summaries as verified universal rules for Vox, and do not require Photoshop or GeoLayers when Remotion can implement the necessary compositing or camera behavior.
