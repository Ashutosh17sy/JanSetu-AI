import { useEffect, useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Download, TrendingUp, Clock, MapPin, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Feedback';
import { Button } from '@/components/ui/Button';
import { fetchComplaints, fetchAllWorkers } from '@/services/api';
import {
  computeStats,
  complaintsTrend,
  complaintsByCategory,
  complaintsByDepartment,
  complaintsByWard,
} from '@/services/stats';
import { downloadCSV } from '@/services/utils';
import type { Complaint, Worker } from '@/services/types';

export function AnalyticsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchComplaints({ limit: 500 }), fetchAllWorkers()])
      .then(([c, w]) => { setComplaints(c); setWorkers(w); })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const stats = computeStats(complaints);
  const trend = complaintsTrend(complaints, 6);
  const byCategory = complaintsByCategory(complaints);
  const byDept = complaintsByDepartment(complaints);
  const byWard = complaintsByWard(complaints);

  const workerPerf = useMemo(
    () =>
      workers
        .map((w) => ({
          name: w.profile?.full_name?.split(' ')[0] ?? 'Worker',
          resolved: w.total_resolved,
          assigned: w.total_assigned,
          rating: Number(w.rating),
        }))
        .sort((a, b) => b.resolved - a.resolved)
        .slice(0, 8),
    [workers],
  );

  const deptRadar = byDept.map((d) => ({ department: d.name.split(' ')[0], complaints: d.count }));

  const exportReport = () => {
    downloadCSV('jansetu-analytics.csv', byCategory.map((c) => ({ category: c.name, count: c.count })));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Deep dive into complaint trends, department performance and worker efficiency."
        actions={
          <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={exportReport}>
            Export
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard index={0} label="Resolution Rate" value={`${stats.resolutionRate}%`} icon={TrendingUp} accent="text-emerald-600" />
            <StatCard index={1} label="Avg Resolution" value={stats.avgResolutionHours ? `${stats.avgResolutionHours}h` : '—'} icon={Clock} accent="text-blue-600" />
            <StatCard index={2} label="Total Wards" value={byWard.length} icon={MapPin} accent="text-teal-600" />
            <StatCard index={3} label="Active Workers" value={workers.length} icon={Users} accent="text-violet-600" />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Complaint Trend</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-72" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                  <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="Complaints" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Complaints by Category</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-72" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={120} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                  <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Department Load (Radar)</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-72" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={deptRadar}>
                  <PolarGrid stroke="#e2e8f0" className="dark:opacity-20" />
                  <PolarAngleAxis dataKey="department" stroke="#94a3b8" fontSize={11} />
                  <PolarRadiusAxis stroke="#94a3b8" fontSize={10} />
                  <Radar dataKey="complaints" stroke="#0d9488" fill="#0d9488" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Worker Efficiency</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-72" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={workerPerf}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="assigned" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Assigned" />
                  <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Ward-wise Reports</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-64" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byWard}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
