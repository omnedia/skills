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
        candidate["evidence"][0]["job_detail_identity"]["job_title"] = "Werkstudent Video Editing (m/w/d)"
        result = qualify(candidate)
        self.assertFalse(result["accepted"])
        self.assertEqual(result["reason"], "LOW_COMPENSATION_ROLE")

    def test_xing_search_page_cannot_be_exported_as_referrer(self):
        candidate = potential_candidate(primary_source_url="https://www.xing.com/jobs/video-cutter")
        candidate["evidence"][0]["source_url"] = "https://www.xing.com/jobs/video-cutter"
        result = qualify(candidate)
        self.assertFalse(result["accepted"])
        self.assertEqual(result["reason"], "JOB_DETAIL_URL_REQUIRED")

    def test_metajob_search_page_cannot_be_exported_as_referrer(self):
        candidate = potential_candidate(primary_source_url="https://www.metajob.de/videoeditor")
        candidate["evidence"][0]["source_url"] = "https://www.metajob.de/videoeditor"
        candidate["evidence"][0]["source_type"] = "job_board_job_detail"
        result = qualify(candidate)
        self.assertFalse(result["accepted"])
        self.assertEqual(result["reason"], "JOB_DETAIL_URL_REQUIRED")

    def test_unopened_job_result_cannot_claim_to_be_a_detail_page(self):
        candidate = potential_candidate()
        candidate["evidence"][0]["job_detail_verified"] = False
        self.assertEqual(qualify(candidate)["reason"], "JOB_DETAIL_URL_REQUIRED")

    def test_search_page_on_any_platform_requires_single_vacancy_identity(self):
        candidate = potential_candidate(primary_source_url="https://jobs.example.org/find/video-editor")
        candidate["evidence"][0]["source_url"] = "https://jobs.example.org/find/video-editor"
        candidate["evidence"][0].pop("job_detail_identity")
        self.assertEqual(qualify(candidate)["reason"], "JOB_DETAIL_URL_REQUIRED")

    def test_job_detail_validation_does_not_depend_on_platform_or_numeric_id(self):
        candidate = potential_candidate(primary_source_url="https://jobs.example.org/offers/video-editor")
        item = candidate["evidence"][0]
        item["source_url"] = "https://jobs.example.org/offers/video-editor"
        item["source_type"] = "job_board_job_detail"
        item["job_detail_identity"]["canonical_url"] = item["source_url"]
        self.assertTrue(qualify(candidate)["accepted"])

    def test_job_detail_canonical_url_must_match_referrer_source(self):
        candidate = potential_candidate(primary_source_url="https://jobs.example.org/search/video-editor")
        candidate["evidence"][0]["source_url"] = "https://jobs.example.org/search/video-editor"
        self.assertEqual(qualify(candidate)["reason"], "JOB_DETAIL_URL_REQUIRED")

    def test_non_job_referrer_cannot_replace_actual_job_offer(self):
        candidate = potential_candidate(primary_source_url="https://beispiel-handel.de")
        candidate["evidence"].append({
            "source_url": "https://beispiel-handel.de",
            "source_type": "company_homepage",
            "observed_at": "2026-08-11",
            "published_at": "2026-08-01",
            "signal_category": "RECURRING_CONTENT_NEED",
            "factual_summary": "The company publishes recurring content.",
            "current_state": "active",
        })
        self.assertEqual(qualify(candidate)["reason"], "JOB_DETAIL_URL_REQUIRED")

    def test_internship_role_is_rejected(self):
        candidate = potential_candidate()
        candidate["evidence"][0]["job_title"] = "Praktikum Social Media Video"
        candidate["evidence"][0]["job_detail_identity"]["job_title"] = "Praktikum Social Media Video"
        self.assertEqual(qualify(candidate)["reason"], "LOW_COMPENSATION_ROLE")

    def test_budget_requires_an_evidence_source(self):
        candidate = potential_candidate(budget="45.000–55.000 EUR/Jahr")
        self.assertEqual(qualify(candidate)["reason"], "INVALID_BUDGET")

    def test_sourced_budget_is_accepted(self):
        candidate = potential_candidate(
            budget="45.000–55.000 EUR/Jahr",
            budget_source_url="https://beispiel-handel.de/jobs/content",
        )
        result = qualify(candidate)
        self.assertTrue(result["accepted"])
        self.assertEqual(result["budget"], "45.000–55.000 EUR/Jahr | Vollzeit")

    def test_sourced_estimated_budget_is_labeled_and_accepted(self):
        candidate = potential_candidate(
            budget="40.000–52.000 EUR/Jahr",
            budget_type="ESTIMATED",
            offer_type="Teilzeit",
            budget_estimation_basis="Job-specific estimate for this title and location",
            budget_source_url="https://beispiel-handel.de/jobs/content",
        )
        result = qualify(candidate)
        self.assertTrue(result["accepted"])
        self.assertEqual(result["budget"], "Geschätzt: 40.000–52.000 EUR/Jahr | Teilzeit")

    def test_estimated_budget_requires_documented_basis(self):
        candidate = potential_candidate(
            budget="40.000–52.000 EUR/Jahr",
            budget_type="ESTIMATED",
            offer_type="Vollzeit",
            budget_source_url="https://beispiel-handel.de/jobs/content",
        )
        self.assertEqual(qualify(candidate)["reason"], "INVALID_BUDGET")

    def test_budget_requires_offer_type(self):
        candidate = potential_candidate(
            budget="45.000–55.000 EUR/Jahr",
            budget_source_url="https://beispiel-handel.de/jobs/content",
        )
        candidate.pop("offer_type")
        self.assertEqual(qualify(candidate)["reason"], "INVALID_BUDGET")

    def test_budget_display_labels_cannot_be_supplied_manually(self):
        candidate = potential_candidate(
            budget="Geschätzt: 45.000–55.000 EUR/Jahr | Vollzeit",
            budget_type="ESTIMATED",
            offer_type="Vollzeit",
            budget_estimation_basis="Matched title, geography, and employment type",
            budget_source_url="https://beispiel-handel.de/jobs/content",
        )
        self.assertEqual(qualify(candidate)["reason"], "INVALID_BUDGET")

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
