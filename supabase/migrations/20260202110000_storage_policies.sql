-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('altrea', 'altrea', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatars" ON storage.objects;

-- Policy: Allow authenticated users to upload to avatars folder
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'altrea' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Policy: Allow public read access to all files in altrea bucket
CREATE POLICY "Allow public to read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'altrea');

-- Policy: Allow authenticated users to update files they uploaded
CREATE POLICY "Allow users to update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'altrea' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Policy: Allow authenticated users to delete files they uploaded
CREATE POLICY "Allow users to delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'altrea' AND
  (storage.foldername(name))[1] = 'avatars'
);
