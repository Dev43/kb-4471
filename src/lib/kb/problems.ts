// The problems inside one ticket. A cause from causes.ts, unless the desk listed the report as a
// one-day move (desk-notes.json): those reports form their own problem, cause not confirmed.
// Relative .ts imports so `npm run check` can run this file under plain Node.
import { causeOf, type Report, type Tenant } from './causes.ts';

export type Problem = 'parser' | 'hint' | 'one-day-move' | 'unplaced';

export function problemOf(r: Report, t: Tenant | undefined, oneDayMoveIds: readonly string[]): Problem {
  if (oneDayMoveIds.includes(r.id)) return 'one-day-move';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = { problem: Problem; reports: Report[]; tenants: number; firstSeen: string; lastSeen: string };

export function groupByProblem(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMoveIds: readonly string[],
): ProblemGroup[] {
  const by = new Map<Problem, Report[]>();
  for (const r of reports) {
    const p = problemOf(r, tenantOf(r), oneDayMoveIds);
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  return [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return { problem, reports: rs, tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
