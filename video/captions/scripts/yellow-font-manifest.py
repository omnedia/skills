"""Regenerate Yellow Authority's exact static faces and coverage (fontTools required)."""
import hashlib
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

root = Path(__file__).resolve().parents[1]
out = root / 'styles/yellow-authority/fonts'
target = out / 'Montserrat-ExtraBoldItalic.ttf'
if not target.exists():
    font = TTFont(root / 'styles/montserrat-difference/fonts/Montserrat-Italic.ttf')
    instantiateVariableFont(font, {'wght': 800}, inplace=True, updateFontNames=True).save(target)
specs = [('primary', 'Poppins-SemiBold.ttf', 600, 'normal', 'Poppins'),
         ('display', 'Poppins-ExtraBold.ttf', 800, 'normal', 'Poppins'),
         ('italic', 'Montserrat-ExtraBoldItalic.ttf', 800, 'italic', 'Montserrat')]
fonts = {}
for role, name, weight, style, family in specs:
    file = out / name
    font = TTFont(file)
    assert font['OS/2'].usWeightClass == weight
    assert bool(font['head'].macStyle & 2) == (style == 'italic')
    license_name = family + '-LICENSE.txt'
    assert (out / license_name).is_file()
    fonts[role] = dict(asset='fonts/' + name, family='CaptionsYellow' + role.title(), weight=weight,
                       style=style, license=license_name, sha256=hashlib.sha256(file.read_bytes()).hexdigest(),
                       codepoints=sorted(font.getBestCmap()),
                       names=sorted({n.toUnicode() for n in font['name'].names if n.nameID in (1,2,4,6)}),
                       source='https://github.com/google/fonts/tree/main/ofl/' + family.lower())
(out / 'source.json').write_text(json.dumps({'fonts': fonts}, indent=2) + '\n', encoding='utf-8')
