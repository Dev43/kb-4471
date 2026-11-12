<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import tickets from '#lib/data/tickets-4471.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { groupByProblem, type Problem } from '#lib/kb/problems';

  let { ticket }: { ticket: number } = $props();

  const rows = reports as Report[];
  const unique = uniqueById(rows);
  const merged = $derived(unique.filter((r) => r.mergedInto === ticket));
  const groups = $derived(groupByProblem(merged, tenantOf, notes.oneDayMove));
  const sum = $derived(groups.reduce((n, g) => n + g.reports.length, 0));
  const issue = (p: Problem): number | null => (tickets.repo && (tickets as Record<string, number | null>)[p]) || null;
</script>

<p class="sum">
  <strong>{rows.length}</strong> rows in the export · <strong>{unique.length}</strong> unique reports ·
  <strong>{rows.length - unique.length}</strong> duplicates dropped · <strong>{merged.length}</strong> merged into #{ticket} ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      {@const n = issue(g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if n}<a href="https://github.com/{tickets.repo}/issues/{n}">#{n}</a>{:else}<span class="todo">not filed yet</span>{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<p class="note">
  {groups.map((g) => g.reports.length).join(' + ')} = {sum}:
  {sum === merged.length ? `the problems add up to the ${merged.length} reports merged into #${ticket}.` : `does not match the ${merged.length} reports merged into #${ticket}.`}
</p>

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
  .todo { color: var(--warn); }
</style>
