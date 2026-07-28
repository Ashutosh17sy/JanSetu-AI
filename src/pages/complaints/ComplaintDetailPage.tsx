import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Building2,
  User,
  Sparkles,
  CheckCircle2,
  HardHat,
  Star,
  AlertTriangle,
  Camera,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Feedback';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge, SeverityBadge, PriorityBadge } from '@/components/ui/StatusBadges';
import { ComplaintMap } from '@/components/maps/Maps';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import {
  fetchComplaintById,
  fetchTimeline,
  fetchWorkersByDepartment,
  assignWorker,
  updateComplaintStatus,
  rejectComplaint,
  addFeedback,
} from '@/services/api';
import type { Complaint, ComplaintTimelineEntry, Worker } from '@/services/types';
import { STATUS_META } from '@/services/constants';
import { formatDateTime, timeAgo } from '@/services/utils';

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Complaint submitted',
  assigned: 'Worker assigned',
  in_progress: 'Work in progress',
  resolved: 'Complaint resolved',
  rejected: 'Complaint rejected',
};

export function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [timeline, setTimeline] = useState<ComplaintTimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignOpen, setAssignOpen] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackNote, setFeedbackNote] = useState('');

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [c, t] = await Promise.all([fetchComplaintById(id), fetchTimeline(id)]);
      setComplaint(c);
      setTimeline(t);
    } catch {
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const canManage = profile?.role === 'admin' || profile?.role === 'officer';
  const isOwner = complaint?.user_id === profile?.id;
  const isAssignedWorker = complaint?.assigned_worker?.profile_id === profile?.id;
  const hasFeedback = complaint?.feedback && complaint.feedback.length > 0;

  const openAssign = async () => {
    if (!complaint?.department_id) {
      toast.error('No department', 'This complaint has no department assigned.');
      return;
    }
    const w = await fetchWorkersByDepartment(complaint.department_id);
    setWorkers(w);
    setSelectedWorker('');
    setAssignOpen(true);
  };

  const doAssign = async () => {
    if (!complaint || !profile || !selectedWorker) return;
    try {
      await assignWorker(complaint.id, selectedWorker, profile.id);
      toast.success('Worker assigned', 'The complaint has been assigned.');
      setAssignOpen(false);
      load();
    } catch (err) {
      toast.error('Assignment failed', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const doStatus = async (status: Complaint['status']) => {
    if (!complaint || !profile) return;
    try {
      await updateComplaintStatus(complaint.id, status, profile.id);
      toast.success('Status updated', `Complaint is now ${status.replace('_', ' ')}.`);
      load();
    } catch (err) {
      toast.error('Update failed', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const doReject = async () => {
    if (!complaint || !profile) return;
    try {
      await rejectComplaint(complaint.id, profile.id, rejectReason);
      toast.success('Complaint rejected');
      setRejectOpen(false);
      setRejectReason('');
      load();
    } catch (err) {
      toast.error('Failed to reject', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const doFeedback = async () => {
    if (!complaint || !profile) return;
    try {
      await addFeedback(complaint.id, profile.id, rating, feedbackNote);
      toast.success('Feedback submitted', 'Thank you for your feedback.');
      setFeedbackOpen(false);
      load();
    } catch (err) {
      toast.error('Failed to submit', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <EmptyState
        title="Complaint not found"
        description="This complaint may have been removed."
        action={<Link to="/app/complaints"><Button>Back to complaints</Button></Link>}
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {complaint.image_url && (
            <Card className="overflow-hidden">
              <img src={complaint.image_url} alt={complaint.title} className="max-h-96 w-full object-cover" />
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 dark:text-slate-300">{complaint.description || complaint.ai_description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <SeverityBadge severity={complaint.severity} />
                <PriorityBadge priority={complaint.priority} />
                {complaint.department && (
                  <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                    <Building2 className="h-3 w-3" /> {complaint.department.name}
                  </Badge>
                )}
                {complaint.duplicate_of && (
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    <AlertTriangle className="h-3 w-3" /> Possible duplicate
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI analysis */}
          {(complaint.ai_title || complaint.ai_summary) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {complaint.ai_title && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Generated title</p>
                    <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-white">{complaint.ai_title}</p>
                  </div>
                )}
                {complaint.ai_summary && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Summary</p>
                    <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">{complaint.ai_summary}</p>
                  </div>
                )}
                {complaint.ai_description && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">AI description</p>
                    <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">{complaint.ai_description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* After image for resolved */}
          {complaint.after_image_url && (
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  After / Completion Photo
                </CardTitle>
              </CardHeader>
              <img src={complaint.after_image_url} alt="After" className="max-h-96 w-full object-cover" />
              {complaint.completion_notes && (
                <CardContent>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{complaint.completion_notes}</p>
                </CardContent>
              )}
            </Card>
          )}

          {/* Map */}
          {complaint.latitude != null && complaint.longitude != null && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ComplaintMap complaints={mapComplaints} center={[complaint.latitude!, complaint.longitude!]} zoom={15} height="280px" />
                {complaint.address && <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{complaint.address}</p>}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-5 border-l border-slate-200 dark:border-slate-800 pl-6">
                {timeline.map((t, i) => {
                  const meta = STATUS_META[t.status as keyof typeof STATUS_META] ?? STATUS_META.submitted;
                  return (
                    <motion.li
                      key={t.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative"
                    >
                      <span className={`absolute -left-[31px] top-0.5 h-3 w-3 rounded-full ring-4 ring-white dark:ring-slate-900 ${meta.dot}`} />
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{STATUS_LABELS[t.status] ?? t.status}</p>
                      {t.note && <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{t.note}</p>}
                      <p className="mt-0.5 text-xs text-slate-400">{formatDateTime(t.created_at)}</p>
                    </motion.li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>

          {/* Feedback display */}
          {hasFeedback && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Citizen Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {complaint.feedback!.map((f) => (
                  <div key={f.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`h-4 w-4 ${j < f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                      ))}
                    </div>
                    {f.note && <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{f.note}</p>}
                    <p className="mt-1 text-xs text-slate-400">{timeAgo(f.created_at)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { icon: Clock, label: 'Created', value: formatDateTime(complaint.created_at) },
                { icon: Building2, label: 'Department', value: complaint.department?.name ?? 'Unassigned' },
                { icon: User, label: 'Reported by', value: complaint.user?.full_name || 'Citizen' },
                { icon: MapPin, label: 'Ward', value: complaint.ward || '—' },
              ].map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-3">
                  <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <row.icon className="h-4 w-4" /> {row.label}
                  </span>
                  <span className="text-right font-medium text-slate-900 dark:text-white">{row.value}</span>
                </div>
              ))}
              {complaint.assigned_worker && (
                <div className="flex items-start justify-between gap-3">
                  <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <HardHat className="h-4 w-4" /> Worker
                  </span>
                  <span className="text-right font-medium text-slate-900 dark:text-white">
                    {complaint.assigned_worker.profile?.full_name ?? 'Assigned'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {canManage && complaint.status === 'submitted' && (
                <>
                  <Button className="w-full" leftIcon={<HardHat className="h-4 w-4" />} onClick={openAssign}>
                    Assign worker
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setRejectOpen(true)}>
                    Reject complaint
                  </Button>
                </>
              )}
              {canManage && complaint.status === 'assigned' && (
                <Button className="w-full" onClick={() => doStatus('in_progress')}>Mark in progress</Button>
              )}
              {canManage && (complaint.status === 'in_progress') && (
                <Button variant="success" className="w-full" onClick={() => doStatus('resolved')}>Mark resolved</Button>
              )}

              {isAssignedWorker && complaint.status === 'assigned' && (
                <Link to={`/app/tasks/${complaint.id}`}>
                  <Button className="w-full" leftIcon={<Camera className="h-4 w-4" />}>Start work</Button>
                </Link>
              )}

              {isOwner && complaint.status === 'resolved' && !hasFeedback && (
                <Button variant="outline" className="w-full" leftIcon={<Star className="h-4 w-4" />} onClick={() => setFeedbackOpen(true)}>
                  Leave feedback
                </Button>
              )}

              {!canManage && !isAssignedWorker && !isOwner && (
                <p className="text-sm text-slate-500 dark:text-slate-400">No actions available for your role.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assign worker modal */}
      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign a field worker"
        description="Select an available worker from this department."
        footer={
          <>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={doAssign} disabled={!selectedWorker}>Assign</Button>
          </>
        }
      >
        {workers.length === 0 ? (
          <EmptyState title="No workers available" description="Add workers to this department first." />
        ) : (
          <div className="space-y-2">
            {workers.map((w) => (
              <label
                key={w.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                  selectedWorker === w.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{w.profile?.full_name ?? 'Worker'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {w.active_complaints} active · {w.ward || 'No ward'} · {w.availability}
                  </p>
                </div>
                <input type="radio" name="worker" value={w.id} checked={selectedWorker === w.id} onChange={(e) => setSelectedWorker(e.target.value)} />
              </label>
            ))}
          </div>
        )}
      </Modal>

      {/* Reject modal */}
      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject complaint"
        description="Provide a reason for rejection. The citizen will be notified."
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={doReject} disabled={!rejectReason}>Reject</Button>
          </>
        }
      >
        <Textarea
          placeholder="e.g. Issue is on private property, not under municipal jurisdiction."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>

      {/* Feedback modal */}
      <Modal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        title="Rate your experience"
        description="How satisfied are you with the resolution?"
        footer={
          <>
            <Button variant="outline" onClick={() => setFeedbackOpen(false)}>Cancel</Button>
            <Button variant="success" onClick={doFeedback}>Submit feedback</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <button key={i} onClick={() => setRating(i + 1)} className="transition-transform hover:scale-110">
                <Star className={`h-8 w-8 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Tell us about your experience (optional)"
            value={feedbackNote}
            onChange={(e) => setFeedbackNote(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
