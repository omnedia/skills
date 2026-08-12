from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date, timedelta
from pathlib import Path
from typing import Any

from lead_core import ContractError, validate_http_url
from normalize_company import registrable_domain
from parse_phone import parse_phone


MODES = {
    "VIDEO_EDITING": {
        "countries": {"DE", "AT", "CH"},
        "scope": "VIDEOSCHNITT",
        "threshold": 60,
        "components": {
            "DIRECT_EDITING_VACANCY": 60,
            "EDITING_DUTY_IN_BROADER_ROLE": 35,
            "OUTSOURCING_COMPATIBLE": 15,
            "HIGH_FREQUENCY_OUTPUT": 10,
        },
        "primary": {"DIRECT_EDITING_VACANCY", "EDITING_DUTY_IN_BROADER_ROLE"},
    },
    "POTENTIAL_CUSTOMERS": {
        "countries": {"DE"},
        "scope": "SCALE/SIGNATURE",
        "threshold": 60,
        "components": {
            "CONTENT_HIRING": 40,
            "ACTIVE_PAID_ADVERTISING": 40,
            "UPCOMING_GERMAN_EVENT": 40,
            "EXPLICIT_VIDEO_OPPORTUNITY": 25,
            "BUDGET_PROXY": 20,
            "RECURRING_CONTENT_NEED": 15,
        },
        "primary": {"CONTENT_HIRING", "ACTIVE_PAID_ADVERTISING", "UPCOMING_GERMAN_EVENT"},
    },
}

CONTACT_UNAVAILABLE_REASONS = {"NOT_PUBLISHED", "ACCESS_BLOCKED", "INVALID_PUBLISHED_VALUE"}
BUDGET_UNAVAILABLE_REASONS = {"NOT_PUBLISHED", "ACCESS_BLOCKED", "INVALID_PUBLISHED_VALUE"}
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
JOB_SIGNAL_CATEGORIES = {"DIRECT_EDITING_VACANCY", "EDITING_DUTY_IN_BROADER_ROLE", "CONTENT_HIRING"}
LOW_COMPENSATION_ROLE_RE = re.compile(
    r"\b(?:werk(?:s)?stu(?:dent|ndent)(?:in|en)?|working[ -]?student|studentische[ -]+hilfskraft|"
    r"praktik(?:um|ant(?:in|en)?)|intern(?:ship)?|mini[ -]?job|geringf(?:ü|ue)gig|"
    r"ausbildung|auszubildend(?:e|er|en)?|azubi|duales[ -]+studium|ehrenamt|volunteer)\b",
    flags=re.IGNORECASE,
)


def iso_date(value: Any, field: str) -> date:
    try:
        return date.fromisoformat(str(value))
    except (TypeError, ValueError) as exc:
        raise ContractError(f"{field} must use ISO YYYY-MM-DD") from exc


def evidence_is_fresh(item: dict[str, Any]) -> bool:
    observed = iso_date(item.get("observed_at"), "observed_at")
    published = iso_date(item["published_at"], "published_at") if item.get("published_at") else None
    category = item.get("signal_category", "")
    state = str(item.get("current_state", "")).lower()
    if category in {"DIRECT_EDITING_VACANCY", "EDITING_DUTY_IN_BROADER_ROLE", "CONTENT_HIRING"}:
        return state in {"open", "accepting applications"} or (published is not None and timedelta(0) <= observed - published <= timedelta(days=45) and state != "closed")
    if category == "ACTIVE_PAID_ADVERTISING":
        return state == "active"
    if category == "UPCOMING_GERMAN_EVENT":
        event_date = iso_date(item.get("event_date"), "event_date")
        return observed <= event_date <= observed + timedelta(days=180)
    if category in {"EXPLICIT_VIDEO_OPPORTUNITY", "BUDGET_PROXY", "RECURRING_CONTENT_NEED", "OUTSOURCING_COMPATIBLE", "HIGH_FREQUENCY_OUTPUT"}:
        return (published is not None and timedelta(0) <= observed - published <= timedelta(days=90)) or state in {"open", "active", "upcoming"}
    return False


def reject(reason: str, details: str = "") -> dict[str, Any]:
    return {"accepted": False, "reason": reason, "details": details}


