import { supabase } from '@/lib/supabase';

/** Synthetic login identity — not a real inbox; used only for Supabase Auth. */
const AUTH_EMAIL_DOMAIN = 'identifit.app';

export const USERNAME_RULES_HINT =
  'Use 3–24 characters: lowercase letters, numbers, and underscores.';

export function normalizeUsernameForAuth(username: string): string {
  return username.trim().toLowerCase();
}

export function validateUsernameFormat(normalized: string): string | null {
  if (normalized.length < 3 || normalized.length > 24) {
    return 'Username must be 3–24 characters.';
  }
  if (!/^[a-z0-9_]+$/.test(normalized)) {
    return USERNAME_RULES_HINT;
  }
  return null;
}

export function validatePasswordForAuth(password: string): string | null {
  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return null;
}

export function usernameToAuthEmail(normalizedUsername: string): string {
  return `${normalizedUsername}@${AUTH_EMAIL_DOMAIN}`;
}

function formatAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) {
    return 'Wrong username or password.';
  }
  if (m.includes('already registered') || m.includes('user already')) {
    return 'That account already exists. Try signing in.';
  }
  if (m.includes('password')) {
    return message;
  }
  return message;
}

export async function signInWithUsernamePassword(
  usernameRaw: string,
  password: string
): Promise<{ error?: string }> {
  const u = normalizeUsernameForAuth(usernameRaw);
  const fmt = validateUsernameFormat(u);
  if (fmt) return { error: fmt };

  const pwdErr = validatePasswordForAuth(password);
  if (pwdErr) return { error: pwdErr };

  const email = usernameToAuthEmail(u);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: formatAuthError(error.message) };
  }
  return {};
}

export async function signUpWithUsernamePassword(
  normalizedUsername: string,
  password: string
): Promise<{ userId?: string; error?: string }> {
  const fmt = validateUsernameFormat(normalizedUsername);
  if (fmt) return { error: fmt };

  const pwdErr = validatePasswordForAuth(password);
  if (pwdErr) return { error: pwdErr };

  const email = usernameToAuthEmail(normalizedUsername);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username: normalizedUsername },
    },
  });

  if (error) {
    return { error: formatAuthError(error.message) };
  }

  const uid = data.user?.id;
  if (!uid) {
    return { error: 'Could not create account. Try again.' };
  }

  return { userId: uid };
}
