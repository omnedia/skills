"""Local forced alignment of supplied wording; not a user transcript parser.

Python 3.10-3.12, FFmpeg, requirements in alignment-requirements.txt.
Whisper weights download on first use; audio/text never leave this process.
"""
import argparse
import difflib
import hashlib
import importlib.metadata
import json
import re
from pathlib import Path


def lexical(text):
    return re.findall(r"\w+", text.casefold(), flags=re.UNICODE)


def disagreement(expected, heard):
    a, b = lexical(expected), lexical(heard)
    matcher = difflib.SequenceMatcher(None, a, b, autojunk=False)
    changes = [{"supplied": " ".join(a[i:j]), "heard": " ".join(b[k:l])}
               for op, i, j, k, l in matcher.get_opcodes() if op != "equal"]
    return {"similarity": matcher.ratio(), "passages": changes}


def normalize_alignment(original, segments):
    """Restore exact whitespace/punctuation; reject lost text or instant words."""
    cursor = 0
    words = []
    for segment in segments:
        for word in segment["words"]:
            token = word["word"].strip()
            if not token:
                continue
            start = cursor
            while cursor < len(original) and original[cursor].isspace():
                cursor += 1
            if not original.startswith(token, cursor):
                raise ValueError(f"Alignment changed supplied wording near {original[cursor:cursor+60]!r}; review this passage.")
            cursor += len(token)
            if word["end"] <= word["start"]:
                raise ValueError(f"No reliable speech interval for {token!r}; review the audio/text.")
            if words and word["start"] * 1000 < words[-1]["endMs"] - 0.01:
                raise ValueError(f"Overlapping word alignment near {token!r}; review the audio/text.")
            words.append({"text": original[start:cursor], "startMs": round(word["start"] * 1000, 3),
                          "endMs": round(word["end"] * 1000, 3), "timestampMs": None,
                          "confidence": word.get("probability")})
    if original[cursor:].strip() or not words:
        raise ValueError(f"Unaligned passage: {original[cursor:]!r}")
    words[-1]["text"] += original[cursor:]
    sentences, current = [], []
    for word in words:
        current.append(word)
        if re.search(r'[.!?][”\"\')]*\s*$', word["text"]):
            sentences.append({"words": current})
            current = []
    if current:
        sentences.append({"words": current})
    return {"sentences": sentences}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("audio", type=Path)
    parser.add_argument("text", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--language", required=True)
    parser.add_argument("--model", default="base")
    parser.add_argument("--model-dir", type=Path, default=Path.home() / ".cache/codex-captions/whisper")
    parser.add_argument("--cues", type=Path, help="Agent-interpreted [{start,end,text}] in audio seconds, optional")
    args = parser.parse_args()
    if args.output.exists():
        parser.error("Output already exists. Choose a new file; do not confuse stale timing with a new alignment.")
    import stable_whisper
    text = args.text.read_text(encoding="utf-8-sig")
    model = stable_whisper.load_model(args.model, device="cpu", download_root=str(args.model_dir))
    # ASR is an independent mismatch signal only. Its words never become caption text.
    heard = model.transcribe(str(args.audio), language=args.language, fp16=False, verbose=None)
    review = disagreement(text, heard.text)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    review_path = args.output.with_suffix(".review.json")
    review_path.write_text(json.dumps(review, ensure_ascii=False, indent=2), encoding="utf-8")
    if review["similarity"] < 0.8:
        raise SystemExit(f"Material text/audio disagreement. Review affected passages in {review_path}; correct the input before proceeding.")
    if args.cues:
        cues = json.loads(args.cues.read_text(encoding="utf-8-sig"))
        if lexical(" ".join(cue["text"] for cue in cues)) != lexical(text):
            raise SystemExit("Cue wording differs from supplied text. Resolve before alignment.")
        result = model.align_words(str(args.audio), cues, language=args.language, verbose=None)
    else:
        result = model.align(str(args.audio), text, language=args.language, verbose=None)
    if result is None:
        raise SystemExit("Alignment failed. No normalized captions were created.")
    normalized = normalize_alignment(text, result.to_dict()["segments"])
    normalized["provenance"] = {"method": "stable-ts forced alignment", "model": args.model,
                              "stableTsVersion": importlib.metadata.version("stable-ts"),
                              "audioSha256": hashlib.sha256(args.audio.read_bytes()).hexdigest(),
                              "textSha256": hashlib.sha256(args.text.read_bytes()).hexdigest(),
                              "language": args.language, "review": review}
    args.output.write_text(json.dumps(normalized, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Aligned: {args.output}. Review word boundaries and disagreement passages before use.")


if __name__ == "__main__":
    main()
