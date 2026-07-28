import { useEffect, useState } from 'react';
import { Map as MapIcon, Flame, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Feedback';
import { ComplaintMap } from '@/components/maps/Maps';
import { fetchComplaints } from '@/services/api';
import type { Complaint } from '@/services/types';

export function MapViewPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHeat, setShowHeat] = useState(true);

  useEffect(() => {
    fetchComplaints({ limit: 300 })
      .then(setComplaints)
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false));
  }, []);

  const geoComplaints = complaints.filter((c) => c.latitude != null && c.longitude != null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Map View"
        subtitle={`${geoComplaints.length} complaints with location data`}
        actions={
          <button
            onClick={() => setShowHeat((h) => !h)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              showHeat
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300'
                : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Flame className="h-4 w-4" /> Heatmap
          </button>
        }
      />

      <Card>
        <CardContent className="p-2">
          {loading ? (
            <Skeleton className="h-[520px]" />
          ) : (
            <ComplaintMap complaints={geoComplaints} height="560px" showHeat={showHeat} zoom={12} />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total mapped', value: geoComplaints.length, icon: MapIcon },
          { label: 'Active issues', value: geoComplaints.filter((c) => c.status !== 'resolved' && c.status !== 'rejected').length, icon: Flame },
          { label: 'Departments', value: new Set(geoComplaints.map((c) => c.department?.name).filter(Boolean)).size, icon: Building2 },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
