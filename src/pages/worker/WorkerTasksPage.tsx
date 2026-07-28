import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Camera, MapPin, CheckCircle2, Navigation } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Feedback';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadges';
import { useAuth } from '@/hooks/useAuth';
import { fetchComplaints, fetchAllWorkers } from '@/services/api';
import type { Complaint } from '@/services/types';
import { timeAgo } from '@/services/utils';

export function WorkerTasksPage() {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    fetchAllWorkers()
      .then((workers) => {
        const me = workers.find((w) => w.profile_id === profile.id);
        return me ? fetchComplaints({ workerId: me.id, limit: 100 }) : [];
      })
      .then((c) => setComplaints(c as Complaint[]))
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false));
  }, [profile?.id]);

  const active = complaints.filter((c) => c.status === 'assigned' || c.status === 'in_progress');
  const done = complaints.filter((c) => c.status === 'resolved');

  return (
    <div className="space-y-6">
      <PageHeader title="My Tasks" subtitle={`${active.length} active · ${done.length} completed`} />

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-blue-600" /> Active Tasks</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
          ) : active.length === 0 ? (
            <EmptyState icon={<CheckCircle2 className="h-7 w-7" />} title="No active tasks" description="You're all caught up." />
          ) : (
            <div className="space-y-3">
              {active.map((c) => (
                <div key={c.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-slate-900 dark:text-white">{c.title}</p>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{c.ticket_number} · {timeAgo(c.created_at)}</p>
                    {c.address && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3 w-3" /> {c.address}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {c.latitude != null && c.longitude != null && (
                      <a
                        href={`https://www.openstreetmap.org/directions?from=&to=${c.latitude}%2C${c.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button variant="outline" size="sm" leftIcon={<Navigation className="h-4 w-4" />}>Navigate</Button>
                      </a>
                    )}
                    <Link to={`/app/tasks/${c.id}`}>
                      <Button size="sm" leftIcon={<Camera className="h-4 w-4" />}>
                        {c.status === 'in_progress' ? 'Continue' : 'Start'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {done.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Completed Tasks</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {done.slice(0, 6).map((c) => (
              <Link key={c.id} to={`/app/complaints/${c.id}`} className="block rounded-lg border border-slate-200 dark:border-slate-800 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{c.title}</p>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{c.ticket_number} · {timeAgo(c.created_at)}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
