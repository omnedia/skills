# Generate separate scene images

Every insert needs its own newly generated image set: at least three separate images for background, subject/midground and foreground. They depict the setting and its contents, with compatible perspective, lighting and scale. This applies equally to number-led inserts, comparisons and paper-note treatments. See the style's [required image layers](../styles/editorial-collage/STYLE.md#required-image-layers).

## Generate for the composition

Before generation, decide what the viewer sees behind the subject, what supports it, and what passes in front. Write a separate image prompt for each spatial group. Use the available image-generation skill/tool workflow; this skill does not bundle a generator, segmentation service or inpainting model.

- **Background:** generate a contextual setting with sufficient overscan for the complete camera move, without an unwanted duplicate of the moving subject.
- **Subject/midground:** generate the focal subject and supporting structure as compatible imagery. Request intact contact details and transparency where appropriate. Keep connected objects in a shared transform group.
- **Foreground:** generate a distinct near object, architectural edge, terrain or other relevant element whose silhouette overlaps the midground and makes differential travel visible.

For example, a factory scene can use a generated workshop interior, a separately generated machine on its base, and generated near racks or yarn spools. A number note sits within that environment. A machine picture plus a procedural grid and a text rectangle is not an acceptable substitute.

Generate each scene image independently for its role. Do not generate one finished collage and reuse it as several moving crops, duplicate it at different scales, or rasterize SVG scenery to satisfy the image count. Texture, paper rectangles, text and masks do not count as scene images. They may be additional assets. Never reuse another insert's background, hero or foreground, even after recoloring or recropping.

Keep exact text and numbers in Remotion, outside the generated images. Match the transcript's wording and meaning without adding speaker attributions, verification labels or disclaimers. Researching the truth or sourcing proof of transcript statements is not part of this workflow.

Inspect generated assets for framing, actual transparency, compatible contact points, clean cut edges and sufficient backing. Regenerate or prepare unsuitable assets before animation. An opaque rectangular image is not a cutout just because the prompt requested transparency. Do not accept a flattened print as a replacement for subject/foreground separation.

SVG/CSS may supply information notes, arrows, underlines, highlights and simple explanatory marks over the generated environment. They may not replace its background, architecture, landscape, physical subjects or foreground. A flat color can underlay the imagery, but it does not count as the background scene layer.

If generation is unavailable, preserve prompts and run state and report that blocker. Do not silently fall back to SVG-built scenes. Supplied images may guide generation or appear as additional assets; they do not waive the generated environment unless the user explicitly changes that requirement.

## Parallel generation and verification

The main agent owns scene selection, shared art direction and composition planning. Once briefs are ready, use a small pool of sub-agents to generate and verify independent assets concurrently, within the available agent and image-service limits. Prefer one scene's complete image set per worker for consistency; for a single scene, separate layer workers can share the same composition brief. Generate dependent images after their required reference is available. Reuse workers for queued scenes; do not assume spawning more workers bypasses service limits.

Give each worker a bounded hand-off:

- Scene ID, visual argument, shared style references and palette, and the relevant style/asset instructions.
- Asset IDs and individual prompts; each layer's spatial role, perspective, lighting, scale, support/contact points, intended overlap, framing, dimensions, transparency and overscan for the planned camera move.
- Required reference files, a dedicated output directory outside the skill, and a separate result report path. Workers own only their assigned assets and report; the main agent alone edits `run.json`, `scene-plan.json`, `editorial-plan.md` and shared animation code.
- The available image-generation workflow, acceptance criteria below, and a bounded retry allowance (default: one initial attempt and up to two corrective attempts per asset).

Workers must inspect the actual saved images, not just generation responses. Check brief compliance, framing, visual defects, clean cut edges, dimensions, actual alpha where required, sufficient backing/overscan and plausible contact details. For complete scene sets, also compare perspective, lighting and scale across layers. Correct or regenerate failures within the allowance; report a blocker when the allowance is exhausted or a required tool is unavailable. Verification here concerns assets, not the truth of transcript statements.

Return each asset's ID, absolute local path, dimensions, observed transparency, generation/preparation metadata and inspection findings, with a clear `ready` or `blocked` result and unresolved issues. Distinguish originals from prepared files. Keep these work statuses and reports in the project-side ledger or worker reports, not new renderer schema fields. Never report an uninspected asset as ready.

While workers run, the main agent continues independent timing/coverage work, label copy, transition planning and reusable animation helpers. Keep image-dependent geometry provisional. Integrate ready results without waiting for unrelated workers, and queue remaining work as slots become free. On resume, reconcile existing reports and files before dispatching duplicate generation. If the service serializes requests, reduce concurrency and continue useful preparation; if sub-agents are unavailable, generate and verify sequentially.

Worker acceptance permits integration; the main agent still checks the assembled scene's perspective, support/contact, scale, occlusion and visible parallax across the complete motion in Studio. Send specific asset defects back for correction and retain successful assets from that insert. Complete asset-dependent validation, preparation and compilation only once the required files are accepted; placeholders do not satisfy the generated-image requirement.

## Save assets for editing

Save every used image locally. Use the existing asset fields: stable `id`, local `path`, supported `kind`, `provenance` and `license`. Generated scene images use `kind: illustration`. Record the generation prompt, tool/model when known, date, reference inputs and preparation in `provenance`. These fields describe files and how they were made, not whether the transcript is verified. Retain applicable image-provider terms and bundled font licenses as project metadata; do not invent license statuses.

Record image IDs, spatial roles and individual generation prompts in `editorial-plan.md` or a linked asset ledger. Keep originals and prepared cutouts distinguishable. Do not invent renderer schema fields for this record. Correcting an asset within its own insert is allowed; freshness applies between different inserts.

Asset inspection happens before finalizing image-dependent placement and animation. Independent planning and reusable implementation can proceed during generation. Default scene review happens in Remotion Studio; it does not require rendering video files.
