from __future__ import annotations

import argparse
import json
import os
import sys
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

from export_twenty_csv import export
from lead_core import ContractError


def read_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ContractError(f"Cannot read {path.name}: {exc}") from exc


def dedupe_run(run_directory: str | Path, company_csv: str | Path) -> dict[str, Any]:
    run_dir = Path(run_directory).resolve()
    company_path = Path(company_csv).resolve()
    if not run_dir.is_dir():
        raise ContractError(f"Run directory does not exist: {run_dir}")
    if not company_path.is_file():
        raise ContractError(f"company.csv does not exist: {company_path}")
    manifest_path = run_dir / "run-manifest.json"
    candidates_path = run_dir / "candidates.json"
    output_path = run_dir / "qualified-leads.csv"
    summary_path = run_dir / "run-summary.json"
    for required in (manifest_path, candidates_path, output_path, summary_path):
        if not required.is_file():
            raise ContractError(f"Existing run is incomplete; missing {required.name}")
    if company_path in {output_path.resolve(), summary_path.resolve(), candidates_path.resolve(), manifest_path.resolve()}:
        raise ContractError("The source company.csv must not be one of the generated run files")
    manifest = read_json(manifest_path)
    recorded_run_dir = Path(str(manifest.get("run_directory", ""))).resolve()
    if recorded_run_dir != run_dir:
        raise ContractError("run-manifest.json does not belong to this run directory")
    previous_summary = read_json(summary_path)
    candidates_payload = read_json(candidates_path)
    candidates = candidates_payload if isinstance(candidates_payload, list) else [candidates_payload]
    mode = str(manifest.get("mode") or previous_summary.get("mode") or "")
    requested_count = int(previous_summary.get("requested", len(candidates)))
    minimum_score = previous_summary.get("minimum_score")
    token = uuid.uuid4().hex
    staged_csv = run_dir / f".qualified-leads-{token}.csv"
    staged_summary = run_dir / f".run-summary-{token}.json"
    try:
        summary = export(
            str(company_path), candidates, str(staged_csv), mode, requested_count,
            minimum_score=minimum_score,
        )
        summary.update({
            "in_place_dedupe": True,
            "dedupe_updated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
            "dedupe_source": str(company_path),
            "run_directory": str(run_dir),
        })
        staged_summary.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        os.replace(staged_csv, output_path)
        os.replace(staged_summary, summary_path)
    finally:
        for staged in (staged_csv, staged_summary):
            if staged.exists():
                staged.unlink()
    return summary


def main() -> int:
    parser = argparse.ArgumentParser(description="Deduplicate an existing research run in place.")
    parser.add_argument("run_directory")
    parser.add_argument("company_csv")
    args = parser.parse_args()
    try:
        summary = dedupe_run(args.run_directory, args.company_csv)
    except (ContractError, OSError, ValueError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
