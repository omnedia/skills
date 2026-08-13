# Candidate JSON contract

Supply either one object or a JSON array of objects:

```json
{
  "name": "Example GmbH",
  "website_url": "https://beispiel-handel.de",
  "country": "DE",
  "city": "Düsseldorf",
  "mode": "POTENTIAL_CUSTOMERS",
  "evidence": [
    {
      "source_url": "https://beispiel-handel.de/careers/content",
      "source_type": "company_job_detail",
      "page_kind": "job_detail",
      "job_detail_verified": true,
      "job_detail_identity": {
        "single_vacancy": true,
        "employer": "Example GmbH",
        "job_title": "Video Content Producer (m/w/d)",
        "canonical_url": "https://beispiel-handel.de/careers/content"
      },
      "observed_at": "2026-08-11",
      "published_at": "2026-08-01",
      "signal_category": "CONTENT_HIRING",
      "job_title": "Video Content Producer (m/w/d)",
      "factual_summary": "The company is hiring for recurring social content production.",
      "current_state": "open"
    },
    {
      "source_url": "https://beispiel-handel.de/careers/content",
      "source_type": "company_career_page",
      "observed_at": "2026-08-11",
      "published_at": "2026-08-01",
      "signal_category": "EXPLICIT_VIDEO_OPPORTUNITY",
      "factual_summary": "The role explicitly produces reels, social videos, and video advertisements.",
      "current_state": "open"
    }
  ],
  "primary_source_url": "https://beispiel-handel.de/careers/content",
  "budget": "45.000–55.000 EUR/Jahr",
  "budget_type": "ESTIMATED",
  "budget_estimation_basis": "Estimate for Video Content Producer in Düsseldorf, full-time",
  "offer_type": "Vollzeit",
  "budget_source_url": "https://beispiel-handel.de/careers/content",
  "budget_enrichment": {
    "attempted": true,
    "pages_checked": [
      "https://beispiel-handel.de/careers/content"
    ]
  },
  "phone": "+49 211 87574712",
  "email": "info@beispiel-handel.de",
  "contact_enrichment": {
    "attempted": true,
    "pages_checked": [
      "https://beispiel-handel.de/kontakt",
      "https://beispiel-handel.de/impressum"
    ],
    "email_source_url": "https://beispiel-handel.de/kontakt",
    "phone_source_url": "https://beispiel-handel.de/impressum",
    "unavailable_reasons": {}
  },
  "score_components": [
    {"reason": "CONTENT_HIRING", "points": 40},
    {"reason": "EXPLICIT_VIDEO_OPPORTUNITY", "points": 25}
  ],
  "ai_notes": "Fakt: Das Unternehmen sucht seit August 2026 für eine laufende Rolle, die ausdrücklich Reels, Social Videos und Videoanzeigen erstellt. Ansatz: Ein externer Produktionspartner kann ein planbares System oder zusätzliche Kapazität für die regelmäßig anfallenden Videoformate anbieten."
}
```

Optional booleans `excluded_competitor` and `excluded_candidate` force rejection. The deterministic qualifier derives the score, scope, status, and normalized domain; it does not trust supplied values for those fields. Every job-derived evidence item must include its exact published `job_title`, use an individual vacancy URL, set `source_type` to `company_job_detail`, `ats_job_detail`, or `job_board_job_detail`, set `page_kind` to `job_detail`, and set `job_detail_verified` to `true` only after the page has been opened and checked. It must also record `job_detail_identity` proving one vacancy plus the matching employer, title, and canonical URL. Its URL must be `primary_source_url`, which becomes `Referrer / Link URL`. This platform-independent gate rejects search results, keyword/category pages, jobs landing pages, and snippets as `JOB_DETAIL_URL_REQUIRED`. Low-compensation student/training roles are rejected as `LOW_COMPENSATION_ROLE`.

`budget_enrichment` is mandatory for export. Set `attempted = true` and record one to six checked job-detail, ATS, job-board estimate, or matched salary/rate benchmark URLs in `pages_checked`. When a supported amount is found, provide the monetary value in `budget`, its `budget_source_url`, `budget_type` as `PUBLISHED` or `ESTIMATED`, and `offer_type`. The source must occur in both evidence and `budget_enrichment.pages_checked`. An estimate additionally requires `budget_estimation_basis`. The qualifier adds `Geschätzt:` for estimates and appends ` | offer_type` to every populated exported Budget value. When neither a published nor sufficiently matched estimated amount is available, leave `budget` empty and set `unavailable_reason` to `NOT_PUBLISHED`, `ACCESS_BLOCKED`, or `INVALID_PUBLISHED_VALUE`. The exporter always creates the `Budget` column.

`contact_enrichment` is mandatory for export. `pages_checked` must contain one to six official-domain URLs. Supply `email_source_url` and `phone_source_url` when the corresponding value exists. For each missing field, put `email` or `phone` in `unavailable_reasons` with `NOT_PUBLISHED`, `ACCESS_BLOCKED`, or `INVALID_PUBLISHED_VALUE`. At least one of `email` or `phone` must be present and valid; a candidate with neither is rejected as `CONTACT_NOT_FOUND` and must be replaced during research.
