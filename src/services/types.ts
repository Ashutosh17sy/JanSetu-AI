export type UserRole = 'citizen' | 'admin' | 'officer' | 'worker';

export type ComplaintStatus = 'submitted' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  ward: string;
  avatar_url: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  description: string;
  head_name: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
}

export interface ComplaintCategory {
  id: string;
  name: string;
  slug: string;
  department_slug: string;
  keywords: string;
  created_at: string;
}

export interface Worker {
  id: string;
  profile_id: string;
  department_id: string | null;
  ward: string;
  availability: 'available' | 'busy' | 'offline';
  active_complaints: number;
  rating: number;
  total_assigned: number;
  total_resolved: number;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  department?: Department;
}

export interface Complaint {
  id: string;
  ticket_number: string;
  user_id: string;
  department_id: string | null;
  assigned_worker_id: string | null;
  category: string;
  category_slug: string;
  title: string;
  description: string;
  ai_title: string;
  ai_description: string;
  ai_summary: string;
  severity: Severity;
  priority: Priority;
  status: ComplaintStatus;
  recommended_department_id: string | null;
  duplicate_of: string | null;
  image_url: string;
  after_image_url: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  ward: string;
  completion_notes: string;
  created_at: string;
  assigned_at: string | null;
  in_progress_at: string | null;
  resolved_at: string | null;
  updated_at: string;
  department?: Department;
  assigned_worker?: Worker | null;
  user?: Profile;
  feedback?: Feedback[];
}

export interface ComplaintTimelineEntry {
  id: string;
  complaint_id: string;
  status: string;
  note: string;
  actor_id: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  complaint_id: string | null;
  read: boolean;
  created_at: string;
}

export interface Feedback {
  id: string;
  complaint_id: string;
  user_id: string;
  rating: number;
  note: string;
  created_at: string;
}

export interface AIAnalysis {
  category: string;
  category_slug: string;
  department_slug: string;
  department_name: string;
  severity: Severity;
  priority: Priority;
  ai_title: string;
  ai_description: string;
  ai_summary: string;
  duplicate_of: string | null;
}
