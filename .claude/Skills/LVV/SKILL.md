---
name: LVV
description: Lifespan Vision Ventures Intelligence Platform for conference entity screening, evaluation, and matching. USE WHEN user mentions conference prep, entity screening, JPM/ARDD/VITAL conferences, investor/company evaluation, meeting prioritization, or deal flow management.
---

# LVV Intelligence Platform Skill

**Lifespan Vision Ventures (LVV) Intelligence Platform**
AI-powered conference preparation and entity screening system for biotech/longevity venture capital.

## Overview

The LVV platform helps prepare for conferences (JPM, ARDD, VITAL, etc.) by:
- Importing conference attendee data (companies and investors)
- AI-powered screening and evaluation (8 dimensions for companies, 5 for investors)
- Entity matching and deduplication across conferences
- Intelligent meeting prioritization
- Automated export to Excel/JSON

**Architecture**: CLI-first with natural language orchestration via Claude Code

---

## Quick Reference

### Core CLI Commands

```bash
# Conference Management
lvv conference list                           # List all conferences
lvv conference ingest <file>                  # Import conference data

# Entity Operations
lvv entity search <query>                     # Find entities
lvv entity get <id>                          # Show entity details
lvv entity merge <id1> <id2>                 # Merge duplicates

# Screening & Evaluation
lvv screen prescreen <id>                    # Quick prescreen (Haiku, $0.0007)
lvv screen full <id>                         # Full evaluation (Opus, $0.30)
lvv screen batch --conference "JPM 2025"     # Batch evaluate

# Matching & Deduplication
lvv match find <entity>                      # Find potential matches
lvv match review --interactive               # Review pending matches

# Reporting & Export
lvv query top --tier "Tier 1"               # Top-scored entities
lvv query export --format xlsx              # Export to Excel

# Statistics
lvv stats                                    # Show database statistics
```

---

## Workflow Routing

### Conference Preparation

**When user says: "Help me prep for [CONFERENCE]" or "Prepare for JPM 2025"**

**STEPS:**
1. Check if conference exists: `lvv conference list | grep "CONFERENCE"`
2. If not exists, ask user for data files (partnering emails, investor lists)
3. Ingest data: `lvv conference ingest <file> --conference "NAME"`
4. Run batch prescreen: `lvv screen batch --conference "NAME" --type prescreen`
5. Show top priorities: `lvv query top --conference "NAME" --limit 20`
6. Ask if user wants full evaluation of high scorers or Excel export

**COST TRANSPARENCY:**
- Prescreen: ~$0.0007 per entity
- Full eval: ~$0.30 per entity
- ALWAYS estimate total cost before batch operations
- Example: "This will prescreen 150 companies (~$0.11 total). Proceed?"

**INTERACTIVE DECISIONS:**
- Ask which entity types to prioritize (companies vs investors)
- Confirm cost for large batches
- Offer to filter by prescreen score (e.g., only full-eval companies >4.0)

---

### Entity Screening

**When user says: "Screen [ENTITY]" or "Evaluate [COMPANY/INVESTOR]"**

**STEPS:**
1. Find entity: `lvv entity search "ENTITY NAME"`
2. Check if already evaluated: Look for recent evaluation in output
3. If evaluated <30 days ago: Ask "Last evaluated X days ago (score: Y, tier: Z). Re-evaluate?"
4. If user confirms or no recent eval:
   - For quick check: `lvv screen prescreen <id>`
   - For deep analysis: `lvv screen full <id>`
5. Display results with reasoning
6. Offer to export or evaluate related entities

**SCORING SYSTEMS:**

**Companies (8 dimensions, 1-10 scale):**
- Quality of Science
- Level of Evidence
- Geroscience Fit (weighted 2x per LVV thesis)
- Proof of Concept Indication
- Team
- Investment Terms
- Platform Potential
- Competitive MOAT

**Tiers:** Accept (≥4.25), Maybe (3.75-4.25), Pass (<3.75)

**Investors (5 dimensions, 1-10 scale):**
- Stage Alignment
- Therapeutic Focus
- Geographic Fit
- Strategic Value
- Activity Level

**Tiers:** Tier 1 (≥7.0), Tier 2 (≥5.0), Tier 3 (≥3.0), Tier 4 (<3.0)

---

