"""Verify bundled official Montserrat variable fonts, including German glyphs.
Run with fontTools installed. No network access or synthetic font conversion.
"""
import hashlib
import json
from pathlib import Path
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1] / 'styles/montserrat-difference/fonts'
fonts = {}
for italic in (False, True):
    filename = 'Montserrat-Italic.ttf' if italic else 'Montserrat.ttf'
    font = TTFont(root / filename)
    cmap = font.getBestCmap()
    assert all(ord(c) in cmap for c in 'ÄÖÜäöüßẞ0123456789?!.,:;–—„“'), 'Missing German glyph'
    axis = next(a for a in font['fvar'].axes if a.axisTag == 'wght')
    assert axis.minValue <= 100 and axis.maxValue >= 700
    for weight in (100, 200, 300, 700):
        key = 'primary' if weight == 700 and not italic else f'w{weight}' + ('italic' if italic else '')
        fonts[key] = dict(asset=f'fonts/{filename}', family='CaptionsMontserrat', weight=weight,
                          style='italic' if italic else 'normal', license='OFL.txt',
                          sha256=hashlib.sha256((root / filename).read_bytes()).hexdigest(),
                          source='https://github.com/google/fonts/tree/main/ofl/montserrat',
                          codepoints=sorted(cmap))
(root / 'source.json').write_text(json.dumps({'fonts': fonts}, indent=2) + '\n', encoding='utf-8')
print('Verified Montserrat 100/200/300/700 upright and actual italics; German glyph coverage passed')
