# EmailIngest Workflow

**Trigger:** "Process these meeting requests", "Batch ingest emails", "Screen these companies"

---

## Purpose

Efficiently process multiple meeting request emails in a single operation:
1. Parse structured data from emails
2. Bulk add entities, contacts, and attendance records
3. Run batch prescreens
4. Present tiered results with recommendations

---

## Execution Steps

### Step 1: Receive Email Batch

User pastes multiple meeting request emails separated by `---` or provides as numbered list.

**Expected format per email:**
- Subject line (often contains company focus)
- Sender name, email, role
- Company name and website
- Description of what they're building
- Stage and funding info
- Conference context

### Step 2: Extract Structured Data

For each email, extract:

```
Company:
  - name: "Company Name, Inc."
  - website: "https://..."
  - description: "What they're building..."
  - source: "JPM 2025" or "Biotech Showcase 2025"

Contact:
  - name: "First Last"
  - email: "email@company.com"
  - role: "CEO/Founder/CSO"

Conference:
  - id: 1 (JPM 2025) or 2 (Biotech Showcase 2025)
  - meeting_requested: true
```

### Step 3: Validate and Deduplicate

Before inserting, check for existing entities:

```bash
lvv entity search "COMPANY_NAME"
```

- If found: Skip entity creation, link contact to existing
- If not found: Proceed with creation

### Step 4: Bulk Insert

**For each new entity:**

```sql
-- Insert entity
INSERT INTO entities (name, normalized_name, entity_type, website, description, source, conference_id, created_at, updated_at)
VALUES ('Company Name', 'companyname', 'company', 'https://...', 'Description...', 'JPM 2025', 1, datetime('now'), datetime('now'));

-- Get entity ID
SELECT last_insert_rowid() as entity_id;

-- Insert contact
INSERT INTO contacts (name, email, role, entity_id, is_key_contact, created_at, updated_at)
VALUES ('Contact Name', 'email@co.com', 'CEO', <entity_id>, 1, datetime('now'), datetime('now'));

-- Insert attendance (meeting request)
INSERT INTO attendance (entity_id, conference_id, meeting_requested, meeting_request_date)
VALUES (<entity_id>, 1, 1, datetime('now'));
```

### Step 5: Estimate Batch Cost

Before running prescreens:

```
Entities to screen: X
Estimated cost: $0.0007 × X = $Y.YY
Estimated time: ~0.67s × X = Z seconds

Proceed with prescreens? [Y/n]
```

### Step 6: Run Batch Prescreens

```bash
# For each new entity
lvv screen prescreen <entity_id>
```

Or use batch command if many entities:

```bash
lvv screen batch --conference "JPM 2025" --eval-type prescreen --entity-type company
```

### Step 7: Present Results by Tier

**Summary:**
| Metric | Value |
|--------|-------|
| Emails processed | X |
| New entities added | Y |
| Duplicates skipped | Z |
| Total cost | $A.AA |

**Results by Tier:**

### Accept (X)
| Company | Score | Contact | Action |
|---------|-------|---------|--------|
| Company A | 7.5 | name@co.com | Schedule meeting |
| Company B | 6.2 | name@co.com | Schedule meeting |

### Maybe (Y)
| Company | Score | Contact | Action |
|---------|-------|---------|--------|
| Company C | 4.0 | name@co.com | Request more info |

### Pass (Z)
| Company | Score | Decline Reason |
|---------|-------|----------------|
| Company D | 2.5 | Medical device |
| Company E | 3.0 | No geroscience fit |

### Step 8: Offer Batch Actions

**For Accept tier:**
- Draft meeting acceptance responses
- Add to meeting priority list
- Run full evaluations for deeper analysis

**For Pass tier:**
- Generate batch decline responses (use DeclineTemplates.md)
- Group by decline reason for efficiency

---

## Example Execution

```
User: Process these meeting requests:
---
Subject: Novel senolytic platform
Hi Jordan, I'm the CEO of SenoTech...
[email content]
---
Subject: AI drug discovery
Hi, I lead BioAI Labs...
[email content]
---
Subject: Surgical adhesion device
We at AdhesionFree have developed...
[email content]

Claude: Parsing 3 meeting request emails...

Extracted:
1. SenoTech (senolytic platform) - CEO John Smith <john@senotech.com>
2. BioAI Labs (AI drug discovery) - CEO Sarah Chen <sarah@bioailabs.com>
3. AdhesionFree (surgical device) - BD Mike Johnson <mike@adhesionfree.com>

Checking for duplicates... None found.

Cost estimate: 3 × $0.0007 = $0.0021
Proceed? [Y/n]

User: Y

Claude: Running prescreens...

[===================================] 3/3 complete

Results:

### Accept (1)
| Company | Score | Contact |
|---------|-------|---------|
| SenoTech | 8.0 | john@senotech.com |

### Maybe (1)
| Company | Score | Contact |
|---------|-------|---------|
| BioAI Labs | 4.2 | sarah@bioailabs.com |

### Pass (1)
| Company | Score | Reason |
|---------|-------|--------|
| AdhesionFree | 1.5 | Medical device, no therapeutics |

Would you like to:
1. Draft acceptance for SenoTech
2. Request more info from BioAI Labs
3. Generate decline for AdhesionFree
4. Export all results
```

---

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| Parse failure | Unusual email format | Extract manually, ask for clarification |
| Duplicate entity | Already in database | Link contact, skip entity creation |
| Missing contact info | Not in email | Add entity without contact, note for manual follow-up |
| Rate limit | Too many prescreens | Auto-retry after 30s |

---

## Notes

- Maximum recommended batch: 20 emails per session
- For larger batches, split into multiple runs
- Always verify extracted data before inserting
- Contact info may require manual extraction if email format varies

---

**Last Updated:** 2025-12-22
