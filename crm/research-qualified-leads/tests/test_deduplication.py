from __future__ import annotations

import unittest

from helpers import potential_candidate
from normalize_company import compare, normalize_name, registrable_domain


class DeduplicationTests(unittest.TestCase):
    def test_registrable_domain_normalizes_subdomain_idn_and_case(self):
        self.assertEqual(registrable_domain("HTTPS://WWW.Example.DE/path?q=1"), "example.de")
        self.assertEqual(registrable_domain("https://shop.example.co.uk"), "example.co.uk")

    def test_legal_suffix_removed(self):
        self.assertEqual(normalize_name("Müller Geräte GmbH"), "muller gerate")

    def test_domain_match_is_duplicate(self):
        result = compare(
            {"name": "Other", "website_url": "https://www.example.de", "country": "DE", "city": "A"},
            {"name": "Example", "website_url": "https://jobs.example.de", "country": "DE", "city": "B"},
        )
        self.assertTrue(result["duplicate"])

    def test_name_domain_disagreement_requires_review(self):
        result = compare(
            {"name": "Example GmbH", "website_url": "https://one.de", "country": "DE", "city": "Berlin"},
            {"name": "Example AG", "website_url": "https://two.de", "country": "DE", "city": "Berlin"},
        )
        self.assertEqual(result["reason"], "DEDUPE_REVIEW_REQUIRED")


if __name__ == "__main__":
    unittest.main()
