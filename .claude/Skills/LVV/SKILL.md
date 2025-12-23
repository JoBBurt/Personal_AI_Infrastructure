---
name: LVV
description: Lifespan Vision Ventures Intelligence Platform for conference entity screening, evaluation, and matching. USE WHEN user mentions conference prep, entity screening, JPM/ARDD/VITAL conferences, investor/company evaluation, meeting prioritization, deal flow management, or LVV portfolio.
---

# LVV Intelligence Platform

AI-powered conference preparation and entity screening system for biotech/longevity venture capital.

**Architecture:** CLI-first with natural language orchestration via Claude Code.

---

## Workflow Routing

**When executing a workflow, do BOTH of these:**

1. **Call the notification script** (for observability tracking):
   ```bash
   ~/.claude/Tools/SkillWorkflowNotification WORKFLOWNAME LVV
   ```

2. **Output the text notification** (for user visibility):
   ```
   Running the **WorkflowName** workflow from the **LVV** skill...
   ```

| Workflow | Trigger | File |
|----------|---------|------|
| **ConferencePrep** | "prep for JPM", "prepare for conference", "get ready for ARDD" | `workflows/ConferencePrep.md` |
| **EntityScreening** | "screen [entity]", "evaluate [company]", "check [investor]" | `workflows/EntityScreening.md` |
| **BatchProcessing** | "screen all", "batch evaluate", "process all entities" | `workflows/BatchProcessing.md` |
| **Deduplication** | "find duplicates", "merge entities", "check for matches" | `workflows/Deduplication.md` |
| **ExportReporting** | "export results", "generate Excel", "create report" | `workflows/ExportReporting.md` |

---

## Examples

**Example 1: Conference Preparation**
```
User: "Help me prep for JPM 2025"
→ Invokes ConferencePrep workflow
→ Checks conference status, estimates costs
→ Runs batch prescreens, presents top priorities
→ Offers full evaluations of Accept tier
```

**Example 2: Single Entity Screening**
```
User: "Evaluate Rejuvenation Bio"
→ Invokes EntityScreening workflow
→ Finds entity, checks cache status
→ Runs prescreen or full evaluation
→ Displays 8-dimension score breakdown
```

**Example 3: Duplicate Detection**
```
User: "Check for duplicates in the database"
→ Invokes Deduplication workflow
→ Auto-merges ≥85% confidence matches
→ Asks user about 70-84% ambiguous matches
→ Reports entities merged/separated
```

**Example 4: Export for Meeting Prep**
```
User: "Export JPM 2025 Accept tier to Excel"
→ Invokes ExportReporting workflow
→ Filters to Accept tier companies
→ Generates color-coded Excel with scores
→ Provides file path for download
```

---

## Quick CLI Reference

```bash
# Conference Management
lvv conference list                    # List all conferences
lvv conference ingest <file>           # Import conference data

# Entity Operations
lvv entity search <query>              # Find entities
lvv entity get <id>                    # Show entity details

# Screening
lvv screen prescreen <id>              # Quick screen ($0.0007)
lvv screen full <id>                   # Deep evaluation (~$0.30)
lvv screen batch --conference "JPM"    # Batch evaluate

# Matching
lvv match find <entity>                # Find potential matches
lvv match review --interactive         # Review pending matches

# Export
lvv query top --tier "Tier 1"          # Top-scored entities
lvv query export --format xlsx         # Export to Excel

# Stats
lvv stats                              # Database statistics
```

---

## Scoring Quick Reference

**Companies (8 dimensions, weighted average):**
- Quality of Science, Level of Evidence, **Geroscience Fit (2x)**, PoC, Team, Terms, Platform, MOAT
- **Tiers:** Accept (≥4.25), Maybe (3.75-4.25), Pass (<3.75)

**Investors (5 dimensions, simple average):**
- Stage Alignment, Therapeutic Focus, Geographic Fit, Strategic Value, Activity Level
- **Tiers:** Tier 1 (≥7.0), Tier 2 (≥5.0), Tier 3 (≥3.0), Tier 4 (<3.0)

→ Full scoring criteria: `ScoringDimensions.md`

---

## Cost Transparency

**ALWAYS estimate costs before batch operations:**

| Operation | Cost | Speed |
|-----------|------|-------|
| Prescreen | $0.0007/entity | ~0.67s/entity |
| Full Eval | ~$0.30/entity | ~2s/entity |
| Cached | Free | Instant |
| Web Search | ~$0.01/search | Auto for Tier 1-2 |

Cache freshness: 30 days (free reuse), recommend re-eval after 180 days.

---

## Reference Documentation

| Document | Contents |
|----------|----------|
| `ScoringDimensions.md` | Full 8+5 dimension criteria, tier thresholds |
| `PortfolioCompanies.md` | 24 LVV portfolio companies for co-investor detection |
| `InvestmentThesis.md` | Stage, valuation, geographic, therapeutic preferences |
| `DatabaseSchema.md` | SQLite schema, SQL examples, normalization rules |

---

## TypeScript Wrapper (PAI Integration)

For programmatic access with History integration:

```bash
# JSON stats
bun run ~/.claude/Skills/LVV/tools/LvvCli.ts stats

# Query with filters
bun run ~/.claude/Skills/LVV/tools/LvvCli.ts query --tier "Accept" --limit 10

# Batch screen with auto History save
bun run ~/.claude/Skills/LVV/tools/LvvCli.ts screen --conference "JPM 2025" --eval-type prescreen

# View History entries
bun run ~/.claude/Skills/LVV/tools/LvvCli.ts history
```

**Features:**
- JSON output for all commands
- Auto-saves batch results to `~/.claude/History/Execution/YYYY-MM/`
- Observability notifications
- Direct SQLite queries (faster than CLI)

→ Full documentation: `tools/LvvCli.help.md`

---

## Database & Configuration

- **Database:** `~/.lvv/intelligence.db`
- **Output:** `~/.lvv/output/`
- **History:** `~/.claude/History/Execution/` (batch results)
- **API Keys:** macOS Keychain (service: `LVV-Screening-Pipeline`)

---

## Error Quick Reference

| Error | Fix |
|-------|-----|
| Database not found | Check `~/.lvv/` exists |
| API key missing | Add to Keychain: `security add-generic-password -s "LVV-Screening-Pipeline" -a "anthropic-api-key" -w "sk-ant-..."` |
| Entity not found | `lvv entity search "name"` or `lvv conference ingest` |
| Rate limit | Auto-handled, waits 30s |

---

## When NOT to Use This Skill

- General business questions → Use standard Claude
- Non-biotech/longevity conferences → Confirm with user first
- CRM operations → Not yet implemented
- Email generation → Not yet implemented

---

**Last Updated:** 2025-12-22
**Status:** Production Ready (Canonicalized)
