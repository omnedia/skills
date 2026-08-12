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

For every job-derived signal, record the exact published `job_title`. Reject the candidate when all qualifying job signals are Werkstudent/working-student positions, internships/Praktika, minijobs, apprenticeships/Ausbildung, student-assistant positions, volunteer roles, or equivalent explicitly student/training work. Do not treat ordinary junior or trainee titles as low-compensation roles without an explicit excluded engagement type.

## POTENTIAL_CUSTOMERS

Require a canonical German company site, at least one fresh primary signal, evidence of a plausible video-production or recurring-content service opportunity, no competitor or duplicate, and score at least 60.

Primary scores: `CONTENT_HIRING=40`, `ACTIVE_PAID_ADVERTISING=40`, `UPCOMING_GERMAN_EVENT=40`.

Opportunity scores: `EXPLICIT_VIDEO_OPPORTUNITY=25`, `BUDGET_PROXY=20`, `RECURRING_CONTENT_NEED=15`.

Reject agencies or production competitors, companies outside Germany, companies without a current trigger, and micro-businesses lacking an objective budget proxy. Do not use perceived content quality, a weak social feed, or a general impression of budget as evidence.

## Budget

For every otherwise-qualifying candidate, attempt budget enrichment. Search the qualifying job-detail page and its linked official ATS page for an explicit salary range, hourly/day rate, project fee, or stated project budget. Record `budget_enrichment.attempted = true` and one to six checked job or ATS URLs. When found, record a concise normalized value in `budget`, including currency and period or scope, for example `45.000–55.000 EUR/Jahr` or `500–700 EUR/Tag`, and put the exact evidence URL in `budget_source_url`.

The published amount remains optional, but the enrichment attempt is mandatory. Leave `budget` empty when the checked sources publish no monetary range and record `budget_enrichment.unavailable_reason` as `NOT_PUBLISHED`, `ACCESS_BLOCKED`, or `INVALID_PUBLISHED_VALUE`. Never derive a precise budget from company size, a generic salary portal, marketing spend, or the qualification score. If a useful estimate is explicitly requested later, label it as an estimate outside the CSV unless the user asks for estimated values in the field.

## Contact and privacy

Perform contact enrichment for every otherwise-qualifying company; do not treat it as optional cleanup. Search the canonical official domain in this order, stopping at six distinct official pages:

1. `Kontakt`/contact page, including visible text and `mailto:`/`tel:` links;
2. `Impressum`/legal notice;
3. homepage footer and header;
4. about/team page and official careers or job-contact page;
5. relevant location, branch, service, support, or booking page;
6. an official-domain result discovered with focused searches such as `site:example.de kontakt`, `site:example.de impressum`, `site:example.de mailto`, the company name plus `Telefon`, or the company name plus `E-Mail`.

Inspect rendered text, link targets, and first-party structured contact data such as `Organization` or `ContactPoint` JSON-LD. Search snippets are discovery aids only: open the official page before recording a contact. Mechanically normalize an explicitly published obfuscation such as `info [at] example [dot] de` only when the intended address is unambiguous and preserve the exact source URL. Never guess an address from a naming pattern.

Actively seek both a published business email and a main business phone number. Finding one does not end the search for the other. Prefer a relevant role-based business contact, then a general company email or switchboard, then a published hiring/contact route. Accept named work contacts only when the company itself publishes them for the relevant business purpose; never collect personal/private contact details.

Record each checked page and the exact first-party source for every collected field. If email or phone is unavailable after the search, record one of `NOT_PUBLISHED`, `ACCESS_BLOCKED`, or `INVALID_PUBLISHED_VALUE` for that field. A candidate must have at least one valid email or phone to qualify for export. Reject a candidate with neither as `CONTACT_NOT_FOUND`, retain it only in the audit artifact subject to retention policy, and discover a replacement. Contact availability does not add score; it is a separate export gate.

Do not collect private details, use data-broker contact records, or infer addresses from patterns. Store provenance for correction/removal. Apply the operator-configured retention period to rejected candidates.
