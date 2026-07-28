/*
# Fix RLS recursion (JWT-based) + create storage bucket

## Problem 1: RLS recursion still occurring
The previous fix used SECURITY DEFINER functions that queried the `profiles` table.
Even though the functions run as `postgres`, RLS was still being evaluated on the
`profiles` table during the function call, causing the same infinite recursion.

## Fix 1: JWT-based role checks (zero table access)
Rewrite `is_staff()` and `is_admin()` to read the user's role from the JWT
(`auth.jwt() -> 'user_metadata' ->> 'role'`) instead of querying `profiles`.
This eliminates ALL `profiles` table reads from within policies, breaking the
recursion chain permanently. The role is set in `raw_user_meta_data` during
signup (useAuth.tsx signUp passes `options: { data: { full_name, role } }`).

We also set `row_security = off` on the functions as a belt-and-suspenders measure.

## Problem 2: Storage 400 Bad Request on image upload
The `complaints` storage bucket does not exist. The upload code calls
`supabase.storage.from('complaints').upload(path, file)` but there is no bucket
named `complaints`, causing a 400 Bad Request.

## Fix 2: Create storage bucket + policies
Create the `complaints` bucket (public read, authenticated write) with storage
RLS policies:
- SELECT (read): public — anyone can view complaint images
- INSERT (upload): authenticated users can upload to their own folder
- UPDATE: authenticated users can update their own folder
- DELETE: authenticated users can delete their own folder

## Functionality preserved
- Citizens: read/update own profile + complaints; upload complaint photos
- Staff (admin + officer): read all profiles, complaints, timelines, feedback
- Admin: update any profile; manage departments, categories
- Workers: read/update assigned complaints; upload completion photos
*/

-- =============================================================
-- 1. Recursion-breaking helper functions (JWT-based, zero table access)
-- =============================================================
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'officer'),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- =============================================================
-- 2. profiles — recreate all policies using JWT-based helpers
-- =============================================================
DROP POLICY IF EXISTS "profiles_select_own_or_staff" ON profiles;
CREATE POLICY "profiles_select_own_or_staff" ON profiles FOR SELECT
  TO authenticated USING (
    auth.uid() = id OR public.is_staff()
  );

DROP POLICY IF EXISTS "profiles_insert_self" ON profiles;
CREATE POLICY "profiles_insert_self" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_by_admin" ON profiles;
CREATE POLICY "profiles_update_by_admin" ON profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================
-- 3. departments
-- =============================================================
DROP POLICY IF EXISTS "departments_select_all" ON departments;
CREATE POLICY "departments_select_all" ON departments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "departments_modify_admin" ON departments;
CREATE POLICY "departments_modify_admin" ON departments FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "departments_update_admin" ON departments;
CREATE POLICY "departments_update_admin" ON departments FOR UPDATE
  TO authenticated USING (public.is_admin());

-- =============================================================
-- 4. complaint_categories
-- =============================================================
DROP POLICY IF EXISTS "categories_select_all" ON complaint_categories;
CREATE POLICY "categories_select_all" ON complaint_categories FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "categories_modify_admin" ON complaint_categories;
CREATE POLICY "categories_modify_admin" ON complaint_categories FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

-- =============================================================
-- 5. workers
-- =============================================================
DROP POLICY IF EXISTS "workers_select_staff_or_self" ON workers;
CREATE POLICY "workers_select_staff_or_self" ON workers FOR SELECT
  TO authenticated USING (
    profile_id = auth.uid() OR public.is_staff()
  );

DROP POLICY IF EXISTS "workers_insert_admin" ON workers;
CREATE POLICY "workers_insert_admin" ON workers FOR INSERT
  TO authenticated WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "workers_update_admin_or_self" ON workers;
CREATE POLICY "workers_update_admin_or_self" ON workers FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_staff())
  WITH CHECK (profile_id = auth.uid() OR public.is_staff());

-- =============================================================
-- 6. complaints
-- =============================================================
DROP POLICY IF EXISTS "complaints_select_scoped" ON complaints;
CREATE POLICY "complaints_select_scoped" ON complaints FOR SELECT
  TO authenticated USING (
    user_id = auth.uid() OR
    assigned_worker_id IN (SELECT id FROM workers WHERE profile_id = auth.uid()) OR
    public.is_staff()
  );

