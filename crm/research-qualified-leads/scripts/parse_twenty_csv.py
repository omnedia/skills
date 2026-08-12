from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict
from pathlib import Path

from lead_core import ContractError, parse_csv


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate and describe a Twenty company CSV export.")
    parser.add_argument("input_csv")
    parser.add_argument("--json-output")
    args = parser.parse_args()
    try:
        contract, rows = parse_csv(args.input_csv)
    except (OSError, ContractError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    result = asdict(contract) | {"row_count": len(rows)}
    encoded = json.dumps(result, ensure_ascii=False, indent=2)
    if args.json_output:
        Path(args.json_output).write_text(encoded + "\n", encoding="utf-8")
    print(encoded)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
