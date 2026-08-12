from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from helpers import ROOT, potential_candidate
from export_twenty_csv import export
from lead_core import ContractError, parse_csv, sanitize_free_text, validate_http_url


FIXTURE = ROOT / "tests" / "fixtures" / "company.csv"


class SecurityTests(unittest.TestCase):
    def test_formula_and_controls_are_neutralized(self):
        value, changed = sanitize_free_text(" \x00=HYPERLINK(\"x\")")
        self.assertTrue(changed)
        self.assertEqual(value, "' =HYPERLINK(\"x\")")

    def test_non_http_and_credential_urls_rejected(self):
        for value in ("file:///etc/passwd", "javascript:alert(1)", "https://user:pass@example.de"):
            with self.assertRaises(ContractError):
                validate_http_url(value)

    def test_export_sanitizes_hostile_company_name(self):
        candidate = potential_candidate(name="=CMD|' /C calc'!A0")
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "out.csv"
            summary = export(str(FIXTURE), [candidate], str(output), "POTENTIAL_CUSTOMERS", 1)
            _, rows = parse_csv(output)
            self.assertTrue(rows[0]["Name"].startswith("'="))
            self.assertEqual(summary["sanitized"], 1)

    def test_invalid_utf8_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.csv"
            path.write_bytes(b"\xff\xfe")
            with self.assertRaisesRegex(ContractError, "valid UTF-8"):
                parse_csv(path)


if __name__ == "__main__":
    unittest.main()
