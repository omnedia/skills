# Editorial collage — Vox-inspired

## Stable ID and scope

`editorial-collage` is the only installed style. It brings a selected image, object or concept to life through cutout reveals, layered 2.5D depth, restrained camera movement and optional tactile paper. Sparse full-canvas transparent overlays are the default. Generic imagery needs no evidence card, document, citation or text. Full-screen inserts are explicit choices. This is neither a caption renderer nor a general 3D/character-animation system.

## Appearance and reference evidence

The implementation brief records two user-supplied technique breakdowns: Chris Moran's [How VOX gets that analog paper feel](https://www.instagram.com/reel/DYXFBeuqNPZ/) and a local video titled “How Vox brings their historical images to life”. The first identification comes from the user, not verified official Vox attribution. The second has no assumed creator attribution. Their prior sparse reference observations are recorded in the repository implementation plan; no new continuous or frame-by-frame analysis is claimed here.

The first reference showed overlapping slightly tilted documents, warm paper fibers over dark photographs as well as borders, restrained backing and shadows, and internal layer translucency. It did not establish exact font identities, easing, color values or mandatory 95% export alpha. The second showed a cable car separated from foreground rocks and distant mountains, cleaned backing behind the removed subject, separated depth planes and a controlled camera push. Historical subject matter and tutorial captions/UI are not requirements. The style joins these two treatments through purposeful movement and clear composition.

Choose a focal silhouette, preserve natural source color when meaningful, and create depth through overlap and relative travel. The palette is authored calibration: surface #F1EDE4, ink #202124, highlight #F6CE46, accent #D94A45. It is not sampled reference color. Do not put every image inside a paper rectangle. Overlay pixels outside the selected group remain transparent. A full-screen background requires an explicit saved mode and color; a photographic background must be an explicit layer in a full-screen composition or bounded window.

## Fonts and assets

Inter Bold 4.1 is deliberately selected for crisp explanatory accents; it is not claimed to match a reference font. The exact WOFF2, SIL OFL license, source URL, SHA-256 and cmap coverage ship in `fonts/`. Unsupported glyphs fail compilation with a request for a licensed covering font and updated manifest; system fallback is not silent. Labels and optional source labels stay at or above 36 design pixels.

The fixtures contain original MIT-licensed vector illustrations: mountain, cable car, foreground ridge and bulb cutout. They are illustrative, not photographic/documentary evidence. Their asset manifest records hashes and provenance. Production can use prepared local photographic/illustrated images and masks. Layer extraction, inpainting and automatic segmentation are not implemented here: use supplied prepared assets, an actually available authorized workflow, or an honest simpler reveal. Preserve originals and avoid inventing meaningful documentary detail.

## Automatic editorial plan

The agent reads the entire transcript or standalone brief and selects useful moments by meaning. There is no keyword-to-icon mapping or requirement to animate every sentence. Save each scene's subject, purpose, placement, exact source ranges/onsets or authored standalone timing, and complete entrance/viewing/exit. Generic conceptual imagery is first class. Factual claims and actual documents require appropriate fidelity/provenance; ambiguous specifics are resolved or omitted with reasons.

## Roles, components and templates

- `cutout-reveal`: one text-free subject or icon can translate/mask into view, settle and exit. No mandatory card, source or paper.
- `layered-parallax`: two or three prepared planes with distinct depths, coherent camera direction and clean coverage. The primary mountain fixture has far/subject/near travel of 12/30/60 design px.
- `paper-clipping`: one supplied photo, illustration or document on an optional backing, with a restrained tilt/shadow and fixed clipped material. Labels remain above the texture.
- `object-callout`: one subject and one or two concise labels/connectors, optionally attached to its layer transforms. Explicit events can anchor reveals.
- `text-diagram`: two or three concise concept/process nodes with simple connectors. It is not an evidence fallback.

