<div align="center">

# Research Qualified Leads

### Evidence-backed lead research for Twenty CRM

Research, qualify, contact-enrich, deduplicate, and export sales leads without inventing contact data or weakening quality standards to fill a quota.

[![Category: CRM](https://img.shields.io/badge/category-CRM-2563eb?style=flat-square)](../../README.md#skill-library)
[![Countries: DE AT CH](https://img.shields.io/badge/countries-DE%20%7C%20AT%20%7C%20CH-7c3aed?style=flat-square)](#research-modes)
[![Tests: unittest](https://img.shields.io/badge/tests-unittest-16a34a?style=flat-square)](#development)
[![License: MIT](https://img.shields.io/badge/license-MIT-f59e0b?style=flat-square)](../../LICENSE)

[Install](#install) · [How it works](#how-it-works) · [Requirements](#requirements) · [Development](#development)

</div>

---

## Why this skill?

Lead lists are easy to generate and hard to trust. This skill favors a smaller set of verifiable companies over a larger list built from weak signals. Every accepted lead is supported by current public evidence, checked for duplicates, and prepared for a safe Twenty CRM import.

It helps an AI agent:

- find companies with concrete, current buying signals;
- verify the canonical website and target geography;
- search official sources for published business emails and phone numbers;
- score candidates with deterministic rules;
- deduplicate against the current batch and an optional Twenty export;
- produce a validated `qualified-leads.csv` plus an audit summary.

> [!IMPORTANT]
> The skill never fabricates contact details, evidence, dates, budget, or intent. Missing contact information does not reduce a qualified lead's score when the required search was completed.

## Install

Give this directory URL to an AI agent that supports installable skills:

```text
Install this skill: https://github.com/omnedia/skills/tree/master/crm/research-qualified-leads
```

Then ask the agent to use it:

```text
Use the research-qualified-leads skill to find 20 qualified VIDEO_EDITING leads in Germany, Austria, or Switzerland.
```

Install the complete directory. The workflow depends on the bundled scripts, configuration, references, and assets in addition to `SKILL.md`.

## Research modes

| Mode | Geography | Best for |
| :--- | :--- | :--- |
| `VIDEO_EDITING` | Germany, Austria, Switzerland | Companies showing current, recurring demand for video editing. |
| `POTENTIAL_CUSTOMERS` | Germany | Companies with a current commercial signal and a concrete video-production or recurring-content opportunity. |

The default minimum score is **60** in both modes. Contact availability does not contribute to the score.

## What to provide

The agent needs:

- a research mode: `VIDEO_EDITING` or `POTENTIAL_CUSTOMERS`;
- the number of leads you want;
- optionally, a custom minimum score;
- optionally, a Twenty `company.csv` export for schema matching and CRM deduplication.

Address fields, including `Address / Country`, are optional in the supplied CRM export. Geography is still verified for each researched candidate even when the input-derived CSV schema does not contain address columns.

If no `company.csv` is supplied, the skill still creates the final CSV using its bundled compatibility schema. The run summary will clearly note that CRM deduplication was not performed.

## How it works

```text
Research public evidence
        |
        v
Verify company + signal
        |
        v
Enrich from official contact pages
        |
        v
Score and qualify deterministically
        |
        v
Deduplicate candidates
        |
        v
Validate and export for Twenty CRM
```

Every research run gets an isolated directory containing its audit trail and final artifacts:

```text
lead-research-runs/<run>/
|-- run-manifest.json
|-- schema.json              # When company.csv is supplied
|-- candidates.json
|-- evidence/
|-- qualified-leads.csv
`-- run-summary.json
```

## Example prompts

```text
Use the research-qualified-leads skill in VIDEO_EDITING mode. Find 15 qualified companies in Germany, Austria, or Switzerland with a minimum score of 65.
```

```text
Find 25 POTENTIAL_CUSTOMERS in Germany and deduplicate them against the attached Twenty company.csv.
```

```text
Apply this company.csv to my existing lead research run and update its deduplicated output in place.
```

## Requirements

- Python 3
- Internet research or browser/search tools available to the agent
- Optional: a Twenty CRM `company.csv` export

Install the deterministic runtime dependencies from this directory:

```bash
python -m pip install -r requirements.txt
```

## Safety and quality

The skill is designed to keep research auditable and conservative:

- only public evidence and validated `http` or `https` URLs are accepted;
- authentication, CAPTCHAs, robots restrictions, and access controls are not bypassed;
- contact details must be published business details from first-party pages;
- stale or unverifiable signals are rejected;
- unknown values remain empty;
- CSV output is checked for encoding, schema consistency, row counts, and duplicate domains.

Production-verified delivery has additional configuration gates. It is only enabled when explicitly requested and must never be claimed without a real Twenty import smoke test.

## Included files

| Path | Purpose |
| :--- | :--- |
| [`SKILL.md`](SKILL.md) | Complete agent workflow and operating rules. |
| [`skill.yaml`](skill.yaml) | Authoritative skill version and canonical repository location. |
| [`scripts/`](scripts/) | Deterministic parsing, qualification, deduplication, and export tools. |
| [`references/`](references/) | Research policy and candidate data contract. |
| [`config/`](config/) | Source policy and Twenty export configuration. |
| [`assets/`](assets/) | Twenty-compatible company CSV template. |
| [`tests/`](tests/) | Automated security, qualification, deduplication, and CSV contract tests. |

## Versioning

The current version and canonical repository location are stored only in [`skill.yaml`](skill.yaml). This skill is versioned independently using Semantic Versioning; its canonical source is [Omnedia skills](https://github.com/omnedia/skills).

When repository or network access is available, the agent compares the installed version against the corresponding canonical `skill.yaml` on `master`, at most once per conversation/session unless asked to check again. If a newer version exists, it shows the installed and latest versions and offers update instructions or help. Updates are never installed automatically: modifying the installed skill requires explicit user approval. If the check cannot be completed, the skill continues normally and does not claim to be current.

### Version bump rules

- **PATCH** — fixes, clarifications, prompt refinements, and other backward-compatible corrections.
- **MINOR** — new capabilities or backward-compatible functionality.
- **MAJOR** — breaking changes to behavior, interfaces, workflows, inputs, outputs, or compatibility.

Whenever a skill change warrants a release, update its `skill.yaml` version in the same change. Do not duplicate the current version in documentation; read it from `skill.yaml`. Bump only this skill, not unrelated skills. For example: `1.0.0 -> 1.0.1` for a fix, `1.0.0 -> 1.1.0` for a new capability, or `1.0.0 -> 2.0.0` for a breaking change.

## Development

Run the test suite before changing qualification, deduplication, or export behavior:

```bash
python -m unittest discover -s tests -v
```

Use `--help` on any script to inspect its complete command-line interface.

## License

Distributed under the repository's [MIT License](../../LICENSE).

---

<div align="center">

**Fewer guesses. Better leads. Verifiable results.**

[Back to the skill library](../../README.md#skill-library)

</div>
