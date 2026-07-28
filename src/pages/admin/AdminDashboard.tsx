import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarDays,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Feedback';
import { ComplaintRow } from '@/components/complaints/ComplaintCard';
import { fetchComplaints } from '@/services/api';
import {
  computeStats,
  complaintsTrend,
  complaintsByDepartment,
  complaintsByWard,
} from '@/services/stats';
import type { Complaint } from '@/services/types';

const PIE_COLORS = ['#64748b', '#3b82f6', '#f59e0b', '#10b981', '#f43f5e'];

export function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints({ limit: 200 })
      .then(setComplaints)
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = computeStats(complaints);
  const trend = complaintsTrend(complaints, 6);
  const byDept = complaintsByDepartment(complaints);
  const byWard = complaintsByWard(complaints);
  const byStatus = [
    { name: 'Submitted', value: stats.submitted },
    { name: 'Assigned', value: stats.assigned },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Resolved', value: stats.resolved },
    { name: 'Rejected', value: stats.rejected },
  ];
  const recent = complaints.slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Municipal-wide overview of civic complaints and performance."
        actions={
          <Link to="/app/analytics">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>View analytics</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard index={0} label="Total Complaints" value={stats.total} icon={ClipboardList} accent="text-blue-600" />
            <StatCard index={1} label="Pending" value={stats.submitted + stats.assigned} icon={Clock} accent="text-amber-600" />
            <StatCard index={2} label="Resolved" value={stats.resolved} icon={CheckCircle2} accent="text-emerald-600" delta={`${stats.resolutionRate}% rate`} />
            <StatCard index={3} label="Rejected" value={stats.rejected} icon={XCircle} accent="text-rose-600" />
            <StatCard index={4} label="Today" value={stats.todayCount} icon={CalendarDays} accent="text-violet-600" />
            <StatCard index={5} label="In Progress" value={stats.inProgress} icon={Activity} accent="text-teal-600" />
            <StatCard index={6} label="Critical" value={stats.criticalCount} icon={AlertTriangle} accent="text-rose-600" />
            <StatCard index={7} label="Avg Resolution" value={stats.avgResolutionHours ? `${stats.avgResolutionHours}h` : '—'} icon={TrendingUp} accent="text-emerald-600" />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Complaint Trends (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-72" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                  <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} fill="url(#g)" name="Complaints" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {byStatus.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Complaints by Department</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byDept} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={110} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                  <Bar dataKey="count" fill="#0d9488" radius={[0, 6, 6, 0]} name="Complaints" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Problematic Wards</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byWard}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Complaints" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Link to="/app/complaints" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">No recent activity.</p>
          ) : (
            recent.map((c) => <ComplaintRow key={c.id} complaint={c} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
