import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Feedback';
import { EmptyState } from '@/components/ui/EmptyState';
import { ComplaintCard } from '@/components/complaints/ComplaintCard';
import { useAuth } from '@/hooks/useAuth';
import { fetchComplaints, fetchAllWorkers } from '@/services/api';
import type { Complaint, Worker } from '@/services/types';

export function WorkerDashboard() {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    Promise.all([fetchAllWorkers()])
      .then(([workers]) => {
        const me = workers.find((w) => w.profile_id === profile.id) ?? null;
        setWorker(me);
        if (me) return fetchComplaints({ workerId: me.id, limit: 100 });
        return [];
      })
      .then((c) => setComplaints(c as Complaint[]))
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false));
  }, [profile?.id]);

  const assigned = complaints.filter((c) => c.status === 'assigned');
  const inProgress = complaints.filter((c) => c.status === 'in_progress');
  const resolved = complaints.filter((c) => c.status === 'resolved');

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${profile?.full_name?.split(' ')[0] || 'Worker'}`}
        subtitle="Your assigned tasks and field work."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard index={0} label="Assigned" value={assigned.length} icon={Briefcase} accent="text-blue-600" />
            <StatCard index={1} label="In Progress" value={inProgress.length} icon={Clock} accent="text-amber-600" />
            <StatCard index={2} label="Resolved" value={resolved.length} icon={CheckCircle2} accent="text-emerald-600" />
            <StatCard index={3} label="Rating" value={worker?.rating ? `${worker.rating}★` : '—'} icon={AlertTriangle} accent="text-violet-600" />
          </>
        )}
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Active Tasks</CardTitle>
          <Link to="/app/tasks" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
            All tasks <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
          ) : assigned.length + inProgress.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="h-7 w-7" />}
              title="No active tasks"
              description="When officers assign you complaints, they'll appear here."
            />
          ) : (
            <div className="space-y-3">
              {[...assigned, ...inProgress].slice(0, 5).map((c, i) => <ComplaintCard key={c.id} complaint={c} index={i} />)}
            </div>
          )}
        </CardContent>
      </Card>

      {resolved.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recently Resolved</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {resolved.slice(0, 4).map((c, i) => <ComplaintCard key={c.id} complaint={c} index={i} />)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
