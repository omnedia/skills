from __future__ import annotations

import json
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

from helpers import ROOT
from create_run_directory import create_run_directory, slugify


class RunDirectoryTests(unittest.TestCase):
    def test_creates_isolated_run_with_manifest_and_evidence_folder(self):
        with tempfile.TemporaryDirectory() as directory:
            fixed = datetime(2026, 8, 11, 12, 34, 56, tzinfo=timezone.utc)
            result = create_run_directory(directory, "VIDEO_EDITING", "DACH August", fixed)
            run_dir = Path(result["run_directory"])
            self.assertEqual(run_dir.name, "20260811-123456-video-editing-dach-august")
            self.assertTrue((run_dir / "evidence").is_dir())
            manifest = json.loads((run_dir / "run-manifest.json").read_text(encoding="utf-8"))
            self.assertEqual(manifest["artifacts"]["qualified_csv"], str(run_dir / "qualified-leads.csv"))

    def test_same_timestamp_creates_new_folder(self):
        with tempfile.TemporaryDirectory() as directory:
            fixed = datetime(2026, 8, 11, 12, 34, 56, tzinfo=timezone.utc)
            first = create_run_directory(directory, "POTENTIAL_CUSTOMERS", now=fixed)
            second = create_run_directory(directory, "POTENTIAL_CUSTOMERS", now=fixed)
            self.assertNotEqual(first["run_directory"], second["run_directory"])
            self.assertTrue(second["run_directory"].endswith("-02"))

    def test_label_is_safe_slug(self):
        self.assertEqual(slugify("  München / Q3  "), "munchen-q3")


if __name__ == "__main__":
    unittest.main()
