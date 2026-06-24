import { supabase } from './supabase';

/** Postgres unique_violation — duplicate username or id */
function formatDbError(message: string, code?: string): string {
  const isDup =
    code === '23505' ||
    /duplicate key/i.test(message) ||
    /unique constraint/i.test(message);
  if (isDup) {
    return 'That username is already taken. Try another.';
  }
  return message;
}

export interface User {
  id: string;
  username: string;
  name?: string;
  /** Public Storage URL for profile photo */
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export async function updateUserProfile(
  userId: string,
  fields: {
    username?: string;
    name?: string;
    avatar_url?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        ...fields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function saveUsername(userId: string, username: string, name?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (checkError) {
      return { success: false, error: checkError.message };
    }

    if (existingUser) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ username, name, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) {
        return {
          success: false,
          error: formatDbError(updateError.message, updateError.code),
        };
      }
    } else {
      const { error: insertError } = await supabase
        .from('users')
        .insert({ id: userId, username, name });

      if (insertError) {
        return {
          success: false,
          error: formatDbError(insertError.message, insertError.code),
        };
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getUser(userId: string): Promise<{ user: User | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: data };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function checkUsernameAvailability(username: string): Promise<{ available: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      return { available: false, error: error.message };
    }

    return { available: !data };
  } catch (error) {
    return { available: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
