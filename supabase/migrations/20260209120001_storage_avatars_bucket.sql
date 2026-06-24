/*
  # Public bucket for profile avatars

  Objects uploaded at path `{userId}/avatar` with upsert.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public delete avatars" ON storage.objects;

CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Public upload avatars"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Public update avatars"
  ON storage.objects FOR UPDATE
  TO public
  USING (bucket_id = 'avatars')
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Public delete avatars"
  ON storage.objects FOR DELETE
  TO public
  USING (bucket_id = 'avatars');
