from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))


def potential_candidate(**overrides):
    candidate = {
        "name": "Beispiel Handel AG",
        "website_url": "https://beispiel-handel.de",
        "country": "DE",
        "city": "Berlin",
        "mode": "POTENTIAL_CUSTOMERS",
        "evidence": [
            {
                "source_url": "https://beispiel-handel.de/jobs/content",
                "source_type": "company_job_detail",
                "page_kind": "job_detail",
                "job_detail_verified": True,
                "job_detail_identity": {
                    "single_vacancy": True,
                    "employer": "Beispiel Handel AG",
                    "job_title": "Video Content Producer",
                    "canonical_url": "https://beispiel-handel.de/jobs/content",
                },
                "observed_at": "2026-08-11",
                "published_at": "2026-08-01",
                "signal_category": "CONTENT_HIRING",
                "job_title": "Video Content Producer",
                "factual_summary": "Das Unternehmen sucht Unterstützung für laufende Social-Video-Produktion.",
                "current_state": "open",
            },
            {
                "source_url": "https://beispiel-handel.de/jobs/content",
                "source_type": "company_career_page",
                "observed_at": "2026-08-11",
                "published_at": "2026-08-01",
                "signal_category": "EXPLICIT_VIDEO_OPPORTUNITY",
                "factual_summary": "Die Rolle erstellt ausdrücklich Reels und Videoanzeigen.",
                "current_state": "open",
            },
        ],
        "primary_source_url": "https://beispiel-handel.de/jobs/content",
        "budget_enrichment": {
            "attempted": True,
            "pages_checked": ["https://beispiel-handel.de/jobs/content"],
            "unavailable_reason": "NOT_PUBLISHED",
        },
        "phone": "+49 30 123456",
        "email": "kontakt@beispiel-handel.de",
        "contact_enrichment": {
            "attempted": True,
            "pages_checked": [
                "https://beispiel-handel.de/kontakt",
                "https://beispiel-handel.de/impressum",
            ],
            "email_source_url": "https://beispiel-handel.de/kontakt",
            "phone_source_url": "https://beispiel-handel.de/impressum",
            "unavailable_reasons": {},
        },
        "score_components": [
            {"reason": "CONTENT_HIRING", "points": 999},
            {"reason": "EXPLICIT_VIDEO_OPPORTUNITY", "points": 0},
        ],
        "ai_notes": (
            "Fakt: Das Unternehmen sucht seit August 2026 für eine laufende Rolle, die ausdrücklich Reels, "
            "Social Videos und Videoanzeigen erstellt. Ansatz: Ein externer Produktionspartner kann ein "
            "planbares System oder zusätzliche Kapazität für die regelmäßig anfallenden Videoformate anbieten."
        ),
    }
    candidate.update(overrides)
    if "name" in overrides and "evidence" not in overrides:
        candidate["evidence"][0]["job_detail_identity"]["employer"] = str(candidate["name"])
    if candidate.get("budget"):
        candidate.setdefault("budget_type", "PUBLISHED")
        candidate.setdefault("offer_type", "Vollzeit")
    if candidate.get("budget") and candidate.get("budget_source_url") and "budget_enrichment" not in overrides:
        candidate["budget_enrichment"] = {
            "attempted": True,
            "pages_checked": [candidate["budget_source_url"]],
        }
    return candidate
