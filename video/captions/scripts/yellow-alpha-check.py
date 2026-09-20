"""Inspect generated alpha pixels and create a contact sheet (Pillow required)."""
import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw

project = Path(sys.argv[1])
alpha = Image.open(project / 'composite-alpha.png').convert('RGBA')
channel = alpha.getchannel('A')
assert channel.getextrema() == (0, 255), channel.getextrema()
bbox = channel.getbbox()
assert bbox and bbox[0] > 0 and bbox[1] > 0 and bbox[2] < alpha.width and bbox[3] < alpha.height
assert alpha.getpixel((0, 0))[3] == 0
assert any(0 < a < 255 for a in channel.getdata()), 'Missing antialiased alpha / shadow'
sheet = Image.new('RGB', (5 * 216, 3 * 404), '#22242e')
draw = ImageDraw.Draw(sheet)
for i, file in enumerate(sorted(project.glob('treatment-*.png'))):
    im = Image.open(file).convert('RGB').resize((216, 384))
    x, y = (i % 5) * 216, (i // 5) * 404
    sheet.paste(im, (x, y))
    draw.text((x + 5, y + 384), file.stem, fill='white')
sheet.save(project / 'treatments-contact.png')
composites = Image.new('RGB', (3 * 360, 640))
for i, name in enumerate(('black', 'white', 'checkerboard')):
    im = Image.open(project / f'composite-{name}.png').convert('RGB').resize((360, 640))
    composites.paste(im, (i * 360, 0))
composites.save(project / 'alpha-contact.png')
gif = Path(__file__).resolve().parents[1] / 'styles/yellow-authority/preview.gif'
preview = Image.open(gif)
assert preview.size == (540, 350)
assert preview.convert('RGB').getpixel((0, 0)) == (34, 36, 46)
report_file = gif.parent / 'verification.json'
report = json.loads(report_file.read_text(encoding='utf-8'))
report['alpha'] = {'extrema': [0, 255], 'inkBounds': bbox, 'transparentCorner': True,
                   'partialCoverage': True, 'backgrounds': ['black', 'white', 'checkerboard']}
report_file.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'alphaBounds': bbox, 'contact': str(project / 'treatments-contact.png'),
                  'composites': str(project / 'alpha-contact.png'), 'preview': preview.size}))
