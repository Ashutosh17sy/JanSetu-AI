/*
# Fix infinite RLS recursion on profiles and related tables

## Problem
The `profiles` table's SELECT policy (`profiles_select_own_or_staff`) contained a subquery
`EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','officer'))`.
When PostgreSQL evaluates a policy on `profiles`, that subquery re-triggers RLS on `profiles`,
which re-evaluates the same policy, causing infinite recursion:
`infinite recursion detected in policy for relation "profiles"`.

The same anti-pattern (`EXISTS (SELECT 1 FROM profiles ...)`) appeared in policies on
departments, complaint_categories, workers, complaints, complaint_timeline, notifications,
and feedback — any of which could trigger the recursion chain when those tables' policies
were evaluated and their subqueries hit the locked-down `profiles` table.

## Fix
1. Create two `SECURITY DEFINER` helper functions that read the caller's role from `profiles`
   with elevated (owner) privileges, bypassing RLS entirely:
   - `public.is_staff()` — true when the authenticated user's role is 'admin' or 'officer'.
   - `public.is_admin()` — true when the authenticated user's role is 'admin'.
   These functions are the recursion breaker: they read `profiles` as the function owner
   (postgres), so no RLS policy on `profiles` is evaluated during the call.

2. Drop and recreate every policy that previously embedded a `profiles` subquery, replacing
   the subquery with a call to `is_staff()` or `is_admin()`. This applies to:
   - profiles: SELECT (self or staff), UPDATE (by admin)
   - departments: INSERT (admin), UPDATE (admin)
   - complaint_categories: INSERT (admin)
   - workers: SELECT (self or staff), INSERT (staff), UPDATE (staff or self)
   - complaints: SELECT (scoped), INSERT (staff), UPDATE (staff)
   - complaint_timeline: SELECT (scoped), INSERT (scoped)
   - notifications: INSERT (staff)
   - feedback: SELECT (scoped)

## Functionality preserved
- Citizens: read/update only their own profile and complaints; insert own complaints/feedback/notifications.
- Staff (admin + officer): read all profiles, complaints, timelines, feedback; insert/update complaints,
  timelines, notifications; manage departments, categories, workers.
- Admin only: update any profile (activate/deactivate, change role/ward); manage departments and categories.
- Workers: read/update complaints assigned to them; read own worker record.

## Notes
1. `SECURITY DEFINER` functions run as their owner (postgres), which bypasses RLS. This is the
   standard Supabase pattern for reading role information from `profiles` without triggering recursion.
2. The functions are `STABLE` and `LANGUAGE sql` for minimal overhead.
3. All policies remain scoped `TO authenticated` as before.
4. No table structure or column changes — only policies and two helper functions.
*/

-- =============================================================
-- 1. Recursion-breaking helper functions (SECURITY DEFINER)
-- =============================================================
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'officer')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- =============================================================
-- 2. profiles — fix recursive SELECT and UPDATE policies
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
-- 3. departments — replace profiles subqueries
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
-- 4. complaint_categories — replace profiles subquery
-- =============================================================
DROP POLICY IF EXISTS "categories_select_all" ON complaint_categories;
CREATE POLICY "categories_select_all" ON complaint_categories FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "categories_modify_admin" ON complaint_categories;
CREATE POLICY "categories_modify_admin" ON complaint_categories FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

-- =============================================================
-- 5. workers — replace profiles subqueries
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
-- 6. complaints — replace profiles subqueries
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
-- 7. complaint_timeline — replace profiles subqueries
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
-- 8. notifications — replace profiles subquery
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
-- 9. feedback — replace profiles subquery
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
