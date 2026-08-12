from __future__ import annotations

import csv
import io
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from urllib.parse import urlsplit, urlunsplit


REQUIRED_COLUMNS = (
    "Name",
    "Scope",
    "Domain Name / Link URL",
    "Status",
    "Address / Country",
    "Phone / Primary Phone Number",
    "Mail / Primary Email",
)
LIST_COLUMNS = {
    "Domain Name / Secondary Links",
    "Referrer / Secondary Links",
    "Phone / Additional Phones",
    "Mail / Additional Emails",
}
CONTROL_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
FORMULA_RE = re.compile(r"^\s*[=+\-@]")
AI_NOTES_MARKDOWN = "AI Notes / Markdown"
AI_NOTES_ALIASES = {"AI Notes / BlockNote", "AI Notes"}


class ContractError(ValueError):
    pass


@dataclass(frozen=True)
class CsvContract:
    headers: list[str]
    delimiter: str
    quotechar: str
    lineterminator: str
    has_bom: bool
    empty_list: str


def read_utf8(path: str | Path) -> tuple[str, bool]:
    raw = Path(path).read_bytes()
    has_bom = raw.startswith(b"\xef\xbb\xbf")
    try:
        return raw.decode("utf-8-sig"), has_bom
    except UnicodeDecodeError as exc:
        raise ContractError(f"Input is not valid UTF-8: {exc}") from exc


def detect_line_ending(text: str) -> str:
    crlf = text.count("\r\n")
    lf = text.count("\n") - crlf
    cr = text.count("\r") - crlf
    counts = {"\r\n": crlf, "\n": lf, "\r": cr}
    best = max(counts, key=counts.get)
    return best if counts[best] else "\r\n"


def detect_dialect(text: str) -> csv.Dialect:
    sample = text[:65536]
    matching_delimiters = []
    for delimiter in ",;\t|":
        try:
            header = next(csv.reader(io.StringIO(text), delimiter=delimiter))
        except (csv.Error, StopIteration):
            continue
        if all(required in header for required in REQUIRED_COLUMNS):
            matching_delimiters.append(delimiter)
    if len(matching_delimiters) > 1:
        raise ContractError("CSV dialect is ambiguous: multiple delimiters match the required header")
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters="".join(matching_delimiters) or ",;\t|")
    except csv.Error as exc:
        if len(matching_delimiters) == 1:
            dialect = type("DetectedDialect", (csv.excel,), {"delimiter": matching_delimiters[0]})()
        else:
            raise ContractError("CSV dialect is ambiguous or cannot be detected") from exc
    first_record = next(csv.reader(io.StringIO(text), dialect), [])
    if len(first_record) < 2:
        raise ContractError("CSV dialect is ambiguous: header has fewer than two fields")
    return dialect


def parse_csv(path: str | Path) -> tuple[CsvContract, list[dict[str, str]]]:
    text, has_bom = read_utf8(path)
    dialect = detect_dialect(text)
    reader = csv.DictReader(io.StringIO(text, newline=""), dialect=dialect)
    headers = list(reader.fieldnames or [])
    if any(strip_controls(value) != value for value in headers):
        raise ContractError("CSV headers contain disallowed control characters")
    duplicates = sorted({h for h in headers if headers.count(h) > 1})
    if duplicates:
        raise ContractError(f"Duplicate CSV headers: {', '.join(duplicates)}")
    missing = [h for h in REQUIRED_COLUMNS if h not in headers]
    if missing:
        raise ContractError(f"Missing required columns: {', '.join(missing)}")
    rows = []
    for line_number, row in enumerate(reader, start=2):
        if None in row or any(value is None for value in row.values()):
            raise ContractError(f"Malformed row {line_number}: field count differs from header")
        rows.append({h: strip_controls(row.get(h, "") or "") for h in headers})
    list_values = [row[h].strip() for row in rows for h in LIST_COLUMNS if h in row and row[h].strip() in {"[]", "{}"}]
    empty_list = list_values[0] if list_values else "[]"
    contract = CsvContract(
        headers=headers,
        delimiter=dialect.delimiter,
        quotechar=dialect.quotechar or '"',
        lineterminator=detect_line_ending(text),
        has_bom=has_bom,
        empty_list=empty_list,
    )
    return contract, rows


def validate_http_url(value: str) -> str:
    value = strip_controls(value).strip()
    if len(value) > 2048:
        raise ContractError("URL exceeds the 2048-character limit")
    parts = urlsplit(value)
    if parts.scheme.lower() not in {"http", "https"} or not parts.hostname:
        raise ContractError(f"Invalid http(s) URL: {value!r}")
    if parts.username or parts.password:
        raise ContractError("URLs containing credentials are not allowed")
    host = parts.hostname.encode("idna").decode("ascii").lower()
    try:
        port = parts.port
    except ValueError as exc:
        raise ContractError(f"Invalid URL port: {value!r}") from exc
    netloc = host if port is None else f"{host}:{port}"
    if (parts.scheme.lower(), port) in {("http", 80), ("https", 443)}:
        netloc = host
    return urlunsplit((parts.scheme.lower(), netloc, parts.path or "", parts.query, ""))


def strip_controls(value: object) -> str:
    return CONTROL_RE.sub("", "" if value is None else str(value))


def sanitize_free_text(value: object, maximum: int = 500) -> tuple[str, bool]:
    cleaned = strip_controls(value)[:maximum]
    if FORMULA_RE.match(cleaned):
        return "'" + cleaned, True
    return cleaned, False


def output_headers(headers: Iterable[str]) -> list[str]:
    source = list(headers)
    result = [header for header in source if header not in AI_NOTES_ALIASES]
    if AI_NOTES_MARKDOWN not in result:
        alias_positions = [index for index, header in enumerate(source) if header in AI_NOTES_ALIASES]
        insert_at = min(alias_positions[0], len(result)) if alias_positions else len(result)
        result.insert(insert_at, AI_NOTES_MARKDOWN)
    return result
