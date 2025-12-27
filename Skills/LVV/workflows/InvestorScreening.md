# InvestorScreening Workflow

**Trigger:** "Evaluate [INVESTOR]", "Screen investor [NAME]", "Check [VC/FUND]"

---

## Purpose

Evaluate investors for:
- **Co-investment potential** - Can they co-lead or participate in deals?
- **Strategic partnership** - Can they provide value beyond capital?
- **Follow-on capability** - Can they fund portfolio companies at later stages?
- **Portfolio overlap** - Do they already invest in LVV portfolio companies?

---

## Investor Categories

| Category | Priority | Characteristics |
|----------|----------|-----------------|
| **Co-Investor** | Tier 1-2 | Pre-seed/Seed/A stage, longevity interest, active |
| **Strategic Partner** | Tier 2-3 | Pharma BD, CVC, innovation groups |
| **Follow-On** | Tier 2-3 | Series B+ focus, good for portfolio exits |
| **Not Relevant** | Tier 4 | Wrong sector, wrong stage, wrong geography |

---

## Execution Steps

### Step 1: Find Investor

```bash
lvv entity search "INVESTOR_NAME"
```

If not found, add with type = `investor`:

```sql
INSERT INTO entities (name, normalized_name, entity_type, description, source, conference_id, created_at, updated_at)
VALUES ('Fund Name', 'fundname', 'investor', 'VC focusing on...', 'JPM 2025', 1, datetime('now'), datetime('now'));
```

### Step 2: Check Portfolio Overlap

Compare investor's portfolio against LVV portfolio companies:

**LVV Portfolio (24 companies):**
- LIfT Biosciences, Remedium Bio, Fauna Bio, General Proximity
- Matter Bio, PriveBio, Immunis, Paulex Bio, NanoSyrinx
- TECregen, Algen Biotechnologies, Rejuvenate Bio, Sift Bio
- Integrated Biosciences, EpiBone, BIOIO, Modulo Bio
- Deciduous Therapeutics, Rejuvenation Technologies, SENISCA
- Bolden Therapeutics, NaNotics, Marble Therapeutics

**If overlap found:**
- Mark as high priority (existing relationship)
- Note shared portfolio companies
- Consider for co-investment on new deals

### Step 3: Run Investor Evaluation

**Prescreen (quick filter):**
```bash
lvv screen prescreen <entity_id>
```

**Full Evaluation (deep analysis):**
```bash
lvv screen full <entity_id> --enable-web-search
```

### Step 4: Display 5-Dimension Scores

| Dimension | Score | Criteria |
|-----------|-------|----------|
| **Stage Alignment** | X/10 | 9-10: Pre-seed/Seed/A focus<br>5-6: Broader mandate<br>1-2: PE/buyout only |
| **Therapeutic Focus** | X/10 | 9-10: Explicit longevity/aging<br>7-8: Neuro/metabolic/regen<br>1-2: Non-life-science |
| **Geographic Fit** | X/10 | 9-10: US-based, global flow<br>5-6: Asia-Pacific<br>1-2: Restricted geography |
| **Strategic Value** | X/10 | 9-10: Exceptional network<br>5-6: Solid connections<br>1-2: Unknown value |
| **Activity Level** | X/10 | 9-10: Very active, many deals<br>5-6: Moderate activity<br>1-2: Minimal activity |

**Average Score → Tier:**
- **Tier 1** (≥7.0): High priority outreach
- **Tier 2** (≥5.0): Standard priority
- **Tier 3** (≥3.0): Low priority
- **Tier 4** (<3.0): No outreach

### Step 5: Generate Talking Points

For Tier 1-2 investors, generate specific talking points:

**Co-Investment:**
- "We're seeing strong deal flow in [AREA] - would love to collaborate"
- "Your investment in [COMPANY] aligns well with our thesis"

**Strategic:**
- "Your BD team's focus on [AREA] matches our portfolio"
- "Would value your perspective on [THERAPEUTIC AREA]"

**Follow-On:**
- "[PORTFOLIO COMPANY] is approaching Series B - interested?"
- "We have several companies that fit your later-stage criteria"

### Step 6: Recommend Outreach

| Tier | Action | Timeline |
|------|--------|----------|
| Tier 1 | Schedule meeting, high priority | Pre-conference outreach |
| Tier 2 | Request meeting if time allows | During conference |
| Tier 3 | Add to newsletter, passive | Post-conference follow-up |
| Tier 4 | No action | - |

---

## Investor-Specific Signals

### Positive Signals
- Explicit longevity/aging fund mandate
- Recent investments in geroscience companies
- Portfolio overlap with LVV companies
- Active at pre-seed/seed stage
- Strong scientific advisory network
- History of follow-on investments

### Red Flags
- Only late-stage PE/buyout
- No life science investments
- Geographic restrictions (China-only, etc.)
- Inactive or winding down
- Reputation concerns

---

## Conference Prep: Batch Investor Screening

For conference preparation, screen all investors:

```bash
# Get investor count
lvv stats

# Batch prescreen investors
lvv screen batch --conference "JPM 2025" --eval-type prescreen --entity-type investor
```

**Output prioritization:**
1. **Tier 1 investors** - Schedule pre-conference calls
2. **Portfolio overlap** - Highlight existing relationships
3. **Tier 2 investors** - Add to meeting request list
4. **Tier 3-4** - Skip or passive engagement

---

## Example Execution

```
User: "Evaluate Khosla Ventures"

Claude: [Runs: lvv entity search "Khosla Ventures"]

        Found: Khosla Ventures (ID: 789)
        Type: Investor
        Last evaluated: Never

        Running full evaluation with web search...

        === KHOSLA VENTURES ===

        Overall Score: 7.8/10 → Tier 1

        | Dimension | Score |
        |-----------|-------|
        | Stage Alignment | 8 | Early-stage focus, pre-seed to A |
        | Therapeutic Focus | 7 | Strong biotech interest, some longevity |
        | Geographic Fit | 9 | US-based, global deal flow |
        | Strategic Value | 9 | Top-tier network, operational support |
        | Activity Level | 8 | Very active investor |

        Portfolio Overlap: None detected

        Recommendation: HIGH PRIORITY

        Talking Points:
        - Vinod's interest in longevity through Juvenescence connection
        - Strong track record in biotech (Impossible Foods, etc.)
        - Could be excellent co-lead for larger seed rounds

        Action: Request meeting at JPM 2025
```

---

## Integration with ConferencePrep

When running ConferencePrep workflow, investor screening happens in parallel:

1. **Phase 1**: Batch prescreen all companies and investors
2. **Phase 2**: Full evaluation of Accept tier companies
3. **Phase 3**: Full evaluation of Tier 1-2 investors
4. **Phase 4**: Generate prioritized meeting list

---

**Last Updated:** 2025-12-22
