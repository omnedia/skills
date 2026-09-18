"""Regenerate the Editorial Kinetic manifest after verifying licensed font files.

Development only: requires fontTools. Does not download or approve new fonts.
"""
import hashlib
import json
from pathlib import Path
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1] / 'styles/editorial-kinetic/fonts'
specs = [
    ('primary', 'Poppins-Bold.ttf', 'Poppins', 'CaptionsEditorialPoppins', 700, 'normal', 'Poppins-LICENSE.txt', 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf'),
    ('serif', 'LibreBaskerville-Italic.ttf', 'Libre Baskerville', 'CaptionsEditorialBaskerville', 400, 'italic', 'LibreBaskerville-LICENSE.txt', 'https://raw.githubusercontent.com/google/fonts/main/ofl/librebaskerville/LibreBaskerville-Italic%5Bwght%5D.ttf'),
    ('handwritten', 'LazyDog.ttf', 'Lazy', 'CaptionsEditorialLazyDog', 400, 'normal', 'LazyDog-LICENSE.txt', 'https://dl.dafont.com/dl/?f=lazy_dog'),
]
fonts = {}
for role, file, expected, family, weight, style, license_file, source in specs:
    font = TTFont(root / file)
    names = sorted({n.toUnicode() for n in font['name'].names if n.nameID in (1, 2, 4, 6)})
    assert any(expected.lower() in n.lower() for n in names), names
    assert (root / license_file).is_file()
    fonts[role] = dict(asset=f'fonts/{file}', family=family, weight=weight, style=style,
                       sha256=hashlib.sha256((root / file).read_bytes()).hexdigest(),
                       license=license_file, source=source, names=names,
                       codepoints=sorted(font.getBestCmap()))
    print(role, names, len(fonts[role]['codepoints']), 'codepoints')
(root / 'source.json').write_text(json.dumps({'fonts': fonts}, indent=2) + '\n', encoding='utf-8')
