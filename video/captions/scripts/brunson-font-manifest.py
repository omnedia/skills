"""Inspect original font files; record identity, checksums and exact glyph coverage."""
import hashlib
import json
from pathlib import Path
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1] / 'styles/brunson-red-script/fonts'
fonts = {}
for key, filename, expected, source in [
    ('primary', 'Brunson.ttf', 'Brunson', 'https://www.dafont.com/brunson.font'),
    ('script', 'BrushScriptMT.ttf', 'Brush Script MT', 'https://www.wfonts.com/font/brush-script-mt'),
]:
    font = TTFont(root / filename)
    family = font['name'].getDebugName(1)
    if family != expected:
        raise ValueError(f'Expected {expected}, found {family}')
    cmap = font.getBestCmap()
    probe = 'ÄÖÜäöüßẞ„“”‘’"\'.,!?;:–—'
    missing = [c for c in probe if ord(c) not in cmap]
    fonts[key] = dict(asset=f'fonts/{filename}', family='CaptionsBrunson' if key == 'primary' else 'CaptionsBrushScriptMT',
                      originalFamily=family, weight=400, style='normal' if key == 'primary' else 'italic', license='SOURCE-NOTICE.txt', source=source,
                      sha256=hashlib.sha256((root / filename).read_bytes()).hexdigest(),
                      codepoints=sorted(cmap), unsupportedProbe=missing)
    print(f'{family}: {len(cmap)} mapped characters; unsupported probe: '+', '.join(f'U+{ord(c):04X}' for c in missing))
(root / 'source.json').write_text(json.dumps({'fonts': fonts}, indent=2)+'\n', encoding='utf-8')