A scene is one independently placeable idea. Internal events belong to it. No cross-scene transitions or neighboring-scene dependencies. Diagrams/charts/timelines/maps beyond the installed registry are unsupported; specialist extensions are deferred. Use one focal group and at most two subordinate accents, typically 1–4 words each.

## Layering and geometry

1080×1920 design pixels, origin top-left; 64px outer safe margins; 40px optional card padding. Other editor canvases uniformly fit and center this space. Export scale is separate. Layer order is far → subject → near → accents → fixed labels/source. Pivots, rectangles, crops, masks, depths, camera endpoints and protected bounds are explicit. A near plane responds more strongly to the same scene-local camera; a whole-image zoom is not parallax.

The compiler reserves the full endpoint-union motion bounds, entrance/exit translation, paper tilt and shadow. Linear camera progress makes endpoint coverage sufficient for this supported path. Prepared backing must cover the window throughout travel; important subjects stay inside it. Exclusion regions/tracks supplied by the user are transformed from canvas coordinates. There is no automatic face tracking or manipulation of underlying footage. No fit means reposition, simplify or omit.

Text is measured after loading the exact local font. Wrap before shrinking and never below 36px. Geometry is frozen before any element appears; word reveals do not reflow the scene. Labels remain fixed relative to the graphic window while attached connector endpoints track their image layer. Texture does not cover labels. Paper opacity blends over its own backing; whole-overlay opacity is used only for entrance/exit.

## Timing and motion

Grammar: establish → reveal depth/detail → view → exit. Defaults: 250ms cubic-out translation entrance, one restrained linear camera path, 250ms exit. Target 1.5–3 seconds for simple cutouts and 3–5 for layered scenes. Paper, callouts and diagrams require at least 1400ms of completed reading after their latest reveal. Text-free viewing can retain gentle motion. These are authored calibration defaults, not reference measurements.

Actual word anchors take priority over nominal staggers/delays. Events preserve their source occurrence and fit inside the viewing interval. Short/fast beats simplify or are omitted without retiming speech. Exact rational fps conversion, transparent handles and editor origin arithmetic are specified in the timing reference. No per-frame randomness, arbitrary wobble, elastic charts, sustained defocus, elaborate page bends or base-video camera movement.

## Overrides and precedence

See [scene-planning](../../references/scene-planning.md). Style defaults → project overrides → scene overrides → component overrides; authored overrides are separate from compiled decisions. Expose asset/layers, camera/cameraTravel/depthStrength, surface, crop, annotations, sourceLabel, highlight, mode and paperTreatment. Unsupported overrides fail rather than silently selecting another treatment. The [mountain fixture](../../tests/fixtures/mountain-plan.json) changes real camera travel through its real scene/component IDs and recompiles coverage.

Paper treatment supports frozen seed or local texture asset, strength, internal opacity, tint, edge shadow, document tilt and backing sheet. Use a coherent low-contrast material across the illustration/evidence composite, preserving detail. Disable texture/tint for meaning-sensitive source colors or fine print. No fabricated annotations or documentary marks.

## Preview, export and validation

The shipped demonstration uses the real renderer and a synthetic 25-second transcript with four selected scenes, ending at 22 seconds. It includes cutout, three-plane mountain, paper illustration and object callout with clean gaps. Its neutral portrait placeholder is preview-only. The gallery accurately labels default-palette recorded playback and immediate static swatches separately.

Default export is individual silent ProRes 4444 alpha MOV clips at full editor canvas; synchronized sequence is opt-in. PNG intermediate frames, yuva444p10le, straight alpha. The preview background never enters either production mode. Compiled data is checked for stale input/code/font/assets before Studio or export. Tests assert geometry, timing, relative depth, shuffled-frame determinism, recovery and output bookkeeping.

Normal delivery stops after successful final rendering: no automatic preview, frame extraction, frame-by-frame review or post-render alpha/composite/silence diagnostics. Bounded development playback and editor import availability are recorded honestly in `tests/ACCEPTANCE.md`.
