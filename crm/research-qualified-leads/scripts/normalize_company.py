from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

from lead_core import ContractError, validate_http_url

try:
    import tldextract
except ImportError:  # pragma: no cover - CLI gives an actionable dependency error
    tldextract = None


DOMAIN_EXTRACTOR = tldextract.TLDExtract(suffix_list_urls=(), cache_dir=None) if tldextract else None


LEGAL_SUFFIXES = {
    "ag", "e k", "ek", "gbr", "gmbh", "gmbh co kg", "kg", "kgaa", "ohg",
    "se", "ug", "mbh", "gesellschaft mit beschrankter haftung", "aktiengesellschaft",
}


def registrable_domain(url: str) -> str:
    if tldextract is None:
        raise RuntimeError("Install dependencies with: python -m pip install -r requirements.txt")
    normalized = validate_http_url(url)
    host = normalized.split("//", 1)[1].split("/", 1)[0].split(":", 1)[0]
    result = DOMAIN_EXTRACTOR(host)
    if not result.domain or not result.suffix:
        raise ContractError(f"URL has no registrable public domain: {url!r}")
    return f"{result.domain}.{result.suffix}".lower()


def normalize_name(name: str) -> str:
    value = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode().lower()
    value = re.sub(r"[^a-z0-9]+", " ", value).strip()
    changed = True
    while changed:
        changed = False
        for suffix in sorted(LEGAL_SUFFIXES, key=len, reverse=True):
            if value == suffix or value.endswith(" " + suffix):
                value = value[: -len(suffix)].strip()
                changed = True
                break
    return re.sub(r"\s+", " ", value)


def compare(existing: dict, candidate: dict) -> dict:
    def safe_domain(value: str) -> str:
        try:
            return registrable_domain(value) if value else ""
        except (ContractError, RuntimeError, ValueError):
            return ""

    existing_domain = safe_domain(existing.get("website_url", ""))
    candidate_domain = safe_domain(candidate.get("website_url", ""))
    existing_name = normalize_name(existing.get("name", ""))
    candidate_name = normalize_name(candidate.get("name", ""))
    if existing_domain and candidate_domain and existing_domain == candidate_domain:
        return {"duplicate": True, "reason": "DOMAIN_MATCH", "matched_key": existing_domain}
    location_match = (
        existing.get("country", "").upper() == candidate.get("country", "").upper()
        and existing.get("city", "").casefold().strip() == candidate.get("city", "").casefold().strip()
        and bool(existing.get("city"))
    )
    if existing_name and existing_name == candidate_name:
        if existing_domain and candidate_domain and existing_domain != candidate_domain:
            return {"duplicate": False, "reason": "DEDUPE_REVIEW_REQUIRED", "matched_key": existing_name}
        return {"duplicate": location_match, "reason": "NAME_LOCATION_MATCH" if location_match else "NAME_REVIEW", "matched_key": existing_name}
    return {"duplicate": False, "reason": None, "matched_key": None}


def main() -> int:
    parser = argparse.ArgumentParser(description="Normalize or compare company identity keys.")
    parser.add_argument("--url")
    parser.add_argument("--name")
    parser.add_argument("--compare-json", help="JSON containing existing and candidate objects")
    parser.add_argument("--compare-file", help="Path to JSON containing existing and candidate objects")
    args = parser.parse_args()
    try:
        if args.compare_json or args.compare_file:
            payload = json.loads(Path(args.compare_file).read_text(encoding="utf-8")) if args.compare_file else json.loads(args.compare_json)
            result = compare(payload["existing"], payload["candidate"])
        else:
            result = {
                "registrable_domain": registrable_domain(args.url) if args.url else "",
                "normalized_name": normalize_name(args.name or ""),
            }
    except (ValueError, RuntimeError, ContractError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
