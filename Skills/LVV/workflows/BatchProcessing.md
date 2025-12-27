# BatchProcessing Workflow

**Trigger:** "Screen all companies", "Evaluate all attendees", "Batch process [CONFERENCE]"

---

## Execution Steps

### Step 1: Determine Scope

```bash
lvv stats
```

Or for specific conference:
```bash
lvv query top --conference "CONFERENCE_NAME" --limit 999 | wc -l
```

### Step 2: Present Cost Estimate

**MANDATORY before any batch operation:**

```
BATCH EVALUATION PLAN

Target: [CONFERENCE_NAME or "all entities"]
Scope: X companies, Y investors

Already evaluated (cached): Z entities (free)
Need evaluation: W entities

COST OPTIONS:
┌─────────────┬───────────┬──────────────┬─────────────┐
│ Type        │ Per Entity│ Total Cost   │ Est. Time   │
├─────────────┼───────────┼──────────────┼─────────────┤
│ Prescreen   │ $0.0007   │ $X.XX        │ ~Y minutes  │
│ Full Eval   │ $0.30     │ $X.XX        │ ~Y minutes  │
└─────────────┴───────────┴──────────────┴─────────────┘

Recommendation: [Based on count and purpose]

Proceed? [y/N]
```

### Step 3: Apply Filters (Optional)

Available filters:
```bash
--entity-type company          # Only companies
--entity-type investor         # Only investors
--tier "Tier 1"               # Only specific tier
--filter "score>4.0"          # Score threshold
--conference "JPM 2025"       # Specific conference
```

### Step 4: Execute Batch

```bash
lvv screen batch --conference "CONFERENCE_NAME" --type [prescreen|full_evaluation]
```

### Step 5: Monitor Progress

**Report every 25%:**
```
[25/100] 25% complete
  - Completed: 25
  - From cache: 8 (32%)
  - Running cost: $0.012
  - Est. remaining: 2 minutes
```

**Show individual results:**
```
[26/100] Evaluated Cellular Dynamics (score: 7.2, tier: Tier 2, cached: True)
[27/100] Evaluated Rejuvenation Bio (score: 8.5, tier: Tier 1, cached: False)
```

### Step 6: Present Summary

```
BATCH COMPLETE

┌─────────────────────────────────────┐
│ Summary                             │
├─────────────────────────────────────┤
│ Total entities:      100            │
│ Completed:           100            │
│ From cache:          30 (30%)       │
│ Failed:              0              │
│ Total cost:          $0.049         │
│ Time elapsed:        67 seconds     │
└─────────────────────────────────────┘

TIER DISTRIBUTION:
- Tier 1 / Accept: 12 entities
- Tier 2 / Maybe:  28 entities
- Tier 3 / Pass:   45 entities
- Tier 4:          15 entities
```

### Step 7: Offer Next Steps

1. Full evaluations of top tier (with cost estimate)
2. Export all results to Excel
3. Show detailed view of top scorers
4. Review potential duplicates

---

## Performance Notes

| Parameter | Value |
|-----------|-------|
| Concurrent workers | 5 (default) |
| Rate limit | 50 requests/minute |
| Per-entity time | ~0.67 seconds |
| 100 entities | ~67 seconds |
| Cache freshness | 30 days |

---

## Recommended Strategies

### Two-Pass Strategy (Cost-Effective)

1. **Pass 1:** Prescreen all entities ($0.0007 each)
2. **Filter:** Select only Accept/Tier 1-2 entities
3. **Pass 2:** Full eval filtered set (~$0.30 each)

**Example:**
- 200 entities → Prescreen: $0.14
- 40 make cutoff → Full eval: $12.00
- **Total: $12.14** (vs $60 for full eval all)

### Score Threshold Strategy

```bash
lvv screen batch --conference "JPM 2025" --type full_evaluation --filter "prescreen_score>4.0"
```

Only full-eval entities that passed prescreen threshold.

---

## Example Execution

```
User: "Screen all JPM 2025 companies"

Claude: Let me check the current state...

        [Runs: lvv stats]

        JPM 2025 Companies:
        - Total: 121
        - Already evaluated: 98 (81%)
        - Need evaluation: 23

        COST ESTIMATE:
        - Prescreen 23: ~$0.02
        - Full eval 23: ~$6.90

        Recommend: Prescreen first, then full-eval Accept tier.

        Proceed with prescreens? [y/N]

User: y

Claude: Starting batch evaluation...

        [25%] 6/23 complete (2 cached, cost: $0.003)
        [50%] 12/23 complete (4 cached, cost: $0.006)
        [75%] 17/23 complete (5 cached, cost: $0.008)
        [100%] 23/23 complete

        RESULTS:
        - Completed: 23
        - From cache: 7 (30%)
        - Total cost: $0.011

        Accept tier (5 companies):
        1. ZenAge - 5.1
        2. Rejuvenation Inc - 4.8
        3. Acme Bio - 4.5
        ...

        Full eval these 5? (~$1.50)
```

---

## Error Handling

| Error | Cause | Recovery |
|-------|-------|----------|
| Partial failure | Some entities failed | Retry failed only |
| Rate limit | 50 req/min exceeded | Auto-wait 30s |
| Timeout | API slow | CLI retries automatically |
| Interrupt (Ctrl+C) | User cancelled | Progress saved, resume safe |
