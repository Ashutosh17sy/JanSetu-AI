import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Upload,
  X,
  Navigation,
  MapPin,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Feedback';
import { EmptyState } from '@/components/ui/EmptyState';
import { SeverityBadge, PriorityBadge, StatusBadge } from '@/components/ui/StatusBadges';
import { ComplaintMap } from '@/components/maps/Maps';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { fetchComplaintById, fetchAllWorkers, updateComplaintStatus, completeWork, uploadImage } from '@/services/api';
import type { Complaint } from '@/services/types';

export function TaskExecutionPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMyTask, setIsMyTask] = useState(false);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [afterPreview, setAfterPreview] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);

  const load = async () => {
    if (!id || !profile) return;
    setLoading(true);
    const c = await fetchComplaintById(id);
    setComplaint(c);
    const workers = await fetchAllWorkers();
    const me = workers.find((w) => w.profile_id === profile.id);
    setIsMyTask(c?.assigned_worker_id === me?.id);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, profile]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAfterFile(f);
    setAfterPreview(URL.createObjectURL(f));
  };

  const startWork = async () => {
    if (!complaint || !profile) return;
    setStarting(true);
    try {
      await updateComplaintStatus(complaint.id, 'in_progress', profile.id, 'Worker started the task.');
      toast.success('Task started', 'Status updated to in progress.');
      load();
    } catch (err) {
      toast.error('Failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setStarting(false);
    }
  };

  const complete = async () => {
    if (!complaint || !profile) return;
    if (!afterFile) {
      toast.error('Photo required', 'Upload an after photo to mark completion.');
      return;
    }
    setSubmitting(true);
    try {
      const path = `${complaint.id}/after-${Date.now()}-${afterFile.name}`;
      const url = await uploadImage('complaints', path, afterFile);
      await completeWork(complaint.id, profile.id, url, notes);
      toast.success('Task completed', 'The complaint has been marked resolved.');
      navigate(`/app/complaints/${complaint.id}`);
    } catch (err) {
      toast.error('Failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!complaint || !isMyTask) {
    return (
      <EmptyState
        title="Task not available"
        description="This task may not be assigned to you."
        action={<Link to="/app/tasks"><Button>Back to tasks</Button></Link>}
      />
    );
  }

  const mapComplaints = complaint.latitude != null ? [complaint] : [];

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate(-1)} className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <PageHeader
          title={complaint.title}
          subtitle={`${complaint.ticket_number} · ${complaint.category}`}
          actions={<StatusBadge status={complaint.status} />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {complaint.image_url && (
            <Card className="overflow-hidden">
              <CardHeader><CardTitle>Before Photo</CardTitle></CardHeader>
              <img src={complaint.image_url} alt="Before" className="max-h-80 w-full object-cover" />
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-blue-600" /> Task Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-slate-700 dark:text-slate-300">{complaint.description || complaint.ai_description}</p>
              <div className="flex flex-wrap gap-2">
                <SeverityBadge severity={complaint.severity} />
                <PriorityBadge priority={complaint.priority} />
              </div>
              {complaint.address && (
                <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="h-4 w-4" /> {complaint.address}
                </p>
              )}
              {complaint.latitude != null && complaint.longitude != null && (
                <a href={`https://www.openstreetmap.org/directions?from=&to=${complaint.latitude}%2C${complaint.longitude}`} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" leftIcon={<Navigation className="h-4 w-4" />}>Open in maps</Button>
                </a>
              )}
            </CardContent>
          </Card>

          {complaint.latitude != null && (
            <Card>
              <CardHeader><CardTitle>Location</CardTitle></CardHeader>
              <CardContent>
                <ComplaintMap complaints={mapComplaints} center={[complaint.latitude!, complaint.longitude!]} zoom={15} height="240px" />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {complaint.status === 'assigned' && (
            <Card>
              <CardContent>
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <Loader2 className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Ready to start?</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Mark this task as in progress to begin.</p>
                  </div>
                  <Button onClick={startWork} loading={starting} size="lg" className="w-full">Start task</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {complaint.status === 'in_progress' && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="h-4 w-4 text-emerald-600" /> Complete the task</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Upload after photo</p>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
                  {afterPreview ? (
                    <div className="relative">
                      <img src={afterPreview} alt="After" className="mx-auto max-h-64 rounded-xl object-contain" />
                      <button onClick={() => { setAfterFile(null); setAfterPreview(''); }} className="absolute right-2 top-2 rounded-lg bg-slate-900/70 p-1.5 text-white">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 py-10 text-slate-500 hover:border-blue-500 hover:text-blue-600"
                    >
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">Click to upload</span>
                    </button>
                  )}
                </div>

                <Textarea
                  label="Completion notes"
                  placeholder="Describe the work done…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <Button variant="success" className="w-full" size="lg" loading={submitting} leftIcon={<CheckCircle2 className="h-4 w-4" />} onClick={complete}>
                  Mark completed
                </Button>
              </CardContent>
            </Card>
          )}

          {complaint.status === 'resolved' && (
            <Card>
              <CardContent>
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white">Task completed</p>
                  <Link to={`/app/complaints/${complaint.id}`}>
                    <Button variant="outline">View complaint</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
