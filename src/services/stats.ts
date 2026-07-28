import type { Complaint, ComplaintStatus } from '@/services/types';

export interface ComplaintStats {
  total: number;
  submitted: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  todayCount: number;
  criticalCount: number;
  highPriorityCount: number;
  resolutionRate: number;
  avgResolutionHours: number | null;
}

export function computeStats(complaints: Complaint[]): ComplaintStats {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const by = (s: ComplaintStatus) => complaints.filter((c) => c.status === s).length;
  const resolved = complaints.filter((c) => c.status === 'resolved' && c.resolved_at && c.created_at);
  const resolutionHours = resolved.map((c) =>
    (new Date(c.resolved_at!).getTime() - new Date(c.created_at).getTime()) / 3_600_000,
  );
  const avg = resolutionHours.length ? resolutionHours.reduce((a, b) => a + b, 0) / resolutionHours.length : null;

  return {
    total: complaints.length,
    submitted: by('submitted'),
    assigned: by('assigned'),
    inProgress: by('in_progress'),
    resolved: by('resolved'),
    rejected: by('rejected'),
    todayCount: complaints.filter((c) => c.created_at >= startOfToday).length,
    criticalCount: complaints.filter((c) => c.severity === 'critical').length,
    highPriorityCount: complaints.filter((c) => c.priority === 'high' || c.priority === 'urgent').length,
    resolutionRate: complaints.length ? Math.round((by('resolved') / complaints.length) * 100) : 0,
    avgResolutionHours: avg ? Math.round(avg * 10) / 10 : null,
  };
}

export function complaintsByCategory(complaints: Complaint[]): { name: string; count: number }[] {
  const map = new Map<string, number>();
  complaints.forEach((c) => map.set(c.category, (map.get(c.category) ?? 0) + 1));
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function complaintsByStatus(complaints: Complaint[]): { name: string; count: number }[] {
  const statuses: ComplaintStatus[] = ['submitted', 'assigned', 'in_progress', 'resolved', 'rejected'];
  return statuses.map((s) => ({ name: s.replace('_', ' '), count: complaints.filter((c) => c.status === s).length }));
}

export function complaintsByDepartment(complaints: Complaint[]): { name: string; count: number }[] {
  const map = new Map<string, number>();
  complaints.forEach((c) => {
    const name = c.department?.name ?? 'Unassigned';
    map.set(name, (map.get(name) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
}

export function complaintsByWard(complaints: Complaint[]): { name: string; count: number }[] {
  const map = new Map<string, number>();
  complaints.forEach((c) => {
    const w = c.ward || 'Unknown';
    map.set(w, (map.get(w) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function complaintsTrend(complaints: Complaint[], months = 6): { name: string; count: number }[] {
  const now = new Date();
  const buckets: { name: string; key: string; count: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ name: d.toLocaleString('en', { month: 'short' }), key: `${d.getFullYear()}-${d.getMonth()}`, count: 0 });
  }
  complaints.forEach((c) => {
    const d = new Date(c.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.count++;
  });
  return buckets.map(({ name, count }) => ({ name, count }));
}
