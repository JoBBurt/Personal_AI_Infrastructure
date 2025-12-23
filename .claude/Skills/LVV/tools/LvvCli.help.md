# LvvCli.ts - PAI-Native TypeScript Wrapper

TypeScript wrapper for the LVV Intelligence Platform CLI with PAI integrations.

## Features

- **JSON Output** - All commands return structured JSON for programmatic access
- **History Integration** - Batch results automatically saved to `~/.claude/History/Execution/`
- **Observability** - Workflow notifications sent to PAI dashboard
- **Direct SQLite** - Fast queries bypass CLI for JSON output

## Installation

Requires Bun runtime (PAI default):

```bash
# Already installed if using PAI
bun --version
```

## Usage

```bash
# From anywhere
bun run ~/.claude/Skills/LVV/tools/LvvCli.ts <command> [options]

# Or make executable
chmod +x ~/.claude/Skills/LVV/tools/LvvCli.ts
~/.claude/Skills/LVV/tools/LvvCli.ts <command>
```

## Commands

### stats

Get database statistics as JSON.

```bash
bun run LvvCli.ts stats
```

Output:
```json
{
  "entities": {
    "company": 198,
    "investor": 315,
    "organization": 3,
    "total": 516
  },
  "evaluations": {
    "by_tier": {
      "Accept": 6,
      "Pass": 115
    },
    "total": 121
  },
  "conferences": 1,
  "pending_matches": 0
}
```

### query

Query entities with filters. Returns JSON array.

```bash
# All Accept tier companies
bun run LvvCli.ts query --tier "Accept"

# JPM 2025 companies, limit 10
bun run LvvCli.ts query --conference "JPM 2025" --type company --limit 10

# Unevaluated entities
bun run LvvCli.ts query --unevaluated --limit 20
```

Options:
| Option | Description |
|--------|-------------|
| `--conference <name>` | Filter by conference source |
| `--type <type>` | `company`, `investor`, `organization` |
| `--tier <tier>` | `Accept`, `Maybe`, `Pass`, `Tier 1-4` |
| `--limit <n>` | Maximum results |
| `--unevaluated` | Only entities without evaluations |

Output:
```json
[
  {
    "id": 123,
    "name": "NeuroNascent, Inc.",
    "entity_type": "company",
    "overall_score": 7.0,
    "tier": "Accept",
    "days_since_evaluation": 5
  }
]
```

### screen

Run batch evaluation with automatic History save.

```bash
# Prescreen JPM 2025 companies
bun run LvvCli.ts screen --conference "JPM 2025" --eval-type prescreen

# Full evaluation of investors
bun run LvvCli.ts screen --conference "JPM 2025" --eval-type full_evaluation --entity-type investor

# Skip History save
bun run LvvCli.ts screen --conference "JPM 2025" --eval-type prescreen --no-history
```

Options:
| Option | Description |
|--------|-------------|
| `--conference <name>` | Conference name (required) |
| `--eval-type <type>` | `prescreen` or `full_evaluation` |
| `--entity-type <type>` | `company` or `investor` |
| `--no-history` | Don't save to History system |

**History Integration:**

After each batch, results are saved to:
```
~/.claude/History/Execution/YYYY-MM/JPM2025_prescreen_YYYY-MM-DD.md
```

This enables future queries like "What did we screen last month?"

### history

List recent History entries.

```bash
# Last 10 entries
bun run LvvCli.ts history

# Last 5 entries
bun run LvvCli.ts history 5
```

Output:
```
Recent LVV History Entries:

  2025-01  JPM2025_prescreen_2025-01-10.md
  2025-01  JPM2025_full_evaluation_2025-01-08.md
  2024-12  ARDD2024_prescreen_2024-12-15.md
```

## Programmatic Usage

Import in other TypeScript/Bun scripts:

```typescript
import { $ } from "bun";

// Get stats as JSON
const stats = await $`bun run ~/.claude/Skills/LVV/tools/LvvCli.ts stats`.json();
console.log(`Total entities: ${stats.entities.total}`);

// Query Accept tier
const accepts = await $`bun run ~/.claude/Skills/LVV/tools/LvvCli.ts query --tier Accept`.json();
for (const company of accepts) {
  console.log(`${company.name}: ${company.overall_score}`);
}
```

## Integration with PAI Agents

Other PAI agents can use this wrapper:

```typescript
// In an agent or skill
const result = await $`bun run ~/.claude/Skills/LVV/tools/LvvCli.ts screen \
  --conference "JPM 2025" \
  --eval-type prescreen`.json();

console.log(`Screened ${result.entities_screened} entities`);
console.log(`Accept tier: ${result.results.accept.length}`);
```

## History File Format

Batch results are saved as Markdown for readability:

```markdown
# Batch Screening Results

**Conference:** JPM 2025
**Date:** 2025-01-10
**Type:** prescreen

## Summary

| Metric | Value |
|--------|-------|
| Entities screened | 23 |
| From cache | 7 (30%) |
| Estimated cost | $0.0112 |

## Results by Tier

### Accept (6)

| Company | Score | Website |
|---------|-------|---------|
| NeuroNascent | 7.0 | neuronascent.com |
...
```

## Error Handling

The wrapper provides clear error messages:

```bash
$ bun run LvvCli.ts screen
Error: --conference is required

$ bun run LvvCli.ts query --conference "NonExistent"
[]  # Empty array, no error
```

## Comparison with Python CLI

| Feature | Python `lvv` | TypeScript `LvvCli.ts` |
|---------|--------------|------------------------|
| JSON output | Limited | Full |
| History save | No | Automatic |
| Observability | No | Integrated |
| Programmatic use | Subprocess | Native Bun |
| PAI integration | Manual | Built-in |

Use the Python CLI for interactive work, TypeScript wrapper for automation and agent integration.
