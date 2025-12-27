#!/usr/bin/env bun
/**
 * LVV CLI Wrapper - PAI-Native TypeScript Interface
 *
 * Wraps the Python lvv CLI with:
 * - History system integration (auto-save results)
 * - Observability notifications
 * - JSON output for programmatic access
 * - Direct SQLite queries when needed
 *
 * Usage:
 *   bun run ~/.claude/Skills/LVV/tools/LvvCli.ts <command> [options]
 *
 * Commands:
 *   stats              - Database statistics (JSON)
 *   query              - Query entities with filters
 *   screen             - Run evaluations (with History save)
 *   history            - View saved History entries
 */

import { $ } from "bun";
import { Database } from "bun:sqlite";
import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  dbPath: `${process.env.HOME}/.lvv/intelligence.db`,
  historyBase: `${process.env.HOME}/.claude/History/Execution`,
  toolsPath: `${process.env.HOME}/.claude/Tools`,
  lvvCli: "lvv",
};

// ============================================================================
// Types
// ============================================================================

interface Entity {
  id: number;
  name: string;
  entity_type: string;
  website?: string;
  city?: string;
  overall_score?: number;
  tier?: string;
  last_evaluated_at?: string;
  days_since_evaluation?: number;
}

interface BatchResult {
  conference: string;
  date: string;
  type: "prescreen" | "full_evaluation";
  entities_screened: number;
  from_cache: number;
  cost_estimate: number;
  results: {
    accept: Entity[];
    maybe: Entity[];
    pass: Entity[];
    tier1: Entity[];
    tier2: Entity[];
    tier3: Entity[];
    tier4: Entity[];
  };
  duration_seconds: number;
}

interface StatsResult {
  entities: {
    company: number;
    investor: number;
    organization: number;
    individual: number;
    total: number;
  };
  evaluations: {
    by_tier: Record<string, number>;
    total: number;
  };
  conferences: number;
  pending_matches: number;
}

// ============================================================================
// Database Helpers
// ============================================================================

function getDb(): Database {
  if (!existsSync(CONFIG.dbPath)) {
    throw new Error(`Database not found at ${CONFIG.dbPath}`);
  }
  return new Database(CONFIG.dbPath, { readonly: true });
}

function getStats(): StatsResult {
  const db = getDb();

  // Entity counts by type
  const entityCounts = db.query(`
    SELECT entity_type, COUNT(*) as count
    FROM entities
    WHERE is_deleted = 0
    GROUP BY entity_type
  `).all() as { entity_type: string; count: number }[];

  const entities = {
    company: 0,
    investor: 0,
    organization: 0,
    individual: 0,
    total: 0,
  };

  for (const row of entityCounts) {
    entities[row.entity_type as keyof typeof entities] = row.count;
    entities.total += row.count;
  }

  // Evaluation counts by tier
  const tierCounts = db.query(`
    SELECT tier, COUNT(*) as count
    FROM latest_evaluations
    GROUP BY tier
  `).all() as { tier: string; count: number }[];

  const by_tier: Record<string, number> = {};
  let evalTotal = 0;
  for (const row of tierCounts) {
    by_tier[row.tier] = row.count;
    evalTotal += row.count;
  }

  // Conference count
  const confCount = db.query(`SELECT COUNT(*) as count FROM conferences`).get() as { count: number };

  // Pending matches
  const matchCount = db.query(`
    SELECT COUNT(*) as count FROM match_candidates WHERE status = 'pending'
  `).get() as { count: number };

  db.close();

  return {
    entities,
    evaluations: { by_tier, total: evalTotal },
    conferences: confCount.count,
    pending_matches: matchCount.count,
  };
}

