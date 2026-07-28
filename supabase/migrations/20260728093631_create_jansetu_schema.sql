/*
# JanSetu AI - Full Schema

## Overview
JanSetu AI is an AI-powered Smart Civic Management Platform. Citizens file complaints
with photos + GPS; AI auto-classifies category, severity, priority, department; municipal
admin / department officers / field workers manage the complaint lifecycle.

## Tables
1. `profiles` - extends auth.users with role (citizen/admin/officer/worker), full name, phone, ward.
2. `departments` - municipal departments (Waste, Road, Traffic, Water, Sewer, Electricity, Parks).
3. `workers` - field workers, linked to profile + department, with availability + active count.
4. `complaints` - core complaint records with AI analysis fields, status, assignment, geo, images.
5. `complaint_timeline` - status-change events for each complaint (audit trail).
6. `notifications` - in-app notifications per user.
7. `feedback` - citizen ratings/notes on resolved complaints.
8. `complaint_categories` - reference list of issue categories with department mapping.

## Security
- All tables have RLS enabled.
- `profiles` is owner-readable/writable; admin can read all.
- `departments` / `complaint_categories` are readable by all authenticated.
- `complaints`: citizen reads own; admin/officer/worker read by role scope; citizen inserts own.
- `complaint_timeline`: readable by users allowed to see the parent complaint; officer/admin insert.
- `notifications`: owner-scoped CRUD.
- `feedback`: owner-scoped insert/read; officer/admin read feedback for complaints they can see.
- `workers`: admin/officer read; admin insert/update.

## Notes
1. `profiles.role` defaults to 'citizen'. A DB trigger copies new auth.users into profiles on signup.
2. `complaints.user_id` defaults to `auth.uid()` so citizen inserts omit it.
3. `complaints.priority` / `severity` / `ai_title` / `ai_description` / `ai_summary` /
   `recommended_department_id` / `duplicate_of` are filled by the AI analysis edge function.
4. `complaints.status` lifecycle: submitted -> assigned -> in_progress -> resolved (or rejected).
5. Worker assignment updates `assigned_worker_id` + `assigned_at`; status updates via timeline.
*/

-- =============================================================
-- 1. profiles
-- =============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  role text NOT NULL DEFAULT 'citizen'
    CHECK (role IN ('citizen','admin','officer','worker')),
  ward text DEFAULT '',
  avatar_url text DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_staff" ON profiles;
CREATE POLICY "profiles_select_own_or_staff" ON profiles FOR SELECT
  TO authenticated USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','officer'))
  );

DROP POLICY IF EXISTS "profiles_insert_self" ON profiles;
CREATE POLICY "profiles_insert_self" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Allow admin to update any profile (activate/deactivate, change role/ward)
DROP POLICY IF EXISTS "profiles_update_by_admin" ON profiles;
CREATE POLICY "profiles_update_by_admin" ON profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- =============================================================
-- 2. departments
-- =============================================================
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  head_name text DEFAULT '',
  contact_email text DEFAULT '',
  contact_phone text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "departments_select_all" ON departments;
CREATE POLICY "departments_select_all" ON departments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "departments_modify_admin" ON departments;
CREATE POLICY "departments_modify_admin" ON departments FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "departments_update_admin" ON departments;
CREATE POLICY "departments_update_admin" ON departments FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- =============================================================
-- 3. complaint_categories
-- =============================================================
CREATE TABLE IF NOT EXISTS complaint_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  department_slug text NOT NULL,
  keywords text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE complaint_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_all" ON complaint_categories;
CREATE POLICY "categories_select_all" ON complaint_categories FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "categories_modify_admin" ON complaint_categories;
CREATE POLICY "categories_modify_admin" ON complaint_categories FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- =============================================================
-- 4. workers
-- =============================================================
CREATE TABLE IF NOT EXISTS workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  ward text DEFAULT '',
  availability text NOT NULL DEFAULT 'available'
    CHECK (availability IN ('available','busy','offline')),
  active_complaints int NOT NULL DEFAULT 0,
  rating numeric(3,2) DEFAULT 0,
  total_assigned int NOT NULL DEFAULT 0,
  total_resolved int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workers_select_staff_or_self" ON workers;
CREATE POLICY "workers_select_staff_or_self" ON workers FOR SELECT
  TO authenticated USING (
    profile_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','officer'))
  );

