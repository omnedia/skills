"""Check every decoded preview frame for safe bounds; save a review contact sheet."""
import subprocess
import sys
from pathlib import Path
from PIL import Image

root = Path(sys.argv[1])
width, height = 270, 480
process = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', str(root / 'editorial.mov'),
    '-vf', f'alphaextract,scale={width}:{height}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], stdout=subprocess.PIPE)
frames = 0
while True:
    chunk = process.stdout.read(width * height)
    if not chunk:
        break
    assert len(chunk) == width * height
    alpha = Image.frombytes('L', (width, height), chunk)
    # Ignore near-transparent codec/shadow noise.
    box = alpha.point(lambda p: 255 if p > 5 else 0).getbbox()
    if box:
        assert box[0] >= width * .08 and box[2] <= width * .92, (frames, box)
        assert box[1] >= height * .08 and box[3] <= height * .92, (frames, box)
    if frames < 9:
        assert box is None, 'Leading silence lost'
    frames += 1
assert process.wait() == 0
assert frames > 0
sheet = Image.new('RGB', (1080, 700), '#22242e')
for i, frame in enumerate([34, 103, 185, 244]):
    source = Image.open(root / f'frame-{frame}.png').convert('RGBA').crop((0, 800, 1080, 1500)).resize((540, 350))
    tile = Image.new('RGBA', source.size, '#22242e')
    tile = Image.alpha_composite(tile, source).convert('RGB')
    sheet.paste(tile, ((i % 2) * 540, (i // 2) * 350))
sheet.save(root / 'review.png')
for file in [*root.glob('fast-*.png'), *root.glob('long-word.png')]:
    image = Image.open(file).convert('RGBA')
    box = image.getchannel('A').point(lambda p: 255 if p > 5 else 0).getbbox()
    if box:
        assert box[0] >= image.width * .08 and box[2] <= image.width * .92, (file.name, box)
        assert box[1] >= image.height * .08 and box[3] <= image.height * .92, (file.name, box)
if (root / 'active-regression.png').exists():
    active = Image.open(root / 'active-regression.png').convert('RGBA')
    assert sum(1 for r,g,b,a in active.getdata() if a > 150 and r > 180 and 130 < g < 240 and b < 120) > 100
print(f'{frames} decoded frames: safe bounds and transparent leading silence passed')
