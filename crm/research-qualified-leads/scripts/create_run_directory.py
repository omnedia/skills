from __future__ import annotations

import argparse
import json
import re
import unicodedata
from datetime import datetime
from pathlib import Path
from typing import Any


MODES = {"VIDEO_EDITING", "POTENTIAL_CUSTOMERS"}


def slugify(value: str, maximum: int = 40) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().lower()
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", normalized))[:maximum].rstrip("-")


def create_run_directory(
    base_dir: str | Path,
    mode: str,
    label: str = "",
    now: datetime | None = None,
) -> dict[str, Any]:
    if mode not in MODES:
        raise ValueError(f"Unsupported mode: {mode}")
    created = now or datetime.now().astimezone()
    base = Path(base_dir).resolve()
    base.mkdir(parents=True, exist_ok=True)
    parts = [created.strftime("%Y%m%d-%H%M%S"), mode.lower().replace("_", "-")]
    label_slug = slugify(label)
    if label_slug:
        parts.append(label_slug)
    stem = "-".join(parts)
    run_dir = base / stem
    suffix = 2
    while True:
        try:
            run_dir.mkdir(exist_ok=False)
            break
        except FileExistsError:
            run_dir = base / f"{stem}-{suffix:02d}"
            suffix += 1
    evidence_dir = run_dir / "evidence"
    evidence_dir.mkdir()
    artifacts = {
        "evidence_directory": str(evidence_dir),
        "schema": str(run_dir / "schema.json"),
        "candidates": str(run_dir / "candidates.json"),
        "qualified_csv": str(run_dir / "qualified-leads.csv"),
        "run_summary": str(run_dir / "run-summary.json"),
    }
    manifest = {
        "run_id": run_dir.name,
        "mode": mode,
        "created_at": created.isoformat(timespec="seconds"),
        "run_directory": str(run_dir),
        "artifacts": artifacts,
    }
    (run_dir / "run-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return manifest


def main() -> int:
    parser = argparse.ArgumentParser(description="Create an isolated directory for one lead-research run.")
    parser.add_argument("--mode", required=True, choices=sorted(MODES))
    parser.add_argument("--base-dir", default="lead-research-runs")
    parser.add_argument("--label", default="")
    args = parser.parse_args()
    try:
        manifest = create_run_directory(args.base_dir, args.mode, args.label)
    except (OSError, ValueError) as exc:
        parser.error(str(exc))
    print(json.dumps(manifest, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
