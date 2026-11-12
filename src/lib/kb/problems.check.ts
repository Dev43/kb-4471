// Self-check on the real export: `npm run check`. Tenants load from disk here because
// locales.ts needs Vite's import.meta.glob.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { uniqueById, type Report, type Tenant } from './causes.ts';
import { groupByProblem } from './problems.ts';

const data = (p: string) => JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url), 'utf8'));
const tenants = new Map<string, Tenant>(
  readdirSync(new URL('../data/tenants/', import.meta.url)).map((f) => [data(`tenants/${f}`).handle, data(`tenants/${f}`)]),
);

const merged = uniqueById(data('reports-4471.json') as Report[]).filter((r) => r.mergedInto === 4471);
const groups = groupByProblem(merged, (r) => tenants.get(r.tenant), data('desk-notes.json').oneDayMove);
const counts = Object.fromEntries(groups.map((g) => [g.problem, g.reports.length]));

assert.equal(groups.reduce((n, g) => n + g.reports.length, 0), merged.length);
assert.deepEqual(counts, { parser: 374, hint: 33, 'one-day-move': 5 });
console.log(`ok: ${merged.length} merged =`, counts);
