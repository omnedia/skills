from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import tempfile
from collections import Counter
from pathlib import Path
from typing import Any

import yaml

from lead_core import AI_NOTES_MARKDOWN, ContractError, LIST_COLUMNS, output_headers, parse_csv, sanitize_free_text
from normalize_company import compare, registrable_domain
from parse_phone import parse_phone
from qualify_lead import MODES, qualify


EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_DIR = SCRIPT_DIR.parent


def load_config() -> dict[str, Any]:
    return yaml.safe_load((SKILL_DIR / "config" / "twenty.yaml").read_text(encoding="utf-8"))


def existing_identity(row: dict[str, str]) -> dict[str, str]:
    return {
        "name": row.get("Name", ""),
        "website_url": row.get("Domain Name / Link URL", ""),
        "country": row.get("Address / Country", ""),
        "city": row.get("Address / City", ""),
    }


def blocknote_text(value: str) -> str:
    try:
        payload = json.loads(value)
    except (TypeError, json.JSONDecodeError):
        return ""
    text_parts: list[str] = []

    def collect(node: Any) -> None:
        if isinstance(node, dict):
            text = node.get("text")
            if isinstance(text, str):
                text_parts.append(text)
            for child in node.values():
                collect(child)
        elif isinstance(node, list):
            for child in node:
                collect(child)

    collect(payload)
    return "\n".join(part.strip() for part in text_parts if part.strip())


def existing_output_row(row: dict[str, str], headers: list[str]) -> dict[str, str]:
    output = {header: row.get(header, "") for header in headers}
    if not output.get(AI_NOTES_MARKDOWN, "").strip():
        output[AI_NOTES_MARKDOWN] = row.get("AI Notes", "").strip() or blocknote_text(row.get("AI Notes / BlockNote", ""))
    return output


def map_candidate(candidate: dict[str, Any], headers: list[str], contract_empty_list: str, config: dict[str, Any]) -> tuple[dict[str, str], int, list[str]]:
    row = {header: (contract_empty_list if header in LIST_COLUMNS else "") for header in headers}
    sanitized_count = 0
    warnings: list[str] = []

    def free(field: str, value: Any, maximum: int = 500) -> None:
        nonlocal sanitized_count
        if field not in row:
            return
        row[field], changed = sanitize_free_text(value, maximum)
        sanitized_count += int(changed)

    free("Name", candidate["name"])
    free("Address / City", candidate.get("city", ""))
    free(AI_NOTES_MARKDOWN, candidate["ai_notes"], int(config["field_max_lengths"]["ai_notes"]))
    row["Scope"] = candidate["scope"]
    row["Domain Name / Link URL"] = candidate["website_url"]
    row["Referrer / Link URL"] = candidate["primary_source_url"]
    row["Status"] = "OFFEN"
    row["Address / Country"] = candidate["country"]
    email = str(candidate.get("email", "")).strip()
    if email:
        if not EMAIL_RE.fullmatch(email):
            warnings.append("INVALID_CONTACT_DATA")
        else:
            row["Mail / Primary Email"] = email
    phone = str(candidate.get("phone", "")).strip()
    if phone:
        try:
            parsed_phone = parse_phone(phone, candidate["country"])
        except (ValueError, RuntimeError):
            warnings.append("INVALID_CONTACT_DATA")
        else:
            row["Phone / Primary Phone Number"] = parsed_phone["number"]
            if "Phone / Primary Phone Country Code" in row:
                row["Phone / Primary Phone Country Code"] = parsed_phone["country_code"]
            if "Phone / Primary Phone Calling Code" in row:
                row["Phone / Primary Phone Calling Code"] = parsed_phone["calling_code"]
    twenty = config["twenty"]
    system_mapping = {
        "Id": twenty["id"],
        "Creation date": twenty["creation_date"],
        "Created by / Source": twenty["created_by_source"],
        "Created by / Workspace Member": twenty["created_by_workspace_member"],
        "Created by / Name": twenty["created_by_name"],
        "Created by / Context": twenty["created_by_context"],
    }
    for field, value in system_mapping.items():
        if field in row:
            row[field] = str(value or "")
    return row, sanitized_count, sorted(set(warnings))