DROP POLICY IF EXISTS "workers_insert_admin" ON workers;
CREATE POLICY "workers_insert_admin" ON workers FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','officer'))
  );

DROP POLICY IF EXISTS "workers_update_admin_or_self" ON workers;
CREATE POLICY "workers_update_admin_or_self" ON workers FOR UPDATE
  TO authenticated
  USING (
    profile_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','officer'))
  )
  WITH CHECK (
    profile_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','officer'))
  );

-- =============================================================
-- 5. complaints
-- =============================================================
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  assigned_worker_id uuid REFERENCES workers(id) ON DELETE SET NULL,
  category text NOT NULL,
  category_slug text NOT NULL DEFAULT '',
  title text NOT NULL,
  description text DEFAULT '',
  ai_title text DEFAULT '',
  ai_description text DEFAULT '',
  ai_summary text DEFAULT '',
  severity text NOT NULL DEFAULT 'medium'
    CHECK (severity IN ('low','medium','high','critical')),
  priority text NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low','normal','high','urgent')),
  status text NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted','assigned','in_progress','resolved','rejected')),
  recommended_department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  duplicate_of uuid REFERENCES complaints(id) ON DELETE SET NULL,
  image_url text DEFAULT '',
  after_image_url text DEFAULT '',
  latitude numeric(10,7),
  longitude numeric(10,7),
  address text DEFAULT '',
  ward text DEFAULT '',
  completion_notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  assigned_at timestamptz,
  in_progress_at timestamptz,
  resolved_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Citizen sees own complaints; staff sees all in their scope.
DROP POLICY IF EXISTS "complaints_select_scoped" ON complaints;
CREATE POLICY "complaints_select_scoped" ON complaints FOR SELECT
  TO authenticated USING (
    user_id = auth.uid() OR
    assigned_worker_id IN (SELECT id FROM workers WHERE profile_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','officer'))
  );

-- Citizen inserts own complaint (user_id defaults to auth.uid())
DROP POLICY IF EXISTS "complaints_insert_citizen" ON complaints;
CREATE POLICY "complaints_insert_citizen" ON complaints FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

-- Admin/officer can insert (e.g. seed data)
DROP POLICY IF EXISTS "complaints_insert_staff" ON complaints;
CREATE POLICY "complaints_insert_staff" ON complaints FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','officer'))
  );

-- Citizen can update own complaint only while submitted (add image / cancel)
DROP POLICY IF EXISTS "complaints_update_owner" ON complaints;
CREATE POLICY "complaints_update_owner" ON complaints FOR UPDATE
  TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Officer/admin update status, assign worker, etc.
DROP POLICY IF EXISTS "complaints_update_staff" ON complaints;
CREATE POLICY "complaints_update_staff" ON complaints FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','officer')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','officer')));

-- Worker can update complaints assigned to them (progress/complete)
DROP POLICY IF EXISTS "complaints_update_worker" ON complaints;
CREATE POLICY "complaints_update_worker" ON complaints FOR UPDATE
  TO authenticated
  USING (assigned_worker_id IN (SELECT id FROM workers WHERE profile_id = auth.uid()))
  WITH CHECK (assigned_worker_id IN (SELECT id FROM workers WHERE profile_id = auth.uid()));

-- =============================================================
-- 6. complaint_timeline
-- =============================================================
CREATE TABLE IF NOT EXISTS complaint_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  status text NOT NULL,
  note text DEFAULT '',
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE complaint_timeline ENABLE ROW LEVEL SECURITY;

-- Readable by anyone who can read the parent complaint.
DROP POLICY IF EXISTS "timeline_select_scoped" ON complaint_timeline;
CREATE POLICY "timeline_select_scoped" ON complaint_timeline FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = complaint_timeline.complaint_id
      AND (
        c.user_id = auth.uid() OR
        c.assigned_worker_id IN (SELECT id FROM workers WHERE profile_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','officer'))
      )
    )
  );

-- Owner of complaint or staff can add timeline entries.
DROP POLICY IF EXISTS "timeline_insert_scoped" ON complaint_timeline;
CREATE POLICY "timeline_insert_scoped" ON complaint_timeline FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = complaint_timeline.complaint_id
      AND (
        c.user_id = auth.uid() OR
        c.assigned_worker_id IN (SELECT id FROM workers WHERE profile_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','officer'))
      )
    )
  );

