/*
  # Add profile avatar URL to users

  Stores public URL for avatar (Supabase Storage) after upload from the app.
*/

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_url text;
