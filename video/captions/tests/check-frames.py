"""Pixel assertions on real render-check frames; run after scripts/render-check.mjs."""
import sys
from pathlib import Path
from PIL import Image, ImageChops

root = Path(sys.argv[1])
load = lambda name: Image.open(root / name).convert("RGBA")
yellow = lambda image: sum(1 for r, g, b, a in image.getdata() if a > 150 and r > 180 and 130 < g < 240 and b < 120)
assert load("frame-0.png").getchannel("A").getbbox() is None, "Leading silence lost"
assert yellow(load("frame-20.png")) > 100, "Spoken word not highlighted"
assert yellow(load("frame-25.png")) == 0, "Highlight persists in a pause"
assert yellow(load("frame-36.png")) > 100, "Boundary did not switch highlight"
assert yellow(load("frame-78.png")) > 100, "Repeated word not highlighted"
active_alpha = load("frame-20.png").getchannel("A")
pause_alpha = load("frame-25.png").getchannel("A")
assert active_alpha.getbbox() == pause_alpha.getbbox(), "Highlight changed layout bounds"
# Chromium's antialiasing can change edge alpha slightly with text color.
assert ImageChops.difference(active_alpha, pause_alpha).getextrema()[1] <= 24, "Highlight moved glyph geometry"
for width, height in [(1080,1920), (1920,1080)]:
    alpha = load(f"wrap-{width}.png").getchannel("A")
    box = alpha.getbbox()
    assert box and box[0] >= width * 0.075 and box[2] <= width * 0.925, box
    assert box[3] <= height * 0.83 and box[3] - box[1] < 160, box
    # Actual long-text sample should span over half the canvas width.
    assert box[2] - box[0] > width * 0.5, "Wrong props or missing long-caption sample"
print("Real frames: leading silence, highlights, pauses, stable geometry and safe portrait/landscape bounds passed.")
