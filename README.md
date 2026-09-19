<div align="center">

# Agent Skills

### Practical, reusable skills for AI agents

Give your agent focused workflows, domain knowledge, and reliable tools without rewriting the same instructions every time.

[![Skills](https://img.shields.io/badge/skills-2-7c3aed?style=flat-square)](#skill-library)
[![Categories](https://img.shields.io/badge/categories-2-2563eb?style=flat-square)](#skill-library)
[![Contributions welcome](https://img.shields.io/badge/contributions-welcome-16a34a?style=flat-square)](#contributing)
[![License: MIT](https://img.shields.io/badge/license-MIT-f59e0b?style=flat-square)](LICENSE)

[Browse skills](#skill-library) · [Install a skill](#quick-start) · [Contribute](#contributing)

</div>

---

## What is a skill?

A skill is a self-contained package that teaches an AI agent how to perform a specific task. It can combine detailed instructions with scripts, reference material, configuration, tests, and reusable assets.

Each skill starts with a `SKILL.md` file that tells an agent:

- when to use the skill;
- which workflow to follow;
- what inputs and tools it needs;
- what a successful result looks like.

> [!TIP]
> Think of a skill as an installable playbook: focused enough for one job, complete enough to reuse.

## Quick start

Installing a skill can be as simple as sharing its URL with an agent that supports skills.

### 1. Choose a skill

Open a skill from the [library below](#skill-library) and copy the URL from your browser.

### 2. Ask your agent to install it

```text
Install this skill: https://github.com/omnedia/skills/tree/master/crm/research-qualified-leads
```

### 3. Use it

Describe your task normally, or mention the skill by name:

```text
Use the research-qualified-leads skill to find 20 qualified leads.
```

> [!IMPORTANT]
> Install the complete skill directory, not only `SKILL.md`. Supporting scripts, references, configuration, or assets may be required for the skill to work.

## Skill library

### CRM

| Skill | What it does |
| :--- | :--- |
| **[Research Qualified Leads](https://github.com/omnedia/skills/tree/master/crm/research-qualified-leads)** | Researches, qualifies, contact-enriches, deduplicates, and exports evidence-backed sales leads. |

### Video

| Skill | What it does |
| :--- | :--- |
| **[Omnedia Captions](https://github.com/omnedia/skills/tree/master/video/captions)** | Creates animated, transparent caption overlays in editable Remotion projects from timed transcripts or text with matching audio. Requires the Remotion plugin in Codex. |

<p align="center"><em>More skills and categories are on the way.</em></p>

## Manual installation

Agent support and accepted URL formats can differ. If direct installation does not work, clone the repository:

```bash
git clone https://github.com/omnedia/skills.git
```

Then copy the complete directory of the skill you want into your agent's local skills folder. Restart or reload the agent if it does not discover the new skill automatically.

Some skills require extra inputs, tools, credentials, or dependencies. Check the skill's `SKILL.md` for its exact requirements.

## Repository layout

```text
skills/
|-- <category>/
|   `-- <skill-name>/
|       |-- SKILL.md        # Instructions and metadata
|       |-- scripts/        # Optional executable helpers
|       |-- references/     # Optional supporting documentation
|       |-- assets/         # Optional templates and resources
|       `-- tests/          # Optional automated tests
`-- README.md
```

Every skill is self-contained, so its directory can be installed independently.

## Contributing

New skills and improvements are welcome. A good contribution should:

- live in an appropriate category;
- use a clear, kebab-case directory name;
- include a `SKILL.md` with `name` and `description` YAML frontmatter;
- document prerequisites, inputs, outputs, and safety constraints;
- keep required scripts, references, and assets inside the skill directory;
- include tests for deterministic scripts where practical;
- add the new skill to the library in this README.

## A note on trust

Skills can instruct agents to execute commands, access services, or modify files. Review third-party instructions and scripts before installing them, and only run code you trust.

## License

Distributed under the [MIT License](LICENSE). You are free to use, modify, and distribute these skills in accordance with its terms.

---

<div align="center">

**Build better agents, one skill at a time.**

</div>
