import { supabase } from '@/lib/supabase';

/** Persisted after onboarding `saveUsername` succeeds — keys Supabase `users` row */
export const CLOUD_USER_ID_STORAGE_KEY = '@identifit/cloud_user_id';

const AVATAR_OBJECT_PATH = 'avatar';

function extensionFromUri(uri: string): 'jpg' | 'png' | 'webp' {
  const lower = uri.toLowerCase();
  if (lower.includes('.png')) return 'png';
  if (lower.includes('.webp')) return 'webp';
  return 'jpg';
}

function contentTypeForExt(ext: string): string {
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

/**
 * Upload local image to Storage and return public URL.
 */
export async function uploadAvatarToStorage(
  userId: string,
  localUri: string
): Promise<{ publicUrl: string | null; error?: string }> {
  try {
    const response = await fetch(localUri);
    const bytes = await response.arrayBuffer();
    const ext = extensionFromUri(localUri);
    const path = `${userId}/${AVATAR_OBJECT_PATH}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, bytes, {
        contentType: contentTypeForExt(ext),
        upsert: true,
      });

    if (uploadError) {
      return { publicUrl: null, error: uploadError.message };
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return { publicUrl: data.publicUrl };
  } catch (e) {
    return {
      publicUrl: null,
      error: e instanceof Error ? e.message : 'Upload failed',
    };
  }
}

/** Remove known avatar objects for this user (best-effort). */
export async function removeAvatarObjectsFromStorage(
  userId: string
): Promise<void> {
  const candidates = ['jpg', 'png', 'webp'].map(
    (ext) => `${userId}/${AVATAR_OBJECT_PATH}.${ext}`
  );
  await supabase.storage.from('avatars').remove(candidates);
}