function queryEntities(options: {
  conference?: string;
  entityType?: string;
  tier?: string;
  limit?: number;
  unevaluated?: boolean;
}): Entity[] {
  const db = getDb();

  let sql = `
    SELECT
      e.id, e.name, e.entity_type, e.website, e.city,
      ev.overall_score, ev.tier, ev.created_at as last_evaluated_at,
      CAST((julianday('now') - julianday(ev.created_at)) AS INTEGER) as days_since_evaluation
    FROM entities e
    LEFT JOIN latest_evaluations ev ON e.id = ev.entity_id
    WHERE e.is_deleted = 0
  `;

  const params: any[] = [];

  if (options.conference) {
    sql += ` AND e.source = ?`;
    params.push(options.conference);
  }

  if (options.entityType) {
    sql += ` AND e.entity_type = ?`;
    params.push(options.entityType);
  }

  if (options.tier) {
    sql += ` AND ev.tier = ?`;
    params.push(options.tier);
  }

  if (options.unevaluated) {
    sql += ` AND ev.id IS NULL`;
  }

  sql += ` ORDER BY ev.overall_score DESC NULLS LAST`;

  if (options.limit) {
    sql += ` LIMIT ?`;
    params.push(options.limit);
  }

  const results = db.query(sql).all(...params) as Entity[];
  db.close();

  return results;
}

// ============================================================================
// History System Integration
// ============================================================================

function getHistoryPath(): string {
  const now = new Date();
  const month = now.toISOString().slice(0, 7); // YYYY-MM
  const path = join(CONFIG.historyBase, month);

  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }

  return path;
}

function saveToHistory(filename: string, content: object | string): string {
  const historyPath = getHistoryPath();
  const fullPath = join(historyPath, filename);

  const data = typeof content === "string" ? content : JSON.stringify(content, null, 2);
  writeFileSync(fullPath, data);

  return fullPath;
}

function generateBatchHistoryEntry(result: BatchResult): string {
  const { conference, date, type, entities_screened, from_cache, cost_estimate, results, duration_seconds } = result;

  const acceptCount = results.accept?.length || 0;
  const maybeCount = results.maybe?.length || 0;
  const passCount = results.pass?.length || 0;
  const tier1Count = results.tier1?.length || 0;

  let markdown = `# Batch Screening Results

**Conference:** ${conference}
**Date:** ${date}
**Type:** ${type}
**Duration:** ${duration_seconds.toFixed(1)}s

## Summary

| Metric | Value |
|--------|-------|
| Entities screened | ${entities_screened} |
| From cache | ${from_cache} (${((from_cache / entities_screened) * 100).toFixed(0)}%) |
| Estimated cost | $${cost_estimate.toFixed(4)} |

## Results by Tier

`;

  if (results.accept?.length) {
    markdown += `### Accept (${acceptCount})\n\n`;
    markdown += `| Company | Score | Website |\n|---------|-------|---------|\\n`;
    for (const e of results.accept) {
      markdown += `| ${e.name} | ${e.overall_score?.toFixed(1) || '-'} | ${e.website || '-'} |\n`;
    }
    markdown += `\n`;
  }

  if (results.tier1?.length) {
    markdown += `### Tier 1 Investors (${tier1Count})\n\n`;
    markdown += `| Investor | Score |\n|----------|-------|\n`;
    for (const e of results.tier1) {
      markdown += `| ${e.name} | ${e.overall_score?.toFixed(1) || '-'} |\n`;
    }
    markdown += `\n`;
  }

  if (results.maybe?.length) {
    markdown += `### Maybe (${maybeCount})\n\n`;
    markdown += `| Company | Score |\n|---------|-------|\n`;
    for (const e of results.maybe.slice(0, 10)) {
      markdown += `| ${e.name} | ${e.overall_score?.toFixed(1) || '-'} |\n`;
    }
    if (results.maybe.length > 10) {
      markdown += `| ... and ${results.maybe.length - 10} more | |\n`;
    }
    markdown += `\n`;
  }

  markdown += `---\n*Generated by LVV CLI Wrapper*\n`;

  return markdown;
}

function listHistoryEntries(limit: number = 10): { date: string; file: string; path: string }[] {
  const entries: { date: string; file: string; path: string }[] = [];

  // Get all month directories
  if (!existsSync(CONFIG.historyBase)) {
    return entries;
  }

  const months = readdirSync(CONFIG.historyBase)
    .filter(d => /^\d{4}-\d{2}$/.test(d))
    .sort()
    .reverse();

  for (const month of months) {
    const monthPath = join(CONFIG.historyBase, month);
    const files = readdirSync(monthPath)
      .filter(f => f.endsWith('.md') || f.endsWith('.json'))
      .sort()
      .reverse();

    for (const file of files) {
      entries.push({
        date: month,
        file,
        path: join(monthPath, file),
      });

      if (entries.length >= limit) {
        return entries;
      }
    }
  }

  return entries;
}

