import { supabase } from './supabase';
import type {
  Complaint,
  ComplaintStatus,
  ComplaintTimelineEntry,
  Department,
  Feedback,
  Notification,
  Profile,
  Worker,
} from './types';
import { generateTicketNumber } from './ai';

export async function fetchDepartments(): Promise<Department[]> {
  const { data, error } = await supabase.from('departments').select('*').order('name');
  if (error) throw error;
  return data as Department[];
}

export async function fetchDepartmentBySlug(slug: string): Promise<Department | null> {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data as Department | null;
}

export async function fetchWorkersByDepartment(departmentId: string): Promise<Worker[]> {
  const { data, error } = await supabase
    .from('workers')
    .select('*, profile:profiles!workers_profile_id_fkey(*), department:departments(*)')
    .eq('department_id', departmentId)
    .order('availability');
  if (error) throw error;
  return data as unknown as Worker[];
}

export async function fetchAllWorkers(): Promise<Worker[]> {
  const { data, error } = await supabase
    .from('workers')
    .select('*, profile:profiles!workers_profile_id_fkey(*), department:departments(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as Worker[];
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function fetchProfiles(role?: string): Promise<Profile[]> {
  let q = supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (role) q = q.eq('role', role);
  const { data, error } = await q;
  if (error) throw error;
  return data as Profile[];
}

export async function updateProfile(userId: string, patch: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function createWorker(profileId: string, departmentId: string, ward: string): Promise<Worker> {
  const { data, error } = await supabase
    .from('workers')
    .insert({ profile_id: profileId, department_id: departmentId, ward, availability: 'available' })
    .select()
    .single();
  if (error) throw error;
  return data as Worker;
}

function supabaseError(error: unknown, fallback: string): Error {
  if (error && typeof error === 'object' && 'message' in error) {
    const e = error as { message: string; code?: string; details?: string };
    const parts = [e.message];
    if (e.code) parts.push(`(code: ${e.code})`);
    if (e.details) parts.push(`details: ${e.details}`);
    return new Error(parts.join(' '));
  }
  if (error instanceof Error) return error;
  return new Error(fallback);
}

export async function createComplaint(input: {
  user_id: string;
  category: string;
  category_slug: string;
  title: string;
  description: string;
  ai_title: string;
  ai_description: string;
  ai_summary: string;
  severity: string;
  priority: string;
  department_id: string | null;
  recommended_department_id: string | null;
  duplicate_of: string | null;
  image_url: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  ward: string;
}): Promise<Complaint> {
  const ticket = generateTicketNumber();
  console.info('[createComplaint] inserting complaint', { ticket, category: input.category, user_id: input.user_id });
  const { data, error } = await supabase
    .from('complaints')
    .insert({ ...input, ticket_number: ticket, status: 'submitted' })
    .select('*, department:departments(*), assigned_worker:workers(*)')
    .single();
  if (error) {
    console.error('[createComplaint] complaints INSERT failed', error);
    throw supabaseError(error, 'Failed to create complaint record');
  }
  const complaint = data as unknown as Complaint;
  console.info('[createComplaint] complaint created', { id: complaint.id, ticket });

  const { error: tlError } = await supabase.from('complaint_timeline').insert({
    complaint_id: complaint.id,
    status: 'submitted',
    note: 'Complaint submitted by citizen.',
    actor_id: input.user_id,
  });
  if (tlError) {
    console.error('[createComplaint] timeline INSERT failed', tlError);
    throw supabaseError(tlError, 'Failed to create timeline entry');
  }
  console.info('[createComplaint] timeline entry created', { complaint_id: complaint.id });

  const { error: notifError } = await supabase.from('notifications').insert({
    user_id: input.user_id,
    type: 'complaint_submitted',
    title: 'Complaint submitted',
    body: `Your complaint ${ticket} has been submitted and is under review.`,
    complaint_id: complaint.id,
  });
  if (notifError) {
    console.error('[createComplaint] notification INSERT failed', notifError);
    throw supabaseError(notifError, 'Failed to create notification');
  }
  console.info('[createComplaint] notification created', { complaint_id: complaint.id });

  return complaint;
}

export async function fetchComplaints(filters?: {
  status?: ComplaintStatus;
  departmentId?: string;
  workerId?: string;
  categorySlug?: string;
  ward?: string;
  userId?: string;
  search?: string;
  limit?: number;
}): Promise<Complaint[]> {
  let q = supabase
    .from('complaints')
    .select('*, department:departments(*), assigned_worker:workers(*, profile:profiles!workers_profile_id_fkey(*)), feedback:feedback(*)')
    .order('created_at', { ascending: false });
  if (filters?.status) q = q.eq('status', filters.status);
  if (filters?.departmentId) q = q.eq('department_id', filters.departmentId);
  if (filters?.workerId) q = q.eq('assigned_worker_id', filters.workerId);
  if (filters?.categorySlug) q = q.eq('category_slug', filters.categorySlug);
  if (filters?.ward) q = q.eq('ward', filters.ward);
  if (filters?.userId) q = q.eq('user_id', filters.userId);
  if (filters?.search) q = q.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,ticket_number.ilike.%${filters.search}%`);
  if (filters?.limit) q = q.limit(filters.limit);
  const { data, error } = await q;
  if (error) throw error;
  return data as unknown as Complaint[];
}

export async function fetchComplaintById(id: string): Promise<Complaint | null> {
  const { data, error } = await supabase
    .from('complaints')
    .select('*, department:departments(*), assigned_worker:workers(*, profile:profiles!workers_profile_id_fkey(*)), feedback:feedback(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as Complaint | null;
}

export async function fetchTimeline(complaintId: string): Promise<ComplaintTimelineEntry[]> {
  const { data, error } = await supabase
    .from('complaint_timeline')
    .select('*')
    .eq('complaint_id', complaintId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as ComplaintTimelineEntry[];
}

export async function assignWorker(complaintId: string, workerId: string, actorId: string): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('complaints')
    .update({ assigned_worker_id: workerId, status: 'assigned', assigned_at: now })
    .eq('id', complaintId);
  if (error) throw error;

  await supabase.from('complaint_timeline').insert({
    complaint_id: complaintId,
    status: 'assigned',
    note: 'Complaint assigned to a field worker.',
    actor_id: actorId,
  });

  const complaint = await fetchComplaintById(complaintId);
  if (complaint) {
    await supabase.from('notifications').insert({
      user_id: complaint.user_id,
      type: 'complaint_assigned',
      title: 'Worker assigned',
      body: `Your complaint ${complaint.ticket_number} has been assigned to a field worker.`,
      complaint_id: complaintId,
    });
    const worker = await supabase.from('workers').select('profile_id').eq('id', workerId).maybeSingle();
    if (worker.data) {
      await supabase.from('notifications').insert({
        user_id: worker.data.profile_id,
        type: 'task_assigned',
        title: 'New task assigned',
        body: `You have been assigned complaint ${complaint.ticket_number}.`,
        complaint_id: complaintId,
      });
    }
  }
}

export async function updateComplaintStatus(
  complaintId: string,
  status: ComplaintStatus,
  actorId: string,
  note?: string,
): Promise<void> {
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { status };
  if (status === 'in_progress') patch.in_progress_at = now;
  if (status === 'resolved') patch.resolved_at = now;
  const { error } = await supabase.from('complaints').update(patch).eq('id', complaintId);
  if (error) throw error;

  await supabase.from('complaint_timeline').insert({
    complaint_id: complaintId,
    status,
    note: note || `Status updated to ${status}.`,
    actor_id: actorId,
  });

  const complaint = await fetchComplaintById(complaintId);
  if (complaint) {
    await supabase.from('notifications').insert({
      user_id: complaint.user_id,
      type: `complaint_${status}`,
      title: `Complaint ${status.replace('_', ' ')}`,
      body: `Your complaint ${complaint.ticket_number} is now ${status.replace('_', ' ')}.`,
      complaint_id: complaintId,
    });
  }
}

export async function rejectComplaint(complaintId: string, actorId: string, reason: string): Promise<void> {
  const { error } = await supabase.from('complaints').update({ status: 'rejected' }).eq('id', complaintId);
  if (error) throw error;
  await supabase.from('complaint_timeline').insert({
    complaint_id: complaintId,
    status: 'rejected',
    note: reason,
    actor_id: actorId,
  });
  const complaint = await fetchComplaintById(complaintId);
  if (complaint) {
    await supabase.from('notifications').insert({
      user_id: complaint.user_id,
      type: 'complaint_rejected',
      title: 'Complaint rejected',
      body: `Your complaint ${complaint.ticket_number} was rejected: ${reason}`,
      complaint_id: complaintId,
    });
  }
}

export async function completeWork(
  complaintId: string,
  actorId: string,
  afterImageUrl: string,
  completionNotes: string,
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('complaints')
    .update({
      status: 'resolved',
      resolved_at: now,
      after_image_url: afterImageUrl,
      completion_notes: completionNotes,
    })
    .eq('id', complaintId);
  if (error) throw error;
  await supabase.from('complaint_timeline').insert({
    complaint_id: complaintId,
    status: 'resolved',
    note: completionNotes || 'Work completed by field worker.',
    actor_id: actorId,
  });
  const complaint = await fetchComplaintById(complaintId);
  if (complaint) {
    await supabase.from('notifications').insert({
      user_id: complaint.user_id,
      type: 'complaint_resolved',
      title: 'Complaint resolved',
      body: `Your complaint ${complaint.ticket_number} has been marked resolved. Please share your feedback.`,
      complaint_id: complaintId,
    });
  }
}

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as Notification[];
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
  if (error) throw error;
}

export async function addFeedback(
  complaintId: string,
  userId: string,
  rating: number,
  note: string,
): Promise<Feedback> {
  const { data, error } = await supabase
    .from('feedback')
    .insert({ complaint_id: complaintId, user_id: userId, rating, note })
    .select()
    .single();
  if (error) throw error;
  return data as Feedback;
}

export async function uploadImage(bucket: string, path: string, file: File): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) {
    console.error('[uploadImage] storage upload failed', { bucket, path, error });
    throw supabaseError(error, `Failed to upload image to ${bucket}`);
  }
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
  console.info('[uploadImage] uploaded', { bucket, path, url: pub.publicUrl });
  return pub.publicUrl;
}