### Batch Processing

**When user says: "Screen all companies" or "Evaluate all [CONFERENCE] attendees"**

**STEPS:**
1. Get entity count: `lvv stats` or `lvv query top --conference "NAME" --limit 999 | wc -l`
2. Estimate cost: entities × $0.0007 (prescreen) or $0.30 (full eval)
3. Present plan: "Found X entities. Estimated cost: $Y. Estimated time: Z minutes. Proceed?"
4. If approved: `lvv screen batch --conference "NAME" --type [prescreen|full_evaluation]`
5. Monitor progress (CLI shows: [15/100] Evaluated Entity X...)
6. Show summary: completed, from_cache, failed, total_cost
7. Offer next steps: "Top 10 companies scored >4.0. Want me to do full evaluations or export results?"

**FILTERS:**
- `--entity-type company` - Only companies
- `--entity-type investor` - Only investors
- `--tier "Tier 1"` - Only specific tiers
- `--filter "score>4.0"` - Only high scorers

**PERFORMANCE:**
- Caching: Evals <30 days old = instant (free)
- Fresh evals: ~0.67 seconds per entity
- Concurrent processing: 5 workers default
- Projected: 100 entities in ~67 seconds

---

### Entity Matching & Deduplication

**When user sees potential duplicates or says: "Find duplicates" or "Match entities"**

**MATCHING STRATEGIES:**
1. URL exact match → 100% confidence (auto-match)
2. Domain match → 95% confidence (auto-match)
3. Exact normalized name → 90% confidence (auto-match)
4. Fuzzy name (>85%) → 85% confidence (auto-match)
5. Fuzzy name (70-85%) → **ASK USER** (ambiguous)
6. Fuzzy name (<70%) → No match (create new entity)

**INTERACTIVE MATCHING (Exit Code 10):**

When CLI returns exit code 10, it means ambiguous match needs review.

**STEPS:**
1. CLI outputs JSON: `{"requires_review": true, "entity": {...}, "candidate": {...}, "confidence": 0.78}`
2. Present to user: "Found potential duplicate (78% confidence):
   - Entity 1: 'Acme Therapeutics Inc'
   - Entity 2: 'Acme Bio'
   Should I: [1] Merge (same company) [2] Keep separate [3] Show more details"
3. If merge: `lvv entity merge --entity-id ID1 --target-id ID2`
4. If separate: `lvv match reject --entity-id ID1 --candidate-id ID2`
5. Continue with remaining entities

**COMMANDS:**
```bash
lvv match find <entity-name>            # Find potential duplicates
lvv match review --interactive          # Review all pending matches
lvv entity merge <id1> <id2>           # Merge entities
```

---

### Export & Reporting

**When user says: "Export results" or "Generate Excel report"**

**STEPS:**
1. Ask for filters: "Export all entities or filter by conference/tier?"
2. Determine format: Excel (default) or JSON
3. Export: `lvv query export --conference "JPM 2025" --format xlsx --output results.xlsx`
4. Confirm: "✓ Exported 428 entities to results.xlsx (103.6 KB)"
5. Show file location: Full path to output file

**EXCEL FORMAT:**
- Multiple sheets: Summary, Companies, Investors, All Entities
- Tier-based color coding (Tier 1 = green, Accept = green, Pass = red)
- Sortable columns: Score, Tier, Name, Website, etc.
- Summary statistics on first sheet

**QUERY OPTIONS:**
```bash
lvv query top --conference "JPM 2025"          # Top entities by score
lvv query top --tier "Tier 1"                  # Filter by tier
lvv query top --entity-type company            # Filter by type
lvv query top --limit 50                       # Limit results
lvv query export --format xlsx                 # Excel export
lvv query export --format json                 # JSON export
```

---

## Interactive Workflow Patterns

### Re-Evaluation Prompts

**When entity has existing evaluation:**

```
Entity 'Acme Bio' was last evaluated 127 days ago
Score: 6.2, Tier: Tier 2

Re-evaluate? [y/N]
```

