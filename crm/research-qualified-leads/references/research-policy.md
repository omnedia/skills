# Research policy

## Evidence

Record `source_url`, `source_type`, mandatory ISO `observed_at`, nullable `published_at`, `signal_category`, and a source-supported `factual_summary`. Prefer first-party evidence. A search snippet is discovery evidence only unless its underlying page is unavailable and it contains a clear date and complete factual signal; mark such an exception low-confidence and never use it alone for a subjective claim.

Put the strongest qualifying source in `Referrer / Link URL`. Retain all sources required to prove combined claims in the run artifact.

## Freshness

- Job vacancy: open now, or published/updated within 45 calendar days and not closed.
- Paid advertising: directly observed active during the run.
- Trade fair/event: scheduled from the observation date through the next 180 days.
- Marketing/content activity: published within 90 calendar days.

Without a publication date, require another current-state indicator such as an open application action, active-ad state, or future event date.

## VIDEO_EDITING

Require an identifiable non-excluded company, canonical site, `DE`/`AT`/`CH`, fresh recurring editing demand, no duplicate, and score at least 60.

Scores: `DIRECT_EDITING_VACANCY=60`, `EDITING_DUTY_IN_BROADER_ROLE=35`, `OUTSOURCING_COMPATIBLE=15`, `HIGH_FREQUENCY_OUTPUT=10`.

Reject anonymous employers, recruiters hiding the employer, freelancers offering their own services, unrelated marketing roles, closed/stale listings, and unverifiable companies.

## POTENTIAL_CUSTOMERS

Require a canonical German company site, at least one fresh primary signal, evidence of a plausible video-production or recurring-content service opportunity, no competitor or duplicate, and score at least 60.

Primary scores: `CONTENT_HIRING=40`, `ACTIVE_PAID_ADVERTISING=40`, `UPCOMING_GERMAN_EVENT=40`.

Opportunity scores: `EXPLICIT_VIDEO_OPPORTUNITY=25`, `BUDGET_PROXY=20`, `RECURRING_CONTENT_NEED=15`.

Reject agencies or production competitors, companies outside Germany, companies without a current trigger, and micro-businesses lacking an objective budget proxy. Do not use perceived content quality, a weak social feed, or a general impression of budget as evidence.

## Contact and privacy

Perform contact enrichment for every otherwise-qualifying company; do not treat it as optional cleanup. On the canonical official domain, check in this order:

1. `Kontakt`/contact page and visible `mailto:`/`tel:` links;
2. `Impressum`/legal notice;
3. site footer, about page, or official careers contact.

Actively seek both a published business email and a main business phone number. Finding one does not end the search for the other. Prefer a relevant published business contact, then a general company email or switchboard, then a published hiring/contact route.

Record each checked page and the exact first-party source for every collected field. If email or phone is unavailable after the search, record one of `NOT_PUBLISHED`, `ACCESS_BLOCKED`, or `INVALID_PUBLISHED_VALUE` for that field. A completed search with no result does not reduce qualification score.

Do not collect private details, use data-broker contact records, or infer addresses from patterns. Store provenance for correction/removal. Apply the operator-configured retention period to rejected candidates.
