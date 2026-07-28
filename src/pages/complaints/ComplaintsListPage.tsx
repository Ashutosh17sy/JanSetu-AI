import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Download, Inbox } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Feedback';
import { Pagination } from '@/components/ui/Pagination';
import { ComplaintCard } from '@/components/complaints/ComplaintCard';
import { useAuth } from '@/hooks/useAuth';
import { fetchComplaints } from '@/services/api';
import { CATEGORIES } from '@/services/constants';
import { downloadCSV } from '@/services/utils';
import type { Complaint, ComplaintStatus, UserRole } from '@/services/types';

const PAGE_SIZE = 9;

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

export function ComplaintsListPage() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>(searchParams.get('status') ?? '');
  const [category, setCategory] = useState<string>('');
  const [page, setPage] = useState(1);

  const role: UserRole = profile?.role ?? 'citizen';

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    const filters: Parameters<typeof fetchComplaints>[0] = {
      status: (status || undefined) as ComplaintStatus | undefined,
      categorySlug: category || undefined,
      search: search || undefined,
    };
    if (role === 'citizen') filters.userId = profile.id;
    fetchComplaints(filters)
      .then(setComplaints)
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false));
  }, [profile, role, status, category, search]);

  const filtered = useMemo(() => {
    if (role === 'worker' && profile) {
      return complaints.filter((c) => c.assigned_worker?.profile_id === profile.id);
    }
    return complaints;
  }, [complaints, role, profile]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCSV = () => {
    downloadCSV('jansetu-complaints.csv', filtered.map((c) => ({
      ticket: c.ticket_number,
      title: c.title,
      category: c.category,
      status: c.status,
      severity: c.severity,
      priority: c.priority,
      department: c.department?.name ?? '',
      ward: c.ward,
      created: c.created_at,
    })));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={role === 'citizen' ? 'My Complaints' : 'All Complaints'}
        subtitle={`${filtered.length} complaint${filtered.length !== 1 ? 's' : ''}`}
        actions={
          <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={exportCSV} disabled={!filtered.length}>
            Export CSV
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by title, ticket, or description…"
                className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex gap-2">
              <Select
                className="w-auto min-w-[140px]"
                options={STATUS_OPTIONS}
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              />
              <Select
                className="w-auto min-w-[160px]"
                options={[{ value: '', label: 'All categories' }, ...CATEGORIES.map((c) => ({ value: c.slug, label: c.name }))]}
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : pageItems.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-7 w-7" />}
              title="No complaints found"
              description="Try adjusting your filters or search query."
            />
          ) : (
            <>
              <div className="space-y-3">
                {pageItems.map((c, i) => (
                  <ComplaintCard key={c.id} complaint={c} index={i} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
