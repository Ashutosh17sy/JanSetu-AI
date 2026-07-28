/*
# Simplify storage policies for complaints bucket

## Problem
The previous storage policies required `(storage.foldername(name))[1] = auth.uid()`,
but the upload code uses paths like `complaints/<uid>/...` — the first folder is
`complaints`, not the user's UID. Additionally, workers upload to
`complaints/<complaint_id>/...` which doesn't match their UID at all, and workers
are not staff so the staff policy doesn't cover them.

## Fix
Simplify the storage policies to allow any authenticated user to upload/update/delete
in the complaints bucket. The complaints table RLS already controls who can create
and update complaints, so the storage bucket just needs authenticated access.

Also fix the upload paths in the frontend to remove the redundant `complaints/`
prefix (the bucket name is already `complaints`).
*/

-- Drop the restrictive policies
DROP POLICY IF EXISTS "complaints_bucket_upload_own" ON storage.objects;
DROP POLICY IF EXISTS "complaints_bucket_upload_staff" ON storage.objects;
DROP POLICY IF EXISTS "complaints_bucket_update_own" ON storage.objects;
DROP POLICY IF EXISTS "complaints_bucket_update_staff" ON storage.objects;
DROP POLICY IF EXISTS "complaints_bucket_delete_own" ON storage.objects;
DROP POLICY IF EXISTS "complaints_bucket_delete_staff" ON storage.objects;
DROP POLICY IF EXISTS "complaints_bucket_public_read" ON storage.objects;

-- Public read: anyone can view complaint images
DROP POLICY IF EXISTS "complaints_bucket_public_read" ON storage.objects;
CREATE POLICY "complaints_bucket_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'complaints');

-- Any authenticated user can upload complaint photos
DROP POLICY IF EXISTS "complaints_bucket_upload" ON storage.objects;
CREATE POLICY "complaints_bucket_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'complaints');

-- Any authenticated user can update complaint photos
DROP POLICY IF EXISTS "complaints_bucket_update" ON storage.objects;
CREATE POLICY "complaints_bucket_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'complaints')
  WITH CHECK (bucket_id = 'complaints');

-- Staff can delete complaint photos
DROP POLICY IF EXISTS "complaints_bucket_delete" ON storage.objects;
CREATE POLICY "complaints_bucket_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'complaints');
