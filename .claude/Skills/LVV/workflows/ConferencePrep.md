# ConferencePrep Workflow

**Trigger:** "Help me prep for [CONFERENCE]" or "Prepare for JPM 2025"

![Conference Prep Phases](../diagrams/conference-prep-phases.png)

---

## Prerequisites

Before starting, ensure:
- Database exists at `~/.lvv/intelligence.db`
- API keys configured in macOS Keychain (service: "LVV-Screening-Pipeline")

---

## Execution Steps

### Step 1: Check Conference Status

```bash
lvv conference list | grep -i "CONFERENCE_NAME"
```

**If not found:** Ask user for data files (partnering emails, investor lists, CSV exports).

### Step 2: Ingest Data (If Needed)

```bash
lvv conference ingest <file> --conference "CONFERENCE_NAME"
```

Supported formats: CSV, Excel, JSON

### Step 3: Get Statistics

```bash
lvv stats
```

Report to user:
- Total companies and investors
- Evaluation coverage (% already screened)
- Cache status

### Step 4: Cost Estimation

**ALWAYS present cost before proceeding:**

```
Found X entities in CONFERENCE_NAME:
- Y companies (Z% already evaluated)
- W investors (V% already evaluated)

COST ESTIMATE for remaining entities:
- Prescreen: [count] × $0.0007 = ~$X.XX
- Full eval: [count] × $0.30 = ~$X.XX

Recommendation: Start with prescreens, then full-eval high scorers.

Proceed with prescreens? [y/N]
```

### Step 5: Run Batch Prescreen

```bash
lvv screen batch --conference "CONFERENCE_NAME" --type prescreen
```

Monitor progress and report periodically:
- Every 25%: Progress update
- Show running cost total
- Report cache hit rate

### Step 6: Present Results

```bash
lvv query top --conference "CONFERENCE_NAME" --limit 20
```

Show high-priority entities by tier:
- **Accept tier** companies (≥4.25)
- **Tier 1** investors (≥7.0)

### Step 7: Offer Next Steps

Present options:
1. Full evaluations of Accept/Tier 1 entities (estimate cost)
2. Export all results to Excel
3. Show detailed view of specific entities
4. Review potential duplicates

---

## Interactive Decision Points

### Re-evaluation Prompts

When entity has existing evaluation:

```
Entity 'Acme Bio' was last evaluated X days ago
Score: Y, Tier: Z

Re-evaluate? [y/N]
```

**Decision logic:**
- <30 days: Auto-use cache (don't ask)
- 30-180 days: Ask user
- >180 days: Suggest re-evaluation
- `--force` flag: Always re-evaluate

### Cost Confirmation

For batches >50 entities or >$10 estimated cost:

```
This batch will cost approximately $X.XX
Proceed? [y/N]
```

---

## Example Execution

```
User: "Help me prep for JPM 2025"

Claude: Let me prepare JPM 2025 for you.

        [Runs: lvv stats]

        Found JPM 2025 in database:
        - 121 companies (98 evaluated, 81%)
        - 307 investors (307 evaluated, 100%)

        Remaining: 23 companies need evaluation.

        COST ESTIMATE:
        - Prescreen 23 companies: ~$0.02
        - Full eval 23 companies: ~$6.90

        Recommendation: Prescreen all 23, then full-eval high scorers.

        Proceed with prescreens? [y]

User: y

Claude: [Runs batch, shows progress, presents results]

        HIGH PRIORITY (Accept tier):
        1. Acme Bio - 4.5
        2. ZenAge - 5.1
        3. Rejuvenation Inc - 4.8

        Want me to:
        1. Do full evaluations (3 companies, ~$0.90)
        2. Export all results to Excel
        3. Show detailed view of top companies
```

---

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| `Conference not found` | Not yet ingested | `lvv conference ingest <file>` |
| `Database not found` | Missing initialization | Check `~/.lvv/` exists |
| `API key missing` | Keychain not configured | See Troubleshooting reference |

---

## Success Criteria

- [ ] All entities in conference have at least prescreen scores
- [ ] High-priority entities identified for full evaluation
- [ ] Cost stayed within user's expected budget
- [ ] Results exportable to Excel for meeting prep