-- =============================================================
-- 7. notifications
-- =============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text DEFAULT '',
  complaint_id uuid REFERENCES complaints(id) ON DELETE CASCADE,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_insert_staff" ON notifications;
CREATE POLICY "notifications_insert_staff" ON notifications FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','officer'))
  );

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
  TO authenticated USING (user_id = auth.uid());

-- =============================================================
-- 8. feedback
-- =============================================================
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  note text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feedback_select_scoped" ON feedback;
CREATE POLICY "feedback_select_scoped" ON feedback FOR SELECT
  TO authenticated USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','officer'))
  );

DROP POLICY IF EXISTS "feedback_insert_own" ON feedback;
CREATE POLICY "feedback_insert_own" ON feedback FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "feedback_update_own" ON feedback;
CREATE POLICY "feedback_update_own" ON feedback FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =============================================================
-- Indexes
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_department_id ON complaints(department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_worker_id ON complaints(assigned_worker_id);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category_slug);
CREATE INDEX IF NOT EXISTS idx_complaints_ward ON complaints(ward);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_complaint_id ON complaint_timeline(complaint_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_complaint_id ON feedback(complaint_id);

-- =============================================================
-- Auto-create profile on signup
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- Auto-update updated_at
-- =============================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_touch ON profiles;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS complaints_touch ON complaints;
CREATE TRIGGER complaints_touch BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS workers_touch ON workers;
CREATE TRIGGER workers_touch BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =============================================================
-- Seed departments
-- =============================================================
INSERT INTO departments (name, slug, description, head_name, contact_email, contact_phone)
VALUES
  ('Waste Management','waste','Collection & disposal of municipal solid waste, illegal dumping enforcement.','Rajesh Kumar','waste@jansetu.gov.in','+91-11-2200-1001'),
  ('Road Department','road','Construction and maintenance of city roads, potholes, broken surfaces.','Sunita Rao','road@jansetu.gov.in','+91-11-2200-1002'),
  ('Traffic Department','traffic','Traffic signals, signage, signals and road safety infrastructure.','Amit Verma','traffic@jansetu.gov.in','+91-11-2200-1003'),
  ('Water Department','water','Potable water supply, pipeline leakage and tanker services.','Priya Nair','water@jansetu.gov.in','+91-11-2200-1004'),
  ('Sewer Department','sewer','Underground sewerage, manholes and drainage overflow.','Mohammed Iqbal','sewer@jansetu.gov.in','+91-11-2200-1005'),
  ('Electricity Department','electricity','Street lighting, electrical faults and public lighting maintenance.','Deepak Sharma','electricity@jansetu.gov.in','+91-11-2200-1006'),
  ('Parks Department','parks','Public parks, fallen trees and urban greenery maintenance.','Kavita Menon','parks@jansetu.gov.in','+91-11-2200-1007')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- Seed complaint categories
-- =============================================================
INSERT INTO complaint_categories (name, slug, department_slug, keywords) VALUES
  ('Garbage Collection','garbage-collection','waste','garbage trash waste collection bin pickup'),
  ('Illegal Dumping','illegal-dumping','waste','dumping illegal debris waste litter construction'),
  ('Road Potholes','road-potholes','road','pothole potholes road surface crater'),
  ('Broken Roads','broken-roads','road','broken cracked damaged road surface'),
  ('Broken Traffic Lights','broken-traffic-lights','traffic','traffic signal light broken not working'),
  ('Street Light Issues','street-light-issues','electricity','street light lamp post dark not working'),
  ('Water Leakage','water-leakage','water','water leak pipe leakage supply burst'),
  ('Sewer Overflow','sewer-overflow','sewer','sewer sewage overflow drainage block'),
  ('Open Manholes','open-manholes','sewer','manhole open cover missing danger'),
  ('Construction Debris','construction-debris','waste','debris construction rubble cement bricks'),
  ('Public Property Damage','public-property-damage','road','property damage bench fence bus stop shelter'),
  ('Fallen Trees','fallen-trees','parks','tree fallen branch uprooted storm'),
  ('Other Civic Issues','other-civic-issues','road','other civic issue general')
ON CONFLICT (slug) DO NOTHING;