// ============================================================================
// Observability Integration
// ============================================================================

async function notifyWorkflow(workflowName: string): Promise<void> {
  const scriptPath = join(CONFIG.toolsPath, "SkillWorkflowNotification");

  if (existsSync(scriptPath)) {
    try {
      await $`${scriptPath} ${workflowName} LVV`.quiet();
    } catch {
      // Non-blocking - observability is optional
    }
  }
}

// ============================================================================
// CLI Wrapper Functions
// ============================================================================

async function runScreen(options: {
  conference: string;
  type: "prescreen" | "full_evaluation";
  entityType?: string;
  saveHistory?: boolean;
}): Promise<BatchResult> {
  const startTime = Date.now();

  // Notify observability
  await notifyWorkflow("BatchProcessing");

  // Build command
  let cmd = `${CONFIG.lvvCli} screen batch --conference "${options.conference}" --type ${options.type}`;
  if (options.entityType) {
    cmd += ` --entity-type ${options.entityType}`;
  }

  // Run the CLI (this will take time)
  console.log(`Running: ${cmd}`);
  const output = await $`sh -c ${cmd}`.text();

  const duration = (Date.now() - startTime) / 1000;

  // Parse results from database
  const db = getDb();

  // Get recently evaluated entities
  const recentEvals = db.query(`
    SELECT e.id, e.name, e.entity_type, e.website, ev.overall_score, ev.tier
    FROM entities e
    JOIN evaluations ev ON e.id = ev.entity_id
    WHERE e.source = ?
      AND ev.created_at >= datetime('now', '-1 hour')
    ORDER BY ev.overall_score DESC
  `).all(options.conference) as Entity[];

  db.close();

  // Organize by tier
  const results: BatchResult["results"] = {
    accept: recentEvals.filter(e => e.tier === "Accept"),
    maybe: recentEvals.filter(e => e.tier === "Maybe"),
    pass: recentEvals.filter(e => e.tier === "Pass"),
    tier1: recentEvals.filter(e => e.tier === "Tier 1"),
    tier2: recentEvals.filter(e => e.tier === "Tier 2"),
    tier3: recentEvals.filter(e => e.tier === "Tier 3"),
    tier4: recentEvals.filter(e => e.tier === "Tier 4"),
  };

  const batchResult: BatchResult = {
    conference: options.conference,
    date: new Date().toISOString().split('T')[0],
    type: options.type,
    entities_screened: recentEvals.length,
    from_cache: 0, // Would need to parse CLI output
    cost_estimate: options.type === "prescreen"
      ? recentEvals.length * 0.0007
      : recentEvals.length * 0.30,
    results,
    duration_seconds: duration,
  };

  // Save to History
  if (options.saveHistory !== false) {
    const filename = `${options.conference.replace(/\s+/g, '')}_${options.type}_${batchResult.date}.md`;
    const historyContent = generateBatchHistoryEntry(batchResult);
    const savedPath = saveToHistory(filename, historyContent);
    console.log(`\nSaved to History: ${savedPath}`);
  }

  return batchResult;
}

// ============================================================================
// Main CLI Entry Point
// ============================================================================