**DECISION LOGIC:**
- <30 days: Auto-use cache (don't ask)
- 30-180 days: Ask user
- >180 days: Suggest re-evaluation
- `--force` flag: Always re-evaluate

**COST AWARENESS:**
Tell user: "Re-evaluating will cost ~$0.30. Last score was 6.2. Still want to proceed?"

### Ambiguous Matches

**When match confidence is 70-89%:**

```
Found potential duplicate (78% confidence):

Entity 1: "Acme Therapeutics Inc"
  - Founded: 2020
  - Website: acme-tx.com
  - Description: Longevity therapeutics

Entity 2: "Acme Bio"
  - Founded: 2020
  - Website: acmebio.com
  - Description: Aging biology platform

Should I:
1. Merge them (same company)
2. Keep separate (different companies)
3. Show more details (full comparison)
```

**HANDLE RESPONSE:**
- Option 1: `lvv entity merge <id1> <id2>`
- Option 2: `lvv match reject <id1> <id2>`
- Option 3: Show full entity details for both, then ask again

### Batch Progress Updates

**During long batch operations:**

```
[25/100] Evaluated Rejuvenation Bio (score: 8.5, tier: Tier 1, cached: False)
[26/100] Evaluated Cellular Dynamics (score: 7.2, tier: Tier 2, cached: True)
...
```

**PERIODICALLY REPORT:**
- Every 25%: "25% complete (25/100 entities)"
- Estimated time remaining
- Running cost total
- Cache hit rate

---

## Cost Transparency

**ALWAYS estimate costs before batch operations:**

```
You: "Help me screen all JPM 2025 companies"

Claude: Found 121 companies in JPM 2025.

        COST ESTIMATE:
        - Prescreen (recommended): 121 × $0.0007 = ~$0.08
        - Full evaluation: 121 × $0.30 = ~$36.30

        Recommendation: Start with prescreens, then do full evals
        for high scorers (estimated 20-30 companies @ ~$9).

        Proceed with prescreens? [y/N]
```

**COST BREAKDOWN:**
- Prescreen (Haiku): $0.0007 per entity
- Full evaluation (Opus): ~$0.30 per entity
- Cached results: $0.00 (free)
- Web search (Tavily): ~$0.01 per search (auto-enabled for Tier 1-2)

**CACHE SAVINGS:**
Report cache hit rate: "30/30 entities from cache (100% hit rate, $0 cost)"

---

## Error Handling

### Database Not Found

**Error**: `FileNotFoundError: Database not found at ~/.lvv/intelligence.db`

**FIX:**
```bash
# Check database location
ls -la ~/.lvv/

# If missing, may need to initialize or migrate
# Point user to migration docs
```

### API Key Missing

**Error**: `ValueError: Anthropic API key not configured`

**FIX:**
1. Check keychain: `security find-generic-password -s "LVV-Screening-Pipeline" -a "anthropic-api-key" -w`
2. If not in keychain, guide user:
   ```bash
   # Add to keychain
   security add-generic-password -s "LVV-Screening-Pipeline" \
     -a "anthropic-api-key" -w "sk-ant-..."
   ```
3. Or use environment variable: `export ANTHROPIC_API_KEY="sk-ant-..."`

### Entity Not Found

**Error**: `ValueError: Entity 123 not found`

**FIX:**
```bash
# Search for entity by name
lvv entity search "Company Name"

# If not found, may need to ingest data
lvv conference ingest <file>
```

### Rate Limit Hit

**Error**: `Rate limit reached, waiting 30s...`

**INFO:** CLI automatically handles rate limiting (50 req/min). Just wait.

---

## Example Workflows

### Complete Conference Prep

```
User: "Help me prep for JPM 2025"

Claude: Let me prepare JPM 2025 for you.

        [Runs: lvv stats]

        Found JPM 2025 in database:
        - 121 companies
        - 307 investors
        - 98/121 companies evaluated (81%)
        - 307/307 investors evaluated (100%)

        Remaining: 23 companies need evaluation.

        COST ESTIMATE:
        - Prescreen 23 companies: ~$0.02
        - Full eval 23 companies: ~$6.90

        Recommendation: Prescreen all 23, then full-eval high scorers.

        Proceed with prescreens? [y]

User: y

Claude: [Runs: lvv screen batch --conference "JPM 2025" --entity-type company --type prescreen]

        Starting batch evaluation...
        [1/23] Evaluated Acme Bio (score: 4.5, tier: Accept)
        [2/23] Evaluated BioTech Inc (score: 3.2, tier: Pass)
        ...
        [23/23] Evaluated ZenAge (score: 5.1, tier: Accept)

        ✓ Complete in 15.4s
        - Total: 23 entities
        - Completed: 23
        - Cost: $0.016

        HIGH PRIORITY (scored Accept):
        1. Acme Bio - 4.5
        2. ZenAge - 5.1
        3. Rejuvenation Inc - 4.8

        Want me to:
        1. Do full evaluations of Accept tier (3 companies, ~$0.90)
        2. Export all results to Excel
        3. Show detailed view of top companies

User: 1

Claude: Running full evaluations for 3 Accept-tier companies...

        [Runs full evals, shows detailed results]

        ✓ Complete. Total cost: $0.91

        All JPM 2025 companies now evaluated!

        Export to Excel? [y/N]
```

### Entity Matching

```
User: "Check for duplicates in JPM 2025"

Claude: Scanning for potential duplicates...

        [Runs: lvv match review --interactive]

        Found 3 potential duplicates (70-89% confidence).

        MATCH 1/3 (78% confidence):
        - "Acme Therapeutics Inc" (ID: 123)
        - "Acme Bio" (ID: 456)

        Should I merge these? [y/n/details]

User: details

Claude: COMPARISON:

        Acme Therapeutics Inc (ID: 123)
        - Website: acme-tx.com
        - Founded: 2020
        - Focus: Longevity therapeutics
        - Evaluated: 6.2 (Tier 2)

        Acme Bio (ID: 456)
        - Website: acmebio.com
        - Founded: 2020
        - Focus: Aging biology
        - Evaluated: 6.5 (Tier 2)

        Different domains suggest different companies.

        Keep separate? [y/n]

User: y

Claude: ✓ Marked as separate entities.

        [Continues with remaining matches...]
```

---

## Database Paths

- **Production DB**: `~/.lvv/intelligence.db`
- **Data Directory**: `~/.lvv/data/`
- **Output Directory**: `~/.lvv/output/`
- **Config**: API keys from macOS Keychain (service: "LVV-Screening-Pipeline")

---

## LVV-Specific Context

### Portfolio Companies

LVV's current portfolio (for co-investor detection):
- LIfT Biosciences, Remedium Bio, Fauna Bio, General Proximity
- Matter Bio, PriveBio, Immunis, Paulex Bio, NanoSyrinx
- TECregen, Algen Biotechnologies, Rejuvenate Bio, Sift Bio
- Integrated Biosciences, EpiBone, BIOIO, Modulo Bio
- Deciduous Therapeutics, Rejuvenation Technologies, SENISCA
- Bolden Therapeutics, NaNotics, Marble Therapeutics

### Investment Thesis

**Stage Focus**: Pre-seed to Series A
**Therapeutic Areas**: Aging biology, longevity, geroscience
**Geographic Preference**: US, EU (SF Bay Area preferred)
**Check Size**: $500K - $2M initial

**Key Evaluation Factors:**
- Geroscience fit (weighted 2x)
- Quality of science and evidence
- Team background in aging/longevity
- Platform potential (not just single indication)

---

## Success Criteria

✅ Conference prep: 4+ hours → <30 minutes
✅ Entity matching: >95% accuracy, zero false positives
✅ Batch evaluation: 100 entities in <5 minutes
✅ Cost transparency: Always estimate before spend
✅ Interactive decisions: Ask for ambiguous cases
✅ Context preservation: "Why did we pass?" always answerable

---

## Technical Notes

- **Threading**: Batch orchestration uses 5 concurrent workers (ThreadPoolExecutor)
- **Rate Limiting**: 50 API calls per minute (auto-managed)
- **Caching**: SQLite-based, 30-day freshness threshold
- **Models**: Opus (Sonnet 4.5) for full eval, Haiku (3.5) for prescreen
- **Output Format**: Lisette structured outputs for guaranteed JSON parsing

---

## When NOT to Use This Skill

- General business questions → Use standard Claude
- Non-LVV conferences without biotech/longevity focus → Confirm with user first
- CRM operations → Not yet implemented (coming in future phase)
- Email generation → Not yet implemented (coming in future phase)

---

**Last Updated**: 2025-12-21
**Phase**: 4 (PAI Integration & Polish)
**Status**: Production Ready
