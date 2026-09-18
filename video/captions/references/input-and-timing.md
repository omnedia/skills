# Input and synchronization

## Interpret before normalizing

Read the transcript as content. Accept intelligible notes, tables, timecodes, SRT/VTT cues, word JSON or another understandable layout. There is deliberately no deterministic transcript-schema validator. For example, `tests/fixtures/timed-notes.txt` uses arrows and prose; its seconds are interpretable without prescribed field names. The accompanying normalized fixture records those same times in milliseconds.

Decide whether timing is per word, per cue, ambiguous, or absent:

- Word intervals: preserve them. Inspect order, overlap, duration and any sequence origin. Never silently fix contradictory intervals by sorting, clamping or shifting them.
- Cue intervals: accept them as valid cue timing. They generally do not locate individual words. If actual source evidence does not provide word boundaries, request corresponding audio or word-timed text and stop dependent work. Do not divide cue lengths by word/character count.
- Untimed wording with audio: forced-align the original wording using the implemented local path below.
- Untimed wording without audio: “I cannot infer usable timing from this transcript, and no audio was provided for synchronization. Please provide a transcript with timestamps or the corresponding audio to continue.” Save choices and stop; no approximate project.

Resolve unclear units, `HH:MM:SS:FF` frame rate/drop-frame conventions, source origins and offsets from context; ask only about remaining ambiguity that changes synchronization. A short `01:02` could mean minutes:seconds or a frame timecode; do not guess. For multi-speaker overlaps, resolve the intended single-caption stream with the user rather than silently dropping a speaker.

## Local forced alignment

Dependencies: Python 3.10–3.12, FFmpeg on PATH, `stable-ts==2.19.1` and `openai-whisper==20250625`, with PyTorch/torchaudio and their dependencies. CPU execution works; no account or paid service is required. Stable-ts is archived upstream; the pinned path has been exercised, and upgrades need fresh integration testing. Install in a user or project environment outside the skill:

```text
python -m venv <alignment-env>
<alignment-python> -m pip install -r <skill>/scripts/alignment-requirements.txt
<alignment-python> <skill>/scripts/align.py <audio.wav> <wording.txt> <normalized.json> --language en --model base
```

On Windows `<alignment-python>` is `<alignment-env>/Scripts/python.exe`; on POSIX it is `<alignment-env>/bin/python`. Install a matched CPU torch/torchaudio pair if the platform's default wheels are incompatible. `base` downloads about 139 MiB once into `~/.cache/codex-captions/whisper`; `--model-dir` changes this. Network access is needed for packages/model weights, **not for uploading audio or text**. Model downloads use Whisper's checksum verification. Language must reflect the supplied text/audio; multilingual Whisper models can be chosen with `--model` for difficult material. `base.en` is English-only, so do not use it for another language.

The script independently transcribes audio as a mismatch signal, compares lexical wording, then calls `model.align()` on the **supplied original text**. The ASR transcript never replaces captions. Similarity below 0.8 stops without producing timing and writes affected supplied/heard passages to `*.review.json`. This is a conservative screening signal, not proof of agreement: inspect all reported differences, listen at questionable passages and review boundaries even when it passes. Escalate material disagreements to the user. An ASR error may require a better model or a corrected source; never weaken the check just to force output.

For reliable cue bounds, semantically normalize cues to a separate list of `{start,end,text}` in audio-relative seconds and pass `--cues <cues.json>`. The script uses `align_words()` constrained to those intervals. Keep the user's original wording in the text file. If timestamps are relative to another source origin, translate explicitly and record the translation; do not shift the audio without documenting it.

The script rejects missing words, changed wording, zero-duration and overlapping alignment results. It preserves original whitespace/punctuation and records model/version plus audio/text hashes. Review the resulting timing before setting the run's `word-timing-reviewed` state. Very low-confidence words deserve listening review. No helper can guarantee perfect acoustic alignment or semantic agreement.

## Internal render representation

Once semantically reviewed, write `normalized.json`:

```json
{
  "sentences": [{"words": [
    {"text":"Hello,","startMs":1200,"endMs":1500,"timestampMs":null,"confidence":null},
    {"text":" world!","startMs":1650,"endMs":2200,"timestampMs":null,"confidence":null}
  ]}]
}
```

Words use Remotion's `Caption` type; leading whitespace belongs to the word as supplied. Sentence grouping is supplementary and may be edited at phrase boundaries without changing times or text. Do not require users to supply this JSON. For languages without spaces, preserve adjacent text; inspect segmentation and glyph support. Inter does not cover every writing system: if the bundled font lacks required glyphs, resolve a licensed per-project font with the user rather than silently using a system fallback.

Copy alignment provenance into the run's `timing.provenance` (an object is allowed). Record source paths/hashes, units, sequence origin, and offset decisions. `sourceOffsetMs` in saved settings is applied once at render time; do not also bake it into word timestamps.

Sources checked during implementation: [Remotion Caption](https://www.remotion.dev/docs/captions/caption), [stable-ts alignment API](https://github.com/jianfch/stable-ts#alignment), [Whisper models/setup](https://github.com/openai/whisper).
