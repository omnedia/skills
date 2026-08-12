from __future__ import annotations

import unittest

from helpers import potential_candidate
from qualify_lead import qualify


class QualificationTests(unittest.TestCase):
    def test_score_is_derived_not_trusted(self):
        result = qualify(potential_candidate())
        self.assertTrue(result["accepted"])
        self.assertEqual(result["score"], 65)
        self.assertEqual(result["scope"], "SCALE/SIGNATURE")
        self.assertEqual(result["status"], "OFFEN")

    def test_geography_is_enforced(self):
        result = qualify(potential_candidate(country="AT"))
        self.assertEqual(result["reason"], "GEOGRAPHY_MISMATCH")

    def test_stale_primary_signal_is_rejected(self):
        candidate = potential_candidate()
        for item in candidate["evidence"]:
            item["published_at"] = "2025-01-01"
            item["current_state"] = ""
        result = qualify(candidate)
        self.assertFalse(result["accepted"])
        self.assertIn(result["reason"], {"STALE_SIGNAL", "SOURCE_UNVERIFIABLE"})

    def test_duplicate_score_component_is_rejected(self):
        candidate = potential_candidate()
        candidate["score_components"].append({"reason": "CONTENT_HIRING", "points": 40})
        self.assertEqual(qualify(candidate)["reason"], "INVALID_SCORE")

    def test_contact_enrichment_attempt_is_required(self):
        candidate = potential_candidate()
        candidate.pop("contact_enrichment")
        self.assertEqual(qualify(candidate)["reason"], "CONTACT_ENRICHMENT_INCOMPLETE")

    def test_missing_contacts_are_allowed_after_documented_search(self):
        candidate = potential_candidate(
            email="",
            phone="",
            contact_enrichment={
                "attempted": True,
                "pages_checked": ["https://beispiel-handel.de/impressum"],
                "unavailable_reasons": {"email": "NOT_PUBLISHED", "phone": "NOT_PUBLISHED"},
            },
        )
        result = qualify(candidate)
        self.assertTrue(result["accepted"])
        self.assertEqual(result["score"], 65)


if __name__ == "__main__":
    unittest.main()
