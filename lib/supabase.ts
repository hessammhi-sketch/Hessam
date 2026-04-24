import { createClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "@/lib/env";

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;

  return createClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
}

export function getSupabaseServerClient() {
  if (!isSupabaseConfigured()) return null;

  return createClient(
    env.supabaseUrl!,
    env.supabaseServiceRoleKey ?? env.supabaseAnonKey!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
}