def validate_contact_enrichment(candidate: dict[str, Any], company_domain: str, country: str) -> str | None:
    enrichment = candidate.get("contact_enrichment")
    if not isinstance(enrichment, dict) or enrichment.get("attempted") is not True:
        return "A first-party contact-enrichment attempt is required"
    pages = enrichment.get("pages_checked")
    if not isinstance(pages, list) or not 1 <= len(pages) <= 6 or len(pages) != len(set(pages)):
        return "pages_checked must contain one to six unique official URLs"
    normalized_pages: set[str] = set()
    for page in pages:
        try:
            normalized = validate_http_url(page)
            if registrable_domain(normalized) != company_domain:
                return "Contact pages must belong to the canonical company domain"
            normalized_pages.add(normalized)
        except (ContractError, RuntimeError, ValueError):
            return "Contact pages must be valid official http(s) URLs"
    unavailable = enrichment.get("unavailable_reasons", {})
    if not isinstance(unavailable, dict):
        return "unavailable_reasons must be an object"
    for field in ("email", "phone"):
        value = str(candidate.get(field, "")).strip()
        source_key = f"{field}_source_url"
        if value:
            try:
                source = validate_http_url(enrichment.get(source_key, ""))
            except ContractError:
                return f"{source_key} is required for a collected {field}"
            if source not in normalized_pages:
                return f"{source_key} must be one of pages_checked"
        elif unavailable.get(field) not in CONTACT_UNAVAILABLE_REASONS:
            return f"Missing {field} requires a controlled unavailable reason"
    email = str(candidate.get("email", "")).strip()
    phone = str(candidate.get("phone", "")).strip()
    valid_email = bool(email and EMAIL_RE.fullmatch(email))
    valid_phone = False
    if phone:
        try:
            parse_phone(phone, country)
            valid_phone = True
        except (ValueError, RuntimeError):
            pass
    if not valid_email and not valid_phone:
        return "No valid published business email or phone number was found"
    return None


def validate_budget_enrichment(candidate: dict[str, Any], evidence_urls: set[str]) -> tuple[str, str] | None:
    enrichment = candidate.get("budget_enrichment")
    if not isinstance(enrichment, dict) or enrichment.get("attempted") is not True:
        return "BUDGET_ENRICHMENT_INCOMPLETE", "A budget-enrichment attempt is required"
    pages = enrichment.get("pages_checked")
    if not isinstance(pages, list) or not 1 <= len(pages) <= 6 or len(pages) != len(set(pages)):
        return "BUDGET_ENRICHMENT_INCOMPLETE", "pages_checked must contain one to six unique job or ATS URLs"
    normalized_pages: set[str] = set()
    for page in pages:
        try:
            normalized_pages.add(validate_http_url(page))
        except ContractError:
            return "BUDGET_ENRICHMENT_INCOMPLETE", "Budget pages must be valid http(s) URLs"
    budget = str(candidate.get("budget", "")).strip()
    if budget:
        try:
            source = validate_http_url(candidate.get("budget_source_url", ""))
        except ContractError as exc:
            return "INVALID_BUDGET", str(exc)
        if source not in evidence_urls:
            return "INVALID_BUDGET", "budget_source_url is not present in evidence"
        if source not in normalized_pages:
            return "BUDGET_ENRICHMENT_INCOMPLETE", "budget_source_url must be one of budget_enrichment.pages_checked"
        if enrichment.get("unavailable_reason"):
            return "BUDGET_ENRICHMENT_INCOMPLETE", "Published budget must not have an unavailable_reason"
    else:
        if enrichment.get("unavailable_reason") not in BUDGET_UNAVAILABLE_REASONS:
            return "BUDGET_ENRICHMENT_INCOMPLETE", "Missing budget requires a controlled unavailable_reason"
    return None


