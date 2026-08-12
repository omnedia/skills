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
      "source_type": "company_career_page",
      "observed_at": "2026-08-11",
      "published_at": "2026-08-01",
      "signal_category": "CONTENT_HIRING",
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

Optional booleans `excluded_competitor` and `excluded_candidate` force rejection. The deterministic qualifier derives the score, scope, status, and normalized domain; it does not trust supplied values for those fields.

`contact_enrichment` is mandatory for export. `pages_checked` must contain one to three official-domain URLs. Supply `email_source_url` and `phone_source_url` when the corresponding value exists. For each missing field, put `email` or `phone` in `unavailable_reasons` with `NOT_PUBLISHED`, `ACCESS_BLOCKED`, or `INVALID_PUBLISHED_VALUE`.
