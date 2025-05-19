
-- Create a storage bucket for tasks
INSERT INTO storage.buckets (id, name, public)
VALUES ('tasks', 'Task Attachments', true);

-- Allow authenticated users to upload files to the bucket
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tasks');

-- Allow authenticated users to read files
CREATE POLICY "Allow authenticated users to read files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'tasks');

-- Allow users to update their own files
CREATE POLICY "Allow users to update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'tasks' AND auth.uid() = owner);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'tasks' AND auth.uid() = owner);