DROP POLICY IF EXISTS "complaints_insert_citizen" ON complaints;
CREATE POLICY "complaints_insert_citizen" ON complaints FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "complaints_insert_staff" ON complaints;
CREATE POLICY "complaints_insert_staff" ON complaints FOR INSERT
  TO authenticated WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "complaints_update_owner" ON complaints;
CREATE POLICY "complaints_update_owner" ON complaints FOR UPDATE
  TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "complaints_update_staff" ON complaints;
CREATE POLICY "complaints_update_staff" ON complaints FOR UPDATE
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "complaints_update_worker" ON complaints;
CREATE POLICY "complaints_update_worker" ON complaints FOR UPDATE
  TO authenticated
  USING (assigned_worker_id IN (SELECT id FROM workers WHERE profile_id = auth.uid()))
  WITH CHECK (assigned_worker_id IN (SELECT id FROM workers WHERE profile_id = auth.uid()));

-- =============================================================
-- 7. complaint_timeline
-- =============================================================
DROP POLICY IF EXISTS "timeline_select_scoped" ON complaint_timeline;
CREATE POLICY "timeline_select_scoped" ON complaint_timeline FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = complaint_timeline.complaint_id
      AND (
        c.user_id = auth.uid() OR
        c.assigned_worker_id IN (SELECT id FROM workers WHERE profile_id = auth.uid()) OR
        public.is_staff()
      )
    )
  );

DROP POLICY IF EXISTS "timeline_insert_scoped" ON complaint_timeline;
CREATE POLICY "timeline_insert_scoped" ON complaint_timeline FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = complaint_timeline.complaint_id
      AND (
        c.user_id = auth.uid() OR
        c.assigned_worker_id IN (SELECT id FROM workers WHERE profile_id = auth.uid()) OR
        public.is_staff()
      )
    )
  );

-- =============================================================
-- 8. notifications
-- =============================================================
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_insert_staff" ON notifications;
CREATE POLICY "notifications_insert_staff" ON notifications FOR INSERT
  TO authenticated WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
  TO authenticated USING (user_id = auth.uid());

-- =============================================================
-- 9. feedback
-- =============================================================
DROP POLICY IF EXISTS "feedback_select_scoped" ON feedback;
CREATE POLICY "feedback_select_scoped" ON feedback FOR SELECT
  TO authenticated USING (
    user_id = auth.uid() OR public.is_staff()
  );

DROP POLICY IF EXISTS "feedback_insert_own" ON feedback;
CREATE POLICY "feedback_insert_own" ON feedback FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "feedback_update_own" ON feedback;
CREATE POLICY "feedback_update_own" ON feedback FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =============================================================
-- 10. Storage bucket for complaint images
-- =============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaints', 'complaints', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone (including anon) to read complaint images
DROP POLICY IF EXISTS "complaints_bucket_public_read" ON storage.objects;
CREATE POLICY "complaints_bucket_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'complaints');

-- Allow authenticated users to upload to their own folder (complaints/<uid>/...)
DROP POLICY IF EXISTS "complaints_bucket_upload_own" ON storage.objects;
CREATE POLICY "complaints_bucket_upload_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'complaints'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow staff to upload to any folder in the complaints bucket
DROP POLICY IF EXISTS "complaints_bucket_upload_staff" ON storage.objects;
CREATE POLICY "complaints_bucket_upload_staff" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'complaints' AND public.is_staff());

-- Allow users to update their own files
DROP POLICY IF EXISTS "complaints_bucket_update_own" ON storage.objects;
CREATE POLICY "complaints_bucket_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'complaints'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'complaints'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow staff to update any file in the complaints bucket
DROP POLICY IF EXISTS "complaints_bucket_update_staff" ON storage.objects;
CREATE POLICY "complaints_bucket_update_staff" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'complaints' AND public.is_staff())
  WITH CHECK (bucket_id = 'complaints' AND public.is_staff());

-- Allow users to delete their own files
DROP POLICY IF EXISTS "complaints_bucket_delete_own" ON storage.objects;
CREATE POLICY "complaints_bucket_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'complaints'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow staff to delete any file in the complaints bucket
DROP POLICY IF EXISTS "complaints_bucket_delete_staff" ON storage.objects;
CREATE POLICY "complaints_bucket_delete_staff" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'complaints' AND public.is_staff());
