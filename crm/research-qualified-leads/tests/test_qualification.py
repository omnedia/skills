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

    def test_budget_enrichment_attempt_is_required(self):
        candidate = potential_candidate()
        candidate.pop("budget_enrichment")
        self.assertEqual(qualify(candidate)["reason"], "BUDGET_ENRICHMENT_INCOMPLETE")

    def test_missing_budget_requires_documented_reason(self):
        candidate = potential_candidate(
            budget_enrichment={
                "attempted": True,
                "pages_checked": ["https://beispiel-handel.de/jobs/content"],
            }
        )
        self.assertEqual(qualify(candidate)["reason"], "BUDGET_ENRICHMENT_INCOMPLETE")

    def test_empty_budget_is_accepted_after_documented_attempt(self):
        self.assertTrue(qualify(potential_candidate())["accepted"])

    def test_missing_contacts_are_rejected_after_documented_search(self):
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
        self.assertFalse(result["accepted"])
        self.assertEqual(result["reason"], "CONTACT_NOT_FOUND")

    def test_one_valid_contact_is_enough(self):
        candidate = potential_candidate(
            phone="",
            contact_enrichment={
                "attempted": True,
                "pages_checked": ["https://beispiel-handel.de/kontakt"],
                "email_source_url": "https://beispiel-handel.de/kontakt",
                "unavailable_reasons": {"phone": "NOT_PUBLISHED"},
            },
        )
        self.assertTrue(qualify(candidate)["accepted"])

    def test_invalid_contacts_do_not_satisfy_contact_gate(self):
        candidate = potential_candidate(email="not an email", phone="not a phone")
        result = qualify(candidate)
        self.assertFalse(result["accepted"])
        self.assertEqual(result["reason"], "CONTACT_NOT_FOUND")

    def test_working_student_role_is_rejected(self):
        candidate = potential_candidate()
        candidate["evidence"][0]["job_title"] = "Werkstudent Video Editing (m/w/d)"
        result = qualify(candidate)
        self.assertFalse(result["accepted"])
        self.assertEqual(result["reason"], "LOW_COMPENSATION_ROLE")

    def test_internship_role_is_rejected(self):
        candidate = potential_candidate()
        candidate["evidence"][0]["job_title"] = "Praktikum Social Media Video"
        self.assertEqual(qualify(candidate)["reason"], "LOW_COMPENSATION_ROLE")

    def test_budget_requires_an_evidence_source(self):
        candidate = potential_candidate(budget="45.000–55.000 EUR/Jahr")
        self.assertEqual(qualify(candidate)["reason"], "INVALID_BUDGET")

    def test_sourced_budget_is_accepted(self):
        candidate = potential_candidate(
            budget="45.000–55.000 EUR/Jahr",
            budget_source_url="https://beispiel-handel.de/jobs/content",
        )
        self.assertTrue(qualify(candidate)["accepted"])

    def test_budget_source_must_be_a_checked_page(self):
        candidate = potential_candidate(
            budget="45.000–55.000 EUR/Jahr",
            budget_source_url="https://beispiel-handel.de/jobs/content",
            budget_enrichment={
                "attempted": True,
                "pages_checked": ["https://beispiel-handel.de/jobs/other"],
            },
        )
        self.assertEqual(qualify(candidate)["reason"], "BUDGET_ENRICHMENT_INCOMPLETE")


if __name__ == "__main__":
    unittest.main()
