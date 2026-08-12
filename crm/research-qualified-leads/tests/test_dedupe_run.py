from __future__ import annotations

import json
import shutil
import tempfile
import unittest
from pathlib import Path

from helpers import ROOT, potential_candidate
from create_run_directory import create_run_directory
from dedupe_run import dedupe_run
from export_twenty_csv import export
from lead_core import parse_csv


FIXTURE = ROOT / "tests" / "fixtures" / "company.csv"


def build_run(base: Path) -> Path:
    manifest = create_run_directory(base, "POTENTIAL_CUSTOMERS", "dedupe-test")
    run_dir = Path(manifest["run_directory"])
    candidates = [potential_candidate()]
    (run_dir / "candidates.json").write_text(json.dumps(candidates, ensure_ascii=False), encoding="utf-8")
    summary = export(None, candidates, str(run_dir / "qualified-leads.csv"), "POTENTIAL_CUSTOMERS", 1)
    (run_dir / "run-summary.json").write_text(json.dumps(summary, ensure_ascii=False), encoding="utf-8")
    return run_dir


class DedupeRunTests(unittest.TestCase):
    def test_replaces_outputs_in_existing_run_without_touching_source(self):
        with tempfile.TemporaryDirectory() as directory:
            run_dir = build_run(Path(directory))
            source_before = FIXTURE.read_bytes()
            files_before = {path.relative_to(run_dir) for path in run_dir.rglob("*")}
            result = dedupe_run(run_dir, FIXTURE)
            files_after = {path.relative_to(run_dir) for path in run_dir.rglob("*")}
            self.assertEqual(files_after, files_before)
            self.assertEqual(FIXTURE.read_bytes(), source_before)
            self.assertTrue(result["in_place_dedupe"])
            self.assertTrue(result["crm_deduplication_performed"])
            self.assertFalse(result["needs_dedup_test"])
            persisted = json.loads((run_dir / "run-summary.json").read_text(encoding="utf-8"))
            self.assertEqual(persisted["dedupe_source"], str(FIXTURE.resolve()))

    def test_duplicate_is_removed_from_existing_leads_csv(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            run_dir = build_run(base)
            company_source = base / "company-source.csv"
            shutil.copyfile(run_dir / "qualified-leads.csv", company_source)
            result = dedupe_run(run_dir, company_source)
            _, rows = parse_csv(run_dir / "qualified-leads.csv")
            self.assertEqual(rows, [])
            self.assertEqual(result["accepted"], 0)
            self.assertEqual(result["rejected"], {"CRM_DUPLICATE": 1})


if __name__ == "__main__":
    unittest.main()
