import { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, Shield } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ROLE_META } from '@/services/constants';
import { formatDate } from '@/services/utils';

export function ProfilePage() {
  const { profile, updateMe } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [ward, setWard] = useState(profile?.ward ?? '');
  const [saving, setSaving] = useState(false);

  if (!profile) return null;
  const roleMeta = ROLE_META[profile.role];

  const save = async () => {
    setSaving(true);
    try {
      await updateMe({ full_name: fullName, phone, ward });
      toast.success('Profile updated', 'Your details have been saved.');
    } catch (err) {
      toast.error('Update failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Manage your personal information." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-teal-500 text-3xl font-bold text-white">
              {profile.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{profile.full_name || 'User'}</p>
            <Badge className={`mt-1.5 ${roleMeta.bg} ${roleMeta.color}`}>{roleMeta.label}</Badge>
            <div className="mt-6 w-full space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4 text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Mail className="h-4 w-4" /> {profile.email}
              </div>
              {profile.phone && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Phone className="h-4 w-4" /> {profile.phone}
                </div>
              )}
              {profile.ward && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="h-4 w-4" /> {profile.ward}
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Shield className="h-4 w-4" /> Joined {formatDate(profile.created_at)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Full name" leftIcon={<User className="h-4 w-4" />} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input label="Email" value={profile.email} disabled hint="Email cannot be changed." />
            <Input label="Phone" leftIcon={<Phone className="h-4 w-4" />} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91-98765-43210" />
            <Input label="Ward" leftIcon={<MapPin className="h-4 w-4" />} value={ward} onChange={(e) => setWard(e.target.value)} placeholder="Ward 12" />
            <Button onClick={save} loading={saving} leftIcon={<Save className="h-4 w-4" />}>Save changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
