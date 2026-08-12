from __future__ import annotations

import argparse
import json
import sys

try:
    import phonenumbers
except ImportError:  # pragma: no cover
    phonenumbers = None


COUNTRY_CALLING_CODES = {"DE": "+49", "AT": "+43", "CH": "+41"}


def parse_phone(value: str, expected_country: str) -> dict[str, str]:
    if phonenumbers is None:
        raise RuntimeError("Install dependencies with: python -m pip install -r requirements.txt")
    country = expected_country.upper()
    if country not in COUNTRY_CALLING_CODES:
        raise ValueError(f"Unsupported country: {expected_country}")
    try:
        number = phonenumbers.parse(value, country)
    except phonenumbers.NumberParseException as exc:
        raise ValueError("Phone cannot be parsed") from exc
    actual_country = phonenumbers.region_code_for_number(number)
    if not phonenumbers.is_valid_number(number) or actual_country != country:
        raise ValueError("Phone is invalid or does not match the company country")
    national = str(number.national_number)
    return {
        "number": national,
        "country_code": country,
        "calling_code": COUNTRY_CALLING_CODES[country],
        "e164": phonenumbers.format_number(number, phonenumbers.PhoneNumberFormat.E164),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Parse a published DE/AT/CH business phone.")
    parser.add_argument("phone")
    parser.add_argument("--country", required=True, choices=sorted(COUNTRY_CALLING_CODES))
    args = parser.parse_args()
    try:
        result = parse_phone(args.phone, args.country)
    except (ValueError, RuntimeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
