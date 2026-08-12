from __future__ import annotations

import csv
import json
import tempfile
import unittest
from pathlib import Path

from helpers import ROOT, potential_candidate
from lead_core import ContractError, parse_csv
from export_twenty_csv import export


FIXTURE = ROOT / "tests" / "fixtures" / "company.csv"


class CsvContractTests(unittest.TestCase):
    def test_parses_utf8_quoted_values_and_unknown_columns(self):
        contract, rows = parse_csv(FIXTURE)
        self.assertEqual(rows[0]["Name"], "Müller Geräte GmbH")
        self.assertEqual(rows[0]["Address / City"], "Düsseldorf, Zentrum")
        self.assertEqual(rows[0]["Custom Field"], "keep me")
        self.assertEqual(contract.empty_list, "[]")

    def test_missing_required_column_stops(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.csv"
            path.write_text("Name,Status\nA,OFFEN\n", encoding="utf-8")
            with self.assertRaisesRegex(ContractError, "Missing required"):
                parse_csv(path)

    def test_duplicate_header_stops(self):
        text = FIXTURE.read_text(encoding="utf-8").replace("Custom Field", "Name", 1)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.csv"
            path.write_text(text, encoding="utf-8")
            with self.assertRaisesRegex(ContractError, "Duplicate CSV headers"):
                parse_csv(path)

    def test_short_malformed_row_stops(self):
        text = FIXTURE.read_text(encoding="utf-8").rsplit(",", 3)[0] + "\n"
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.csv"
            path.write_text(text, encoding="utf-8")
            with self.assertRaisesRegex(ContractError, "Malformed row"):
                parse_csv(path)

    def test_roundtrip_preserves_columns_and_rows_and_appends_markdown_notes(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "out.csv"
            summary = export(str(FIXTURE), [potential_candidate()], str(output), "POTENTIAL_CUSTOMERS", 1, include_existing=True)
            contract, rows = parse_csv(output)
            self.assertEqual(contract.headers[-2:], ["Custom Field", "AI Notes / Markdown"])
            self.assertEqual(rows[0]["Custom Field"], "keep me")
            self.assertEqual(len(rows), 2)
            self.assertEqual(summary["exported"], 1)
            self.assertEqual(rows[1]["Status"], "OFFEN")
            self.assertEqual(rows[1]["AI Notes / Markdown"], potential_candidate()["ai_notes"])
            self.assertEqual(summary["contact_enrichment"]["exported_with_both"], 1)
            self.assertEqual(summary["budget_enrichment"]["exported_attempted"], 1)
            self.assertEqual(summary["budget_enrichment"]["exported_without_published_budget"], 1)

    def test_adds_and_exports_optional_budget_column(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "out.csv"
            candidate = potential_candidate(
                budget="45.000–55.000 EUR/Jahr",
                budget_source_url="https://beispiel-handel.de/jobs/content",
            )
            summary = export(str(FIXTURE), [candidate], str(output), "POTENTIAL_CUSTOMERS", 1)
            contract, rows = parse_csv(output)
            self.assertIn("Budget", contract.headers)
            self.assertEqual(rows[0]["Budget"], "45.000–55.000 EUR/Jahr")
            self.assertEqual(summary["exported_with_budget"], 1)
            self.assertEqual(summary["budget_enrichment"]["exported_attempted"], 1)
            self.assertEqual(summary["budget_enrichment"]["exported_with_published_budget"], 1)

    def test_only_keeps_markdown_notes_and_migrates_existing_text(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "source.csv"
            contract, rows = parse_csv(FIXTURE)
            headers = contract.headers[:-1] + ["AI Notes / BlockNote", "AI Notes / Markdown", "AI Notes", contract.headers[-1]]
            rows[0]["AI Notes / BlockNote"] = json.dumps([{"content": [{"type": "text", "text": "BlockNote fallback"}]}])
            rows[0]["AI Notes / Markdown"] = "Markdown source"
            rows[0]["AI Notes"] = "Legacy source"
            with source.open("w", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=headers)
                writer.writeheader()
                writer.writerow(rows[0])
            output = Path(directory) / "out.csv"
            export(str(source), [potential_candidate()], str(output), "POTENTIAL_CUSTOMERS", 1, include_existing=True)
            out_contract, out_rows = parse_csv(output)
            self.assertIn("AI Notes / Markdown", out_contract.headers)
            self.assertNotIn("AI Notes / BlockNote", out_contract.headers)
            self.assertNotIn("AI Notes", out_contract.headers)
            self.assertEqual(out_rows[0]["AI Notes / Markdown"], "Markdown source")
            self.assertEqual(out_rows[1]["AI Notes / Markdown"], potential_candidate()["ai_notes"])

    def test_migrates_blocknote_when_no_text_note_exists(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "source.csv"
            contract, rows = parse_csv(FIXTURE)
            headers = contract.headers + ["AI Notes / BlockNote"]
            rows[0]["AI Notes / BlockNote"] = json.dumps([{"content": [{"type": "text", "text": "BlockNote fallback"}]}])
            with source.open("w", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=headers)
                writer.writeheader()
                writer.writerow(rows[0])
            output = Path(directory) / "out.csv"
            export(str(source), [potential_candidate()], str(output), "POTENTIAL_CUSTOMERS", 1, include_existing=True)
            _, out_rows = parse_csv(output)
            self.assertEqual(out_rows[0]["AI Notes / Markdown"], "BlockNote fallback")

    def test_invalid_contacts_are_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "out.csv"
            candidate = potential_candidate(phone="not a phone", email="not an email")
            summary = export(str(FIXTURE), [candidate], str(output), "POTENTIAL_CUSTOMERS", 1)
            _, rows = parse_csv(output)
            self.assertEqual(summary["accepted"], 0)
            self.assertEqual(summary["rejected"], {"CONTACT_NOT_FOUND": 1})
            self.assertEqual(rows, [])

    def test_bom_is_preserved(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "bom.csv"
            source.write_text(FIXTURE.read_text(encoding="utf-8"), encoding="utf-8-sig")
            output = Path(directory) / "out.csv"
            export(str(source), [potential_candidate()], str(output), "POTENTIAL_CUSTOMERS", 1)
            self.assertTrue(output.read_bytes().startswith(b"\xef\xbb\xbf"))

    def test_production_export_requires_verified_import(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "out.csv"
            with self.assertRaisesRegex(ContractError, "smoke test"):
                export(str(FIXTURE), [potential_candidate()], str(output), "POTENTIAL_CUSTOMERS", 1, production=True)

    def test_exports_without_company_csv_and_marks_dedup_needed(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "out.csv"
            summary = export(None, [potential_candidate()], str(output), "POTENTIAL_CUSTOMERS", 1)
            contract, rows = parse_csv(output)
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["Status"], "OFFEN")
            self.assertIn("AI Notes / Markdown", contract.headers)
            self.assertNotIn("AI Notes / BlockNote", contract.headers)
            self.assertNotIn("AI Notes", contract.headers)
            self.assertFalse(summary["crm_deduplication_performed"])
            self.assertTrue(summary["needs_dedup_test"])
            self.assertEqual(summary["schema_source"], "bundled_compatibility_schema")
            self.assertEqual(summary["warnings"], {"NEEDS_DEDUP_TEST": 1})


if __name__ == "__main__":
    unittest.main()
