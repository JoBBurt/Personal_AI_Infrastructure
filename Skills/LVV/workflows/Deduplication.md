# Deduplication Workflow

**Trigger:** "Find duplicates", "Check for matches", "Merge entities", "Dedupe [CONFERENCE]"

---

## Matching Confidence Levels

| Confidence | Match Type | Action |
|------------|------------|--------|
| 100% | URL exact match | Auto-merge |
| 95% | Domain match | Auto-merge |
| 90% | Exact normalized name | Auto-merge |
| 85% | Fuzzy name (>85%) | Auto-merge |
| 70-84% | Fuzzy name (ambiguous) | **Ask user** |
| <70% | Low similarity | Create new entity |

---

## Execution Steps

### Step 1: Scan for Duplicates

```bash
lvv match find --conference "CONFERENCE_NAME"
```

Or for specific entity:
```bash
lvv match find "ENTITY_NAME"
```

### Step 2: Handle Auto-Matches (≥85%)

These are merged automatically. Report summary:
```
Auto-merged 12 entities (≥85% confidence):
- "Acme Therapeutics" + "Acme Therapeutics Inc" → Acme Therapeutics Inc
- "BioAge" + "Bio-Age Labs" → BioAge Labs
- ...
```

### Step 3: Review Ambiguous Matches (70-84%)

**CLI returns exit code 10 for ambiguous matches.**

Present each to user:
```
POTENTIAL DUPLICATE (78% confidence)

┌────────────────────────────────────────────────────────────┐
│ Entity 1: "Acme Therapeutics Inc" (ID: 123)                │
├────────────────────────────────────────────────────────────┤
│ Founded:     2020                                          │
│ Website:     acme-tx.com                                   │
│ Focus:       Longevity therapeutics                        │
│ Evaluated:   6.2 (Tier 2)                                  │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Entity 2: "Acme Bio" (ID: 456)                             │
├────────────────────────────────────────────────────────────┤
│ Founded:     2020                                          │
│ Website:     acmebio.com                                   │
│ Focus:       Aging biology platform                        │
│ Evaluated:   6.5 (Tier 2)                                  │
└────────────────────────────────────────────────────────────┘

Different domains suggest different companies.

[1] Merge (same company)
[2] Keep separate (different companies)
[3] Show more details
```

### Step 4: Execute User Decision

**If merge:**
```bash
lvv entity merge --entity-id 123 --target-id 456
```

Merges entity 123 into 456, preserving:
- Higher score
- More recent evaluation
- Combined conference appearances
- All contact info

**If keep separate:**
```bash
lvv match reject --entity-id 123 --candidate-id 456
```

Records rejection to prevent future prompts.

### Step 5: Interactive Review Mode

For batch review:
```bash
lvv match review --interactive
```

Cycles through all pending ambiguous matches.

### Step 6: Report Summary

```
DEDUPLICATION COMPLETE

┌─────────────────────────────────────┐
│ Summary                             │
├─────────────────────────────────────┤
│ Auto-merged (≥85%):     12          │
│ User-merged (70-84%):   5           │
│ Kept separate:          3           │
│ Total entities removed: 17          │
└─────────────────────────────────────┘

Database now has 411 unique entities (was 428).
```

---

## Merge Strategy

### Which Entity Survives?

When merging, the **target entity** (second ID) survives. The source entity is:
1. Marked as merged
2. Data copied to target
3. Removed from active queries

### Data Preservation

| Field | Strategy |
|-------|----------|
| Name | Keep target (or longer/more formal) |
| Website | Keep target (or primary domain) |
| Score | Keep higher score |
| Evaluation | Keep more recent |
| Conferences | Combine all appearances |
| Notes | Append source notes to target |

---

## Example Execution

```
User: "Check for duplicates in JPM 2025"

Claude: Scanning for potential duplicates...

        [Runs: lvv match find --conference "JPM 2025"]

        Found 15 potential duplicates:
        - 12 auto-merged (≥85% confidence)
        - 3 need review (70-84% confidence)

        AUTO-MERGED:
        1. "Acme Inc" + "Acme, Inc." → Acme Inc
        2. "BioAge Labs" + "Bio-Age" → BioAge Labs
        ...

        REVIEW NEEDED (1/3):

        "Cellular Dynamics" (78% match with "Cellular Bio")

        Entity 1: Cellular Dynamics
        - Website: cellulardynamics.com
        - Focus: iPSC manufacturing

        Entity 2: Cellular Bio
        - Website: cellular.bio
        - Focus: Cell therapy

        Different domains and focus areas.

        [1] Merge  [2] Keep separate  [3] Details

User: 2

Claude: Marked as separate companies.

        REVIEW NEEDED (2/3):
        ...

        [After all reviews]

        COMPLETE:
        - 12 auto-merged
        - 1 user-merged
        - 2 kept separate

        JPM 2025 now has 413 unique entities.
```

---

## Edge Cases

### Same Company, Different Names

Common patterns to consider:
- "Inc" vs "Inc." vs no suffix
- "Labs" vs "Laboratories"
- "&" vs "and"
- Acquired/renamed companies

### Different Companies, Similar Names

Watch for:
- Different domains (acme.com vs acme.io)
- Different founding dates
- Different therapeutic areas
- Different geographic locations

### Portfolio Company Detection

LVV portfolio companies should be flagged:
```
Note: "Fauna Bio" is an LVV portfolio company.
This match may be a duplicate entry or a co-investor.
```

---

## Commands Reference

```bash
# Find potential duplicates
lvv match find <entity-name>
lvv match find --conference "JPM 2025"

# Interactive review
lvv match review --interactive

# Merge entities
lvv entity merge --entity-id ID1 --target-id ID2

# Reject match (keep separate)
lvv match reject --entity-id ID1 --candidate-id ID2

# Show merge history
lvv entity history <id>
```
