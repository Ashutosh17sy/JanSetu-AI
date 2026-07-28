import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, ListChecks, CheckCircle2, Clock, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Feedback';
import { EmptyState } from '@/components/ui/EmptyState';
import { ComplaintCard } from '@/components/complaints/ComplaintCard';
import { useAuth } from '@/hooks/useAuth';
import { fetchComplaints } from '@/services/api';
import { computeStats, complaintsTrend } from '@/services/stats';
import type { Complaint } from '@/services/types';
import { STATUS_META } from '@/services/constants';
import { Link as ReactLink } from 'react-router-dom';

export function CitizenDashboard() {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    fetchComplaints({ userId: profile.id })
      .then(setComplaints)
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false));
  }, [profile?.id]);

  const stats = computeStats(complaints);
  const trend = complaintsTrend(complaints, 6);
  const maxTrend = Math.max(...trend.map((t) => t.count), 1);
  const recent = complaints.slice(0, 5);

  const statusBreakdown = [
    { key: 'submitted', label: 'Submitted', value: stats.submitted },
    { key: 'assigned', label: 'Assigned', value: stats.assigned },
    { key: 'in_progress', label: 'In Progress', value: stats.inProgress },
    { key: 'resolved', label: 'Resolved', value: stats.resolved },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${profile?.full_name?.split(' ')[0] || 'Citizen'}`}
        subtitle="Here's the status of your civic complaints."
        actions={
          <Link to="/app/complaints/new">
            <Button leftIcon={<PlusCircle className="h-4 w-4" />}>New Complaint</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard index={0} label="Total Complaints" value={stats.total} icon={ListChecks} accent="text-blue-600" />
            <StatCard index={1} label="In Progress" value={stats.inProgress + stats.assigned} icon={Clock} accent="text-amber-600" />
            <StatCard index={2} label="Resolved" value={stats.resolved} icon={CheckCircle2} accent="text-emerald-600" />
            <StatCard index={3} label="High Priority" value={stats.highPriorityCount} icon={AlertTriangle} accent="text-rose-600" />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent complaints */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Recent Complaints</CardTitle>
              <Link to="/app/complaints" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
                </div>
              ) : recent.length === 0 ? (
                <EmptyState
                  icon={<PlusCircle className="h-7 w-7" />}
                  title="No complaints yet"
                  description="Report your first civic issue and let AI handle the rest."
                  action={
                    <Link to="/app/complaints/new">
                      <Button size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>New Complaint</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {recent.map((c, i) => (
                    <ComplaintCard key={c.id} complaint={c} index={i} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {statusBreakdown.map((s) => {
                const meta = STATUS_META[s.key];
                const pct = stats.total ? Math.round((s.value / stats.total) * 100) : 0;
                return (
                  <div key={s.key}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                        {s.label}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">{s.value}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full rounded-full ${meta.dot}`}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                6-Month Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-32">
                {trend.map((t, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(t.count / maxTrend) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.06 }}
                      className="w-full min-h-1 rounded-t bg-gradient-to-t from-blue-600 to-teal-400"
                      style={{ minHeight: t.count > 0 ? '4px' : '2px' }}
                    />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{t.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col items-start justify-between gap-4 bg-gradient-to-br from-blue-600 to-teal-500 p-6 text-white sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-bold">Spot a civic issue?</h3>
            <p className="mt-1 text-sm text-blue-100/90">Snap a photo, drop a pin, and let AI do the triage.</p>
          </div>
          <ReactLink to="/app/complaints/new">
            <Button variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Report now
            </Button>
          </ReactLink>
        </div>
      </Card>
    </div>
  );
}
