# ExportReporting Workflow

**Trigger:** "Export results", "Generate report", "Create Excel", "Download data"

---

## Export Formats

| Format | Use Case | Command |
|--------|----------|---------|
| Excel (.xlsx) | Meeting prep, sharing | `--format xlsx` |
| JSON | API integration, backup | `--format json` |
| CSV | Simple data, imports | `--format csv` |

---

## Execution Steps

### Step 1: Determine Scope

Ask user if not specified:
```
What would you like to export?

[1] All entities
[2] Specific conference (e.g., "JPM 2025")
[3] Filtered by tier (e.g., "Tier 1 only")
[4] Custom query
```

### Step 2: Apply Filters

```bash
# By conference
lvv query export --conference "JPM 2025" --format xlsx

# By tier
lvv query export --tier "Tier 1" --format xlsx

# By entity type
lvv query export --entity-type company --format xlsx

# Combined filters
lvv query export --conference "JPM 2025" --entity-type company --tier "Accept" --format xlsx
```

### Step 3: Specify Output Location

Default: `~/.lvv/output/[timestamp]_export.xlsx`

Custom:
```bash
lvv query export --conference "JPM 2025" --format xlsx --output ~/Desktop/jpm2025_prep.xlsx
```

### Step 4: Execute Export

```bash
lvv query export --conference "JPM 2025" --format xlsx --output results.xlsx
```

### Step 5: Confirm Success

```
Export Complete

File: ~/Desktop/jpm2025_prep.xlsx
Size: 103.6 KB
Entities: 428

Sheets:
1. Summary - Overview statistics
2. Companies - 121 entities
3. Investors - 307 entities
4. All Entities - Combined view
```

---

## Excel Format Details

### Sheet 1: Summary

| Metric | Value |
|--------|-------|
| Total Entities | 428 |
| Companies | 121 |
| Investors | 307 |
| Tier 1 / Accept | 45 |
| Tier 2 / Maybe | 89 |
| Tier 3+ / Pass | 294 |
| Evaluated | 100% |
| Export Date | 2025-01-15 |

### Sheet 2: Companies

| Column | Description |
|--------|-------------|
| Name | Company name |
| Website | Primary URL |
| Score | Weighted average |
| Tier | Accept/Maybe/Pass |
| Geroscience Fit | Key dimension (2x weight) |
| Quality of Science | Dimension score |
| Level of Evidence | Dimension score |
| Team | Dimension score |
| Platform Potential | Dimension score |
| MOAT | Dimension score |
| Last Evaluated | Date |
| Conferences | Appearances |
| Notes | Custom notes |

### Sheet 3: Investors

| Column | Description |
|--------|-------------|
| Name | Investor/fund name |
| Website | Primary URL |
| Score | Average |
| Tier | 1-4 |
| Stage Alignment | Dimension score |
| Therapeutic Focus | Dimension score |
| Geographic Fit | Dimension score |
| Strategic Value | Dimension score |
| Activity Level | Dimension score |
| Last Evaluated | Date |
| Portfolio Overlap | LVV co-investments |
| Conferences | Appearances |

### Color Coding

| Tier | Color |
|------|-------|
| Tier 1 / Accept | Green |
| Tier 2 / Maybe | Yellow |
| Tier 3 | Orange |
| Tier 4 / Pass | Red |

---

## Query Options

### Top Entities

```bash
# Top 20 by score
lvv query top --limit 20

# Top companies in conference
lvv query top --conference "JPM 2025" --entity-type company --limit 10

# Top Tier 1 investors
lvv query top --tier "Tier 1" --entity-type investor
```

### Custom Filters

```bash
# Score threshold
lvv query top --filter "score>7.0"

# Recent evaluations
lvv query top --filter "evaluated_days<30"

# Unevaluated entities
lvv query top --filter "score=null"
```

---

## Example Execution

```
User: "Export JPM 2025 results to Excel"

Claude: I'll export JPM 2025 results.

        [Runs: lvv query export --conference "JPM 2025" --format xlsx]

        Export Complete

        File: ~/.lvv/output/2025-01-15_jpm2025.xlsx
        Size: 103.6 KB

        Contents:
        ┌────────────────┬───────────────────┐
        │ Sheet          │ Entities          │
        ├────────────────┼───────────────────┤
        │ Summary        │ Statistics        │
        │ Companies      │ 121               │
        │ Investors      │ 307               │
        │ All Entities   │ 428               │
        └────────────────┴───────────────────┘

        Tier Distribution:
        - Accept/Tier 1: 45 (11%)
        - Maybe/Tier 2: 89 (21%)
        - Pass/Tier 3+: 294 (68%)

        File saved. Open in Excel?

User: "Also give me just the Accept tier companies as a separate file"

Claude: [Runs: lvv query export --conference "JPM 2025" --entity-type company --tier "Accept" --format xlsx --output jpm2025_priority.xlsx]

        Export Complete

        File: jpm2025_priority.xlsx
        Size: 12.4 KB
        Companies: 15 (Accept tier only)

        Top 5:
        1. ZenAge (5.1)
        2. Rejuvenation Inc (4.8)
        3. Acme Bio (4.5)
        4. Longevity Labs (4.4)
        5. Senolytics Inc (4.3)
```

---

## JSON Format

For programmatic access:

```json
{
  "export_date": "2025-01-15T10:30:00Z",
  "conference": "JPM 2025",
  "summary": {
    "total": 428,
    "companies": 121,
    "investors": 307
  },
  "entities": [
    {
      "id": 123,
      "name": "Acme Bio",
      "type": "company",
      "score": 6.2,
      "tier": "Tier 2",
      "dimensions": {
        "quality_of_science": 7,
        "geroscience_fit": 8,
        ...
      },
      "last_evaluated": "2025-01-10",
      "conferences": ["JPM 2025", "ARDD 2024"]
    },
    ...
  ]
}
```

---

## Output Locations

| Type | Default Path |
|------|--------------|
| Excel | `~/.lvv/output/YYYY-MM-DD_export.xlsx` |
| JSON | `~/.lvv/output/YYYY-MM-DD_export.json` |
| CSV | `~/.lvv/output/YYYY-MM-DD_export.csv` |

Custom output:
```bash
--output ~/Desktop/my_export.xlsx
--output /path/to/file.json
```

---

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| `No entities found` | Empty filter result | Broaden filters |
| `Permission denied` | Can't write to path | Check directory permissions |
| `File exists` | Overwrite protection | Use `--force` or different name |