def qualify(candidate: dict[str, Any], mode: str | None = None, minimum_score: int | None = None) -> dict[str, Any]:
    selected_mode = mode or candidate.get("mode")
    if selected_mode not in MODES:
        return reject("UNSUPPORTED_MODE")
    rules = MODES[selected_mode]
    country = str(candidate.get("country", "")).upper()
    if country not in rules["countries"]:
        return reject("GEOGRAPHY_MISMATCH")
    if candidate.get("excluded_competitor"):
        return reject("EXCLUDED_COMPETITOR")
    if candidate.get("excluded_candidate"):
        return reject("EXCLUDED_CANDIDATE")
    if not str(candidate.get("name", "")).strip():
        return reject("SOURCE_UNVERIFIABLE", "Missing identifiable company name")
    try:
        website = validate_http_url(candidate.get("website_url", ""))
        domain = registrable_domain(website)
    except (ContractError, RuntimeError, ValueError) as exc:
        return reject("SOURCE_UNVERIFIABLE", str(exc))
    evidence = candidate.get("evidence")
    if not isinstance(evidence, list) or not evidence:
        return reject("SOURCE_UNVERIFIABLE", "No evidence items")
    fresh_categories: set[str] = set()
    fresh_items: list[dict[str, Any]] = []
    for item in evidence:
        try:
            validate_http_url(item.get("source_url", ""))
            if not str(item.get("factual_summary", "")).strip():
                raise ContractError("Evidence lacks factual_summary")
            if evidence_is_fresh(item):
                fresh_categories.add(str(item.get("signal_category", "")))
                fresh_items.append(item)
        except (ContractError, ValueError):
            continue
    if not fresh_categories.intersection(rules["primary"]):
        return reject("STALE_SIGNAL" if fresh_categories else "SOURCE_UNVERIFIABLE")
    job_items = [item for item in fresh_items if item.get("signal_category") in JOB_SIGNAL_CATEGORIES]
    if job_items:
        titles = [str(item.get("job_title", "")).strip() for item in job_items]
        if any(not title for title in titles):
            return reject("SOURCE_UNVERIFIABLE", "Job-based evidence requires job_title")
        non_job_primary = set(rules["primary"]) - JOB_SIGNAL_CATEGORIES
        if all(LOW_COMPENSATION_ROLE_RE.search(title) for title in titles) and not fresh_categories.intersection(non_job_primary):
            return reject("LOW_COMPENSATION_ROLE", ", ".join(titles))
    supplied = candidate.get("score_components", [])
    reasons = [str(item.get("reason", "")) for item in supplied if isinstance(item, dict)]
    if len(reasons) != len(set(reasons)):
        return reject("INVALID_SCORE", "A score component may be awarded only once")
    invalid = [reason for reason in reasons if reason not in rules["components"]]
    unsupported = [reason for reason in reasons if reason not in fresh_categories]
    if invalid or unsupported:
        return reject("INVALID_SCORE", f"Invalid or unsupported components: {', '.join(invalid + unsupported)}")
    score_components = [{"reason": reason, "points": rules["components"][reason]} for reason in reasons]
    score = sum(item["points"] for item in score_components)
    threshold = rules["threshold"] if minimum_score is None else minimum_score
    if score < threshold:
        return reject("INSUFFICIENT_SCORE", f"{score} < {threshold}")
    primary_url = candidate.get("primary_source_url", "")
    try:
        primary_url = validate_http_url(primary_url)
    except ContractError as exc:
        return reject("SOURCE_UNVERIFIABLE", str(exc))
    valid_evidence_urls = set()
    for item in evidence:
        try:
            valid_evidence_urls.add(validate_http_url(item.get("source_url", "")))
        except ContractError:
            continue
    if primary_url not in valid_evidence_urls:
        return reject("SOURCE_UNVERIFIABLE", "Primary source is not present in evidence")
    budget_error = validate_budget_enrichment(candidate, valid_evidence_urls)
    if budget_error:
        return reject(*budget_error)
    contact_error = validate_contact_enrichment(candidate, domain, country)
    if contact_error:
        reason = "CONTACT_NOT_FOUND" if contact_error.startswith("No valid published") else "CONTACT_ENRICHMENT_INCOMPLETE"
        return reject(reason, contact_error)
    notes = str(candidate.get("ai_notes", "")).strip()
    if not notes or "Fakt:" not in notes or "Ansatz:" not in notes:
        return reject("INVALID_NOTES", "AI Notes must separate Fakt and Ansatz")
    word_count = len(re.findall(r"\b[\wÀ-ÿ]+\b", notes, flags=re.UNICODE))
    if not 30 <= word_count <= 70:
        return reject("INVALID_NOTES", f"AI Notes must contain 30–70 words; got {word_count}")
    result = dict(candidate)
    result.update({
        "accepted": True,
        "mode": selected_mode,
        "scope": rules["scope"],
        "status": "OFFEN",
        "country": country,
        "website_url": website,
        "registrable_domain": domain,
        "primary_source_url": primary_url,
        "score_components": score_components,
        "score": score,
    })
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description="Deterministically qualify a recorded lead candidate.")
    parser.add_argument("candidate_json")
    parser.add_argument("--mode", choices=sorted(MODES))
    parser.add_argument("--minimum-score", type=int)
    parser.add_argument("--output")
    args = parser.parse_args()
    try:
        payload = json.loads(Path(args.candidate_json).read_text(encoding="utf-8"))
        result = qualify(payload, args.mode, args.minimum_score)
    except (OSError, json.JSONDecodeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    encoded = json.dumps(result, ensure_ascii=False, indent=2)
    if args.output:
        Path(args.output).write_text(encoded + "\n", encoding="utf-8")
    print(encoded)
    return 0 if result.get("accepted") else 3


if __name__ == "__main__":
    raise SystemExit(main())