def write_csv(path: Path, headers: list[str], rows: list[dict[str, str]], contract, config: dict[str, Any]) -> None:
    output_parent = path.resolve().parent
    if not output_parent.exists() or not os.access(output_parent, os.W_OK):
        raise ContractError(f"Output directory is not writable: {output_parent}")
    encoding = "utf-8-sig" if contract.has_bom and config["csv"]["preserve_bom"] else "utf-8"
    temp_name = None
    try:
        with tempfile.NamedTemporaryFile("w", encoding=encoding, newline="", dir=output_parent, delete=False) as handle:
            temp_name = handle.name
            writer = csv.DictWriter(
                handle,
                fieldnames=headers,
                delimiter=contract.delimiter,
                quotechar=contract.quotechar,
                lineterminator=contract.lineterminator,
                quoting=csv.QUOTE_MINIMAL,
                extrasaction="raise",
            )
            writer.writeheader()
            writer.writerows(rows)
        os.replace(temp_name, path)
    finally:
        if temp_name and Path(temp_name).exists():
            Path(temp_name).unlink()


def export(
    input_csv: str | None,
    candidates: list[dict[str, Any]],
    output_csv: str,
    mode: str,
    requested_count: int,
    minimum_score: int | None = None,
    include_existing: bool = False,
    production: bool = False,
) -> dict[str, Any]:
    config = load_config()
    if production and not config["import_smoke_test"]["verified"]:
        raise ContractError("Twenty import smoke test is not verified; production export is blocked")
    retention = config["operator"].get("rejected_candidate_retention_days")
    if production and (not str(config["operator"].get("approved_purpose", "")).strip() or not isinstance(retention, int) or retention < 0):
        raise ContractError("Production export requires an approved purpose and non-negative rejected-candidate retention period")
    if input_csv:
        contract, existing_rows = parse_csv(input_csv)
        schema_source = "company_csv"
        deduplication_performed = True
    else:
        contract, _ = parse_csv(SKILL_DIR / "assets" / "twenty-company-template.csv")
        existing_rows = []
        schema_source = "bundled_compatibility_schema"
        deduplication_performed = False
    if include_existing and not input_csv:
        raise ContractError("--include-existing requires --company-csv")
    headers = output_headers(contract.headers)
    accepted_rows: list[dict[str, str]] = []
    accepted_identities: list[dict[str, str]] = []
    rejected: Counter[str] = Counter()
    warnings: Counter[str] = Counter()
    if not deduplication_performed:
        warnings["NEEDS_DEDUP_TEST"] = 1
    rejection_details: list[dict[str, str]] = []
    sanitized = 0
    for raw_candidate in candidates:
        result = qualify(raw_candidate, mode, minimum_score)
        if not result.get("accepted"):
            reason = result.get("reason", "UNKNOWN")
            rejected[reason] += 1
            rejection_details.append({"name": str(raw_candidate.get("name", "")), "reason": reason, "matched_key": ""})
            continue
        identity = {
            "name": result["name"], "website_url": result["website_url"],
            "country": result["country"], "city": result.get("city", ""),
        }
        duplicate_reason = None
        matched_key = ""
        for existing in map(existing_identity, existing_rows):
            match = compare(existing, identity)
            if match["duplicate"] or match["reason"] == "DEDUPE_REVIEW_REQUIRED":
                duplicate_reason = "CRM_DUPLICATE" if match["duplicate"] else "DEDUPE_REVIEW_REQUIRED"
                matched_key = str(match.get("matched_key") or "")
                break
        if duplicate_reason is None:
            for accepted in accepted_identities:
                match = compare(accepted, identity)
                if match["duplicate"] or match["reason"] == "DEDUPE_REVIEW_REQUIRED":
                    duplicate_reason = "BATCH_DUPLICATE" if match["duplicate"] else "DEDUPE_REVIEW_REQUIRED"
                    matched_key = str(match.get("matched_key") or "")
                    break
        if duplicate_reason:
            rejected[duplicate_reason] += 1
            rejection_details.append({"name": str(result["name"]), "reason": duplicate_reason, "matched_key": matched_key})
            continue
        row, changed, contact_warnings = map_candidate(result, headers, contract.empty_list, config)
        warnings.update(contact_warnings)
        accepted_rows.append(row)
        accepted_identities.append(identity)
        sanitized += changed
    output_rows = []
    if include_existing:
        output_rows.extend(existing_output_row(row, headers) for row in existing_rows)
    output_rows.extend(accepted_rows)
    write_csv(Path(output_csv), headers, output_rows, contract, config)
    out_contract, reread_rows = parse_csv(output_csv)
    if out_contract.headers != headers or len(reread_rows) != len(output_rows):
        raise ContractError("Post-export validation failed: header or row count mismatch")
    domains = [registrable_domain(row["Domain Name / Link URL"]) for row in accepted_rows]
    if len(domains) != len(set(domains)):
        raise ContractError("Post-export validation failed: duplicate accepted domains")
    with_email = sum(bool(row.get("Mail / Primary Email")) for row in accepted_rows)
    with_phone = sum(bool(row.get("Phone / Primary Phone Number")) for row in accepted_rows)
    with_both = sum(bool(row.get("Mail / Primary Email")) and bool(row.get("Phone / Primary Phone Number")) for row in accepted_rows)
    return {
        "mode": mode,
        "minimum_score": minimum_score,
        "requested": requested_count,
        "discovered": len(candidates),
        "accepted": len(accepted_rows),
        "exported": len(accepted_rows),
        "output_rows": len(output_rows),
        "sanitized": sanitized,
        "rejected": dict(sorted(rejected.items())),
        "rejection_details": rejection_details,
        "warnings": dict(sorted(warnings.items())),
        "shortfall": max(0, requested_count - len(accepted_rows)),
        "production": production,
        "schema_source": schema_source,
        "crm_deduplication_performed": deduplication_performed,
        "needs_dedup_test": not deduplication_performed,
        "contact_enrichment": {
            "exported_with_email": with_email,
            "exported_with_phone": with_phone,
            "exported_with_both": with_both,
            "exported_with_neither": len(accepted_rows) - (with_email + with_phone - with_both),
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Qualify, deduplicate, and export Twenty company records.")
    parser.add_argument("candidates_json")
    parser.add_argument("output_csv")
    parser.add_argument("--company-csv", help="Optional Twenty company.csv used for schema discovery and CRM deduplication")
    parser.add_argument("--mode", required=True, choices=sorted(MODES))
    parser.add_argument("--requested-count", required=True, type=int)
    parser.add_argument("--minimum-score", type=int)
    parser.add_argument("--summary-output")
    parser.add_argument("--include-existing", action="store_true", help="Round-trip existing rows before appending leads")
    parser.add_argument("--production", action="store_true", help="Require verified Twenty import smoke-test configuration")
    args = parser.parse_args()
    try:
        payload = json.loads(Path(args.candidates_json).read_text(encoding="utf-8"))
        candidates = payload if isinstance(payload, list) else [payload]
        summary = export(
            args.company_csv, candidates, args.output_csv, args.mode, args.requested_count,
            args.minimum_score, args.include_existing, args.production,
        )
    except (OSError, ValueError, json.JSONDecodeError, ContractError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    encoded = json.dumps(summary, ensure_ascii=False, indent=2)
    if args.summary_output:
        Path(args.summary_output).write_text(encoded + "\n", encoding="utf-8")
    print(encoded)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
