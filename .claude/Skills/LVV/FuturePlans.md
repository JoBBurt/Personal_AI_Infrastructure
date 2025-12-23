# LVV Future Plans

Deferred improvements for future implementation.

---

## 1. Quick Web Enrichment for Prescreen

**Problem:** Prescreens for entities with sparse descriptions (<100 chars) lack context for accurate scoring.

**Solution:** Optional lightweight web fetch before prescreen to enrich entity context.

### Implementation

**File: `lvv/evaluation/service.py`**

Add enrichment option to prescreen function:

```python
async def run_prescreen(entity_id: int, enrich: bool = False):
    entity = get_entity(entity_id)

    if enrich and entity.website and len(entity.description or '') < 100:
        # Fetch homepage, extract company description
        web_data = await fetch_and_extract(entity.website)
        # Create enriched context for evaluation
        enriched_description = f"{entity.description or ''}\n\nFrom website:\n{web_data}"
        # Pass to evaluation
```

**File: `lvv/cli/screen.py`**

Add CLI flag:

```python
@click.option('--enrich', is_flag=True, help='Fetch website for sparse entities')
def prescreen(entity_id: int, enrich: bool):
    ...
```

**Usage:**
```bash
lvv screen prescreen <id> --enrich
```

### Considerations

- Rate limiting for web fetches
- Timeout handling (slow/unresponsive sites)
- Cache fetched content to avoid repeated requests
- Cost: Adds ~1-2s latency per enriched entity

### Effort

~2-3 hours Python development + testing

---

## 2. Dashboard Visualization

**Problem:** No visual interface for conference prep status, entity browsing, or batch monitoring.

**Solution:** Vue 3 + Bun web application following PAI Observability skill patterns.

### Architecture

```
~/.claude/Skills/LVV/apps/dashboard/
├── server/
│   ├── index.ts          # Bun + Hono server
│   ├── routes/
│   │   ├── stats.ts      # GET /api/stats
│   │   ├── entities.ts   # GET /api/entities
│   │   ├── evaluations.ts # GET /api/evaluations/:id
│   │   └── websocket.ts  # WS /ws/batch
│   └── db.ts             # SQLite connection to ~/.lvv/intelligence.db
├── client/
│   ├── src/
│   │   ├── App.vue
│   │   ├── components/
│   │   │   ├── ConferenceOverview.vue
│   │   │   ├── EntityBrowser.vue
│   │   │   ├── ScoringRadar.vue
│   │   │   ├── MeetingPrep.vue
│   │   │   └── BatchMonitor.vue
│   │   └── stores/
│   │       └── entities.ts
│   ├── vite.config.ts
│   └── tailwind.config.js
├── package.json
└── README.md
```

### Backend API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Database statistics (entity counts, evaluation counts) |
| `/api/entities` | GET | Filtered entity list (`?tier=Accept&conference=JPM&type=company`) |
| `/api/entities/:id` | GET | Single entity with latest evaluation |
| `/api/evaluations/:id` | GET | Full evaluation details with dimension scores |
| `/api/conferences` | GET | List conferences with entity counts |
| `/ws/batch` | WS | Real-time batch screening progress |

### Frontend Components

**ConferenceOverview.vue**
- Entity counts by tier (Accept/Maybe/Pass)
- Cost tracker (spent vs estimated)
- Progress bar for batch operations
- Quick stats cards

**EntityBrowser.vue**
- Searchable, sortable table
- Tier color-coding (green/yellow/red)
- Filter by conference, type, tier, evaluation status
- Click to expand evaluation details

**ScoringRadar.vue**
- 8-dimension radar chart for companies
- 5-dimension radar chart for investors
- Visual comparison of dimension strengths/weaknesses

**MeetingPrep.vue**
- Accept tier companies with contact info
- Tier 1-2 investors with talking points
- Export to meeting list

**BatchMonitor.vue**
- Real-time progress via WebSocket
- Entity-by-entity status updates
- Cost accumulator
- Cancel/pause controls

### Reference Implementation

PAI Observability skill provides the template:
- `~/.claude/Skills/Observability/` - Vue 3 + Bun architecture
- Similar real-time WebSocket patterns
- TailwindCSS styling conventions

### Effort

Significant - estimated 2-3 weeks following Observability patterns:
- Week 1: Backend API + basic entity browser
- Week 2: Scoring visualizations + meeting prep view
- Week 3: Real-time batch monitoring + polish

---

## Priority Order

1. **Quick Web Enrichment** - Small effort, immediate value for sparse entities
2. **Dashboard Visualization** - Large effort, high value for conference prep workflow

---

## Completed Items

### Technical Documentation Diagrams (Completed 2025-12-22)

Generated 5 hand-drawn style diagrams using Art skill with Gemini nano-banana-pro model:

| Diagram | File |
|---------|------|
| System Architecture | `diagrams/system-architecture.png` |
| Entity Screening Flow | `diagrams/entity-screening-flow.png` |
| Conference Prep Phases | `diagrams/conference-prep-phases.png` |
| Database Schema | `diagrams/database-schema.png` |
| Scoring Dimensions | `diagrams/scoring-dimensions.png` |

Documentation updated with image references in SKILL.md, EntityScreening.md, ConferencePrep.md, DatabaseSchema.md, and ScoringDimensions.md.

---

**Last Updated:** 2025-12-22
