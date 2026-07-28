import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { ClipboardList, Clock, CheckCircle2, AlertTriangle, HardHat, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Feedback';
import { EmptyState } from '@/components/ui/EmptyState';
import { ComplaintCard } from '@/components/complaints/ComplaintCard';
import { fetchComplaints, fetchDepartments, fetchWorkersByDepartment } from '@/services/api';
import { computeStats, complaintsByCategory, complaintsByWard } from '@/services/stats';
import type { Complaint, Department, Worker } from '@/services/types';
import { DEPARTMENTS } from '@/services/constants';

const PIE_COLORS = ['#64748b', '#3b82f6', '#f59e0b', '#10b981', '#f43f5e'];

export function DepartmentDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const slug = searchParams.get('dept') ?? 'waste';
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments().then(setDepartments).catch(() => undefined);
  }, []);

  const dept = useMemo(() => departments.find((d) => d.slug === slug), [departments, slug]);

  useEffect(() => {
    if (!dept) return;
    setLoading(true);
    Promise.all([fetchComplaints({ departmentId: dept.id, limit: 200 }), fetchWorkersByDepartment(dept.id)])
      .then(([c, w]) => { setComplaints(c); setWorkers(w); })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [dept]);

  const stats = computeStats(complaints);
  const byCategory = complaintsByCategory(complaints);
  const byWard = complaintsByWard(complaints);
  const pending = complaints.filter((c) => c.status === 'submitted' || c.status === 'assigned');
  const inProgress = complaints.filter((c) => c.status === 'in_progress');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Dashboard"
        subtitle={dept ? dept.name : 'Select a department'}
        actions={
          <select
            value={slug}
            onChange={(e) => setSearchParams({ dept: e.target.value })}
            className="h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d.slug} value={d.slug}>{d.name}</option>
            ))}
          </select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard index={0} label="Total" value={stats.total} icon={ClipboardList} accent="text-blue-600" />
            <StatCard index={1} label="Pending" value={pending.length} icon={Clock} accent="text-amber-600" />
            <StatCard index={2} label="In Progress" value={inProgress.length} icon={AlertTriangle} accent="text-teal-600" />
            <StatCard index={3} label="Resolved" value={stats.resolved} icon={CheckCircle2} accent="text-emerald-600" delta={`${stats.resolutionRate}% rate`} />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Pending & In-Progress Complaints</CardTitle>
            <Link to={`/app/complaints?dept=${slug}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
            ) : pending.length + inProgress.length === 0 ? (
              <EmptyState icon={<CheckCircle2 className="h-7 w-7" />} title="All caught up" description="No pending or in-progress complaints for this department." />
            ) : (
              <div className="space-y-3">
                {[...pending, ...inProgress].slice(0, 5).map((c, i) => <ComplaintCard key={c.id} complaint={c} index={i} />)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><HardHat className="h-4 w-4 text-amber-600" /> Workers</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {workers.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No workers assigned yet.</p>
            ) : (
              workers.map((w) => (
                <div key={w.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{w.profile?.full_name ?? 'Worker'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{w.ward || 'No ward'}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    w.availability === 'available' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                    w.availability === 'busy' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
                    'bg-slate-100 text-slate-500 dark:bg-slate-800'
                  }`}>{w.availability}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>By Category</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64" /> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={byCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                  <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Status Split</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64" /> : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Submitted', value: stats.submitted },
                      { name: 'Assigned', value: stats.assigned },
                      { name: 'In Progress', value: stats.inProgress },
                      { name: 'Resolved', value: stats.resolved },
                      { name: 'Rejected', value: stats.rejected },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {PIE_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {byWard.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Ward-wise Complaints</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byWard}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
