import { useEffect, useState } from 'react';
import {
  Wrench,
  Mail,
  Phone,
  Plus,
  UserPlus,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { fetchDepartments, fetchAllWorkers, fetchProfiles, createWorker } from '@/services/api';
import { DEPARTMENTS } from '@/services/constants';
import type { Department, Worker, Profile } from '@/services/types';

export function DepartmentsPage() {
  const toast = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [workerProfile, setWorkerProfile] = useState('');
  const [workerWard, setWorkerWard] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetchDepartments(), fetchAllWorkers(), fetchProfiles('worker')])
      .then(([d, w, p]) => { setDepartments(d); setWorkers(w); setProfiles(p); })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const workerCount = (deptId: string) => workers.filter((w) => w.department_id === deptId).length;

  const addWorker = async () => {
    if (!selectedDept || !workerProfile) return;
    setSaving(true);
    try {
      await createWorker(workerProfile, selectedDept.id, workerWard);
      toast.success('Worker added', 'The worker has been assigned to this department.');
      setWorkers(await fetchAllWorkers());
      setAddOpen(false);
      setWorkerProfile('');
      setWorkerWard('');
    } catch (err) {
      toast.error('Failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        subtitle="Municipal departments and their field workers."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setSelectedDept(departments[0] ?? null); setAddOpen(true); }}>
            Add worker
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => {
            const deptWorkers = workers.filter((w) => w.department_id === dept.id);
            const meta = DEPARTMENTS.find((d) => d.slug === dept.slug);
            const Icon = meta ? (Icons[meta.icon as keyof typeof Icons] as Icons.LucideIcon) : Icons.Building2;
            return (
              <Card key={dept.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      {dept.name}
                    </CardTitle>
                    <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {workerCount(dept.id)} workers
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{dept.description}</p>
                  {dept.head_name && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Head: <span className="font-medium text-slate-900 dark:text-white">{dept.head_name}</span>
                    </p>
                  )}
                  <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                    {dept.contact_email && (
                      <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Mail className="h-3.5 w-3.5" /> {dept.contact_email}
                      </p>
                    )}
                    {dept.contact_phone && (
                      <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Phone className="h-3.5 w-3.5" /> {dept.contact_phone}
                      </p>
                    )}
                  </div>

                  {deptWorkers.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                      <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Workers</p>
                      <div className="space-y-1.5">
                        {deptWorkers.slice(0, 4).map((w) => (
                          <div key={w.id} className="flex items-center justify-between text-sm">
                            <span className="text-slate-700 dark:text-slate-300">{w.profile?.full_name ?? 'Worker'}</span>
                            <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              {w.active_complaints} active
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    leftIcon={<UserPlus className="h-4 w-4" />}
                    onClick={() => { setSelectedDept(dept); setAddOpen(true); }}
                  >
                    Add worker
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add field worker"
        description={selectedDept ? `Assign a worker to ${selectedDept.name}` : ''}
        footer={
          <>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addWorker} loading={saving} disabled={!workerProfile}>Add worker</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select user</label>
            <select
              className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100"
              value={workerProfile}
              onChange={(e) => setWorkerProfile(e.target.value)}
            >
              <option value="">Choose a user…</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
              ))}
            </select>
            {profiles.length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                No users with the Worker role yet. Ask users to sign up as Field Workers.
              </p>
            )}
          </div>
          <Input label="Ward (optional)" placeholder="Ward 12" value={workerWard} onChange={(e) => setWorkerWard(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}

export function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllWorkers()
      .then(setWorkers)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Field Workers" subtitle={`${workers.length} workers across all departments`} />
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : workers.length === 0 ? (
        <Card><CardContent><p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No workers yet. Add them from the Departments page.</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workers.map((w) => (
            <Card key={w.id}>
              <CardContent className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                  <Wrench className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{w.profile?.full_name ?? 'Worker'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{w.department?.name ?? 'No department'}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{w.active_complaints} active</Badge>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{w.total_resolved} resolved</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
