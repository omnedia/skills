# Developer checks

Normal caption delivery creates the Remotion animation and renders the final file.
It does not run video verification, frame screenshots, pixel comparisons, alpha
decoding, composite inspection or audio-silence checks.

For changes to this skill, run the focused code tests from the skill directory:

```text
node --test tests/*.test.mjs
python -m unittest discover -s tests -p "test_*.py"
```

These cover configuration, project attachment, font metadata, timing, layout,
animation state, gallery continuation and alignment logic without rendering videos.
The optional `audio-integration.py` helper exercises real audio alignment separately.
