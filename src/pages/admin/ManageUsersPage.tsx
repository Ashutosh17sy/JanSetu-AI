import { useEffect, useState, useMemo } from 'react';
import { Search, Users as UsersIcon, UserCheck, Shield } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Feedback';
import { EmptyState } from '@/components/ui/EmptyState';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { fetchProfiles, updateProfile } from '@/services/api';
import { ROLE_META } from '@/services/constants';
import { formatDate } from '@/services/utils';
import type { Profile, UserRole } from '@/services/types';

export function ManageUsersPage() {
  const { profile: me } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('citizen');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfiles()
      .then(setUsers)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          (!roleFilter || u.role === roleFilter) &&
          (!search || u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())),
      ),
    [users, search, roleFilter],
  );

  const counts = {
    total: users.length,
    citizens: users.filter((u) => u.role === 'citizen').length,
    staff: users.filter((u) => u.role !== 'citizen').length,
    active: users.filter((u) => u.active).length,
  };

  const openEdit = (u: Profile) => {
    setEditUser(u);
    setEditRole(u.role);
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await updateProfile(editUser.id, { role: editRole });
      setUsers((prev) => prev.map((u) => (u.id === editUser.id ? { ...u, role: editRole } : u)));
      toast.success('User updated', `${editUser.full_name || editUser.email} is now ${ROLE_META[editRole].label}.`);
      setEditUser(null);
    } catch (err) {
      toast.error('Update failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: Profile) => {
    try {
      await updateProfile(u.id, { active: !u.active });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, active: !u.active } : x)));
      toast.success(u.active ? 'User deactivated' : 'User activated');
    } catch (err) {
      toast.error('Failed', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const columns: Column<Profile>[] = [
    {
      key: 'name',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-teal-500 text-sm font-semibold text-white">
            {u.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{u.full_name || 'Unnamed'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => {
        const m = ROLE_META[u.role];
        return <Badge className={`${m.bg} ${m.color}`}>{m.label}</Badge>;
      },
    },
    { key: 'ward', header: 'Ward', render: (u) => <span className="text-slate-600 dark:text-slate-400">{u.ward || '—'}</span> },
    {
      key: 'active',
      header: 'Status',
      render: (u) => (
        <Badge className={u.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'} dot={u.active ? 'bg-emerald-500' : 'bg-slate-400'}>
          {u.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    { key: 'joined', header: 'Joined', render: (u) => <span className="text-slate-600 dark:text-slate-400">{formatDate(u.created_at)}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (u) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => openEdit(u)} disabled={u.id === me?.id}>
            Edit role
          </Button>
          <Button size="sm" variant={u.active ? 'ghost' : 'success'} onClick={() => toggleActive(u)} disabled={u.id === me?.id}>
            {u.active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Manage Users" subtitle="View and manage all platform users." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard index={0} label="Total Users" value={counts.total} icon={UsersIcon} accent="text-blue-600" />
            <StatCard index={1} label="Citizens" value={counts.citizens} icon={UsersIcon} accent="text-teal-600" />
            <StatCard index={2} label="Staff" value={counts.staff} icon={Shield} accent="text-violet-600" />
            <StatCard index={3} label="Active" value={counts.active} icon={UserCheck} accent="text-emerald-600" />
          </>
        )}
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <Select
              className="w-auto min-w-[150px]"
              options={[
                { value: '', label: 'All roles' },
                { value: 'citizen', label: 'Citizen' },
                { value: 'admin', label: 'Admin' },
                { value: 'officer', label: 'Officer' },
                { value: 'worker', label: 'Worker' },
              ]}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            />
          </div>

          {loading ? (
            <Skeleton className="h-64" />
          ) : filtered.length === 0 ? (
            <EmptyState icon={<UsersIcon className="h-7 w-7" />} title="No users found" />
          ) : (
            <DataTable columns={columns} data={filtered} rowKey={(u) => u.id} />
          )}
        </CardContent>
      </Card>

      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title="Edit user role"
        description={editUser?.email}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={saveEdit} loading={saving}>Save</Button>
          </>
        }
      >
        <Select
          label="Role"
          options={[
            { value: 'citizen', label: 'Citizen' },
            { value: 'admin', label: 'Municipal Admin' },
            { value: 'officer', label: 'Department Officer' },
            { value: 'worker', label: 'Field Worker' },
          ]}
          value={editRole}
          onChange={(e) => setEditRole(e.target.value as UserRole)}
        />
      </Modal>
    </div>
  );
}