function backfillHistory(): { created: number; dates: string[] } {
  const db = getDb();

  // Get evaluations grouped by date and type
  const evalGroups = db.query(`
    SELECT
      date(ev.created_at) as eval_date,
      ev.evaluation_type,
      e.source as conference,
      COUNT(*) as total,
      SUM(CASE WHEN ev.tier = 'Accept' THEN 1 ELSE 0 END) as accept_count,
      SUM(CASE WHEN ev.tier = 'Maybe' THEN 1 ELSE 0 END) as maybe_count,
      SUM(CASE WHEN ev.tier = 'Pass' THEN 1 ELSE 0 END) as pass_count,
      SUM(CASE WHEN ev.tier = 'Tier 1' THEN 1 ELSE 0 END) as tier1_count,
      SUM(CASE WHEN ev.tier = 'Tier 2' THEN 1 ELSE 0 END) as tier2_count,
      SUM(CASE WHEN ev.tier = 'Tier 3' THEN 1 ELSE 0 END) as tier3_count,
      SUM(CASE WHEN ev.tier = 'Tier 4' THEN 1 ELSE 0 END) as tier4_count
    FROM evaluations ev
    JOIN entities e ON ev.entity_id = e.id
    WHERE ev.status = 'completed'
    GROUP BY date(ev.created_at), ev.evaluation_type, e.source
    ORDER BY eval_date DESC
  `).all() as any[];

  const createdFiles: string[] = [];

  for (const group of evalGroups) {
    const { eval_date, evaluation_type, conference, total, accept_count, maybe_count, pass_count, tier1_count, tier2_count, tier3_count, tier4_count } = group;

    // Get detailed results for this group
    const entities = db.query(`
      SELECT e.name, e.entity_type, e.website, ev.overall_score, ev.tier
      FROM evaluations ev
      JOIN entities e ON ev.entity_id = e.id
      WHERE date(ev.created_at) = ?
        AND ev.evaluation_type = ?
        AND e.source = ?
        AND ev.status = 'completed'
      ORDER BY ev.overall_score DESC
    `).all(eval_date, evaluation_type, conference) as Entity[];

    // Generate markdown
    const confName = conference || "Unknown";
    const confSlug = confName.replace(/\s+/g, "");

    let markdown = `# Batch Screening Results (Backfill)

**Conference:** ${confName}
**Date:** ${eval_date}
**Type:** ${evaluation_type}

## Summary

| Metric | Value |
|--------|-------|
| Entities screened | ${total} |
| Accept | ${accept_count} |
| Maybe | ${maybe_count} |
| Pass | ${pass_count} |
| Tier 1 | ${tier1_count} |
| Tier 2 | ${tier2_count} |

## Results by Tier

`;

    // Accept tier
    const accepts = entities.filter(e => e.tier === "Accept");
    if (accepts.length > 0) {
      markdown += `### Accept (${accepts.length})\n\n`;
      markdown += `| Company | Score | Website |\n|---------|-------|---------|\\n`;
      for (const e of accepts.slice(0, 20)) {
        markdown += `| ${e.name} | ${e.overall_score?.toFixed?.(1) || e.overall_score || "-"} | ${e.website || "-"} |\n`;
      }
      if (accepts.length > 20) markdown += `| ... and ${accepts.length - 20} more | | |\n`;
      markdown += `\n`;
    }

    // Tier 1
    const tier1 = entities.filter(e => e.tier === "Tier 1");
    if (tier1.length > 0) {
      markdown += `### Tier 1 Investors (${tier1.length})\n\n`;
      markdown += `| Investor | Score |\n|----------|-------|\n`;
      for (const e of tier1.slice(0, 20)) {
        markdown += `| ${e.name} | ${e.overall_score?.toFixed?.(1) || e.overall_score || "-"} |\n`;
      }
      if (tier1.length > 20) markdown += `| ... and ${tier1.length - 20} more | |\n`;
      markdown += `\n`;
    }

    // Maybe tier
    const maybes = entities.filter(e => e.tier === "Maybe");
    if (maybes.length > 0) {
      markdown += `### Maybe (${maybes.length})\n\n`;
      markdown += `| Entity | Score |\n|--------|-------|\n`;
      for (const e of maybes.slice(0, 10)) {
        markdown += `| ${e.name} | ${e.overall_score?.toFixed?.(1) || e.overall_score || "-"} |\n`;
      }
      if (maybes.length > 10) markdown += `| ... and ${maybes.length - 10} more | |\n`;
      markdown += `\n`;
    }

    // Tier 2
    const tier2 = entities.filter(e => e.tier === "Tier 2");
    if (tier2.length > 0) {
      markdown += `### Tier 2 (${tier2.length})\n\n`;
      markdown += `| Entity | Score |\n|--------|-------|\n`;
      for (const e of tier2.slice(0, 10)) {
        markdown += `| ${e.name} | ${e.overall_score?.toFixed?.(1) || e.overall_score || "-"} |\n`;
      }
      if (tier2.length > 10) markdown += `| ... and ${tier2.length - 10} more | |\n`;
      markdown += `\n`;
    }

    markdown += `---\n*Backfilled from LVV database on ${new Date().toISOString().split("T")[0]}*\n`;

    // Save to History
    const month = eval_date.slice(0, 7);
    const historyPath = join(CONFIG.historyBase, month);
    if (!existsSync(historyPath)) {
      mkdirSync(historyPath, { recursive: true });
    }

    const filename = `${confSlug}_${evaluation_type}_${eval_date}.md`;
    const fullPath = join(historyPath, filename);

    // Only create if doesn't exist
    if (!existsSync(fullPath)) {
      writeFileSync(fullPath, markdown);
      createdFiles.push(fullPath);
    }
  }

  db.close();

  return {
    created: createdFiles.length,
    dates: [...new Set(evalGroups.map(g => g.eval_date))],
  };
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    console.log(`
LVV CLI Wrapper - PAI-Native TypeScript Interface

Usage: bun run LvvCli.ts <command> [options]

Commands:
  stats                     Database statistics as JSON
  query [options]           Query entities with filters
  screen [options]          Run batch evaluation with History save
  history [limit]           List recent History entries
  backfill                  Backfill History from existing evaluations

Query Options:
  --conference <name>       Filter by conference
  --type <company|investor> Filter by entity type
  --tier <tier>             Filter by tier
  --limit <n>               Limit results
  --unevaluated             Only show unevaluated entities

Screen Options:
  --conference <name>       Conference name (required)
  --eval-type <type>        prescreen or full_evaluation
  --entity-type <type>      company or investor
  --no-history              Skip History save

Examples:
  bun run LvvCli.ts stats
  bun run LvvCli.ts query --conference "JPM 2025" --tier "Accept"
  bun run LvvCli.ts screen --conference "JPM 2025" --eval-type prescreen
  bun run LvvCli.ts history 5
`);
    return;
  }

  try {
    switch (command) {
      case "stats": {
        const stats = getStats();
        console.log(JSON.stringify(stats, null, 2));
        break;
      }

      case "query": {
        const options: Parameters<typeof queryEntities>[0] = {};

        for (let i = 1; i < args.length; i++) {
          switch (args[i]) {
            case "--conference":
              options.conference = args[++i];
              break;
            case "--type":
            case "--entity-type":
              options.entityType = args[++i];
              break;
            case "--tier":
              options.tier = args[++i];
              break;
            case "--limit":
              options.limit = parseInt(args[++i]);
              break;
            case "--unevaluated":
              options.unevaluated = true;
              break;
          }
        }

        const entities = queryEntities(options);
        console.log(JSON.stringify(entities, null, 2));
        break;
      }

      case "screen": {
        let conference = "";
        let evalType: "prescreen" | "full_evaluation" = "prescreen";
        let entityType: string | undefined;
        let saveHistory = true;

        for (let i = 1; i < args.length; i++) {
          switch (args[i]) {
            case "--conference":
              conference = args[++i];
              break;
            case "--eval-type":
              evalType = args[++i] as "prescreen" | "full_evaluation";
              break;
            case "--entity-type":
              entityType = args[++i];
              break;
            case "--no-history":
              saveHistory = false;
              break;
          }
        }

        if (!conference) {
          console.error("Error: --conference is required");
          process.exit(1);
        }

        const result = await runScreen({
          conference,
          type: evalType,
          entityType,
          saveHistory,
        });

        console.log(JSON.stringify(result, null, 2));
        break;
      }

      case "history": {
        const limit = parseInt(args[1]) || 10;
        const entries = listHistoryEntries(limit);

        if (entries.length === 0) {
          console.log("No History entries found.");
        } else {
          console.log("Recent LVV History Entries:\n");
          for (const entry of entries) {
            console.log(`  ${entry.date}  ${entry.file}`);
          }
        }
        break;
      }

      case "backfill": {
        console.log("Backfilling History from existing evaluations...\n");
        const result = backfillHistory();

        if (result.created === 0) {
          console.log("No new History entries created (already up to date or no evaluations found).");
        } else {
          console.log(`Created ${result.created} History entries for dates:`);
          for (const date of result.dates) {
            console.log(`  - ${date}`);
          }
          console.log(`\nHistory entries saved to: ~/.claude/History/Execution/`);
        }
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        console.log("Run with --help for usage information.");
        process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
