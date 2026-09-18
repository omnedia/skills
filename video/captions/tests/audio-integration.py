"""Exercise real local alignment, cue-constrained alignment and a material mismatch.

Run with the alignment environment's Python; optionally pass --model-dir <cache>.
The bundled speech is a locally generated English test sentence, not user audio.
"""
import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--model-dir', type=Path)
args = parser.parse_args()
skill = Path(__file__).resolve().parents[1]
fixture = skill / 'tests/fixtures'
with tempfile.TemporaryDirectory(prefix='captions-audio-') as folder:
    folder = Path(folder)
    command = [sys.executable, str(skill / 'scripts/align.py'), str(fixture / 'speech.wav')]
    flags = ['--language', 'en', '--model', 'base']
    if args.model_dir:
        flags += ['--model-dir', str(args.model_dir.resolve())]
    output = folder / 'aligned.json'
    subprocess.run(command + [str(fixture / 'speech.txt'), str(output)] + flags, check=True)
    result = json.loads(output.read_text(encoding='utf-8'))
    words = [word for sentence in result['sentences'] for word in sentence['words']]
    assert ''.join(word['text'] for word in words) == (fixture / 'speech.txt').read_text(encoding='utf-8')
    assert len(words) == 5
    assert words[3]['startMs'] - words[2]['endMs'] > 400, 'Sentence pause disappeared'
    assert words[4]['startMs'] > words[3]['endMs'], 'Repeated-word pause disappeared'
    assert 2700 < words[-1]['endMs'] < 3180, 'Final word is outside the actual speech region'
    cues = folder / 'cues.json'
    cues.write_text(json.dumps([{'start':0,'end':1.5,'text':'Every word matters.'}, {'start':1.8,'end':3.18,'text':' Go, go!'}]))
    subprocess.run(command + [str(fixture / 'speech.txt'), str(folder / 'cue-aligned.json')] + flags + ['--cues', str(cues)], check=True)
    bad = folder / 'mismatch.txt'
    bad.write_text('The train arrives tomorrow morning with twelve passengers.', encoding='utf-8')
    failed = subprocess.run(command + [str(bad), str(folder / 'bad.json')] + flags, capture_output=True, text=True)
    assert failed.returncode != 0 and not (folder / 'bad.json').exists()
    report = json.loads((folder / 'bad.review.json').read_text())
    assert report['passages'] and report['similarity'] < 0.8
print('Real audio: preserved text, pauses, repeated words, cue alignment and mismatch hard stop passed.')
