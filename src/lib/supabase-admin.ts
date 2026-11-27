import "server-only";
import { createClient } from "@supabase/supabase-js";

function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Konfigurasi Supabase belum lengkap: NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diatur.",
    );
  }
  if (!/^https?:\/\//i.test(supabaseUrl)) {
    throw new Error(
      "Konfigurasi Supabase salah: NEXT_PUBLIC_SUPABASE_URL harus diawali https://.",
    );
  }
  if (supabaseServiceKey.startsWith("sb_publishable_")) {
    throw new Error(
      "Konfigurasi Supabase salah: SUPABASE_SERVICE_ROLE_KEY memakai publishable key, bukan secret/service-role key.",
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

let supabaseAdmin: ReturnType<typeof createSupabaseAdmin> | undefined;

export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createSupabaseAdmin();
  }
  return supabaseAdmin;
}
