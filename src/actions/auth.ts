"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSession, deleteSession } from "@/lib/session";

export type AuthState = {
  error?: string;
};

export async function loginSiswaAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const rawKode = String(formData.get("kode") ?? "")
    .trim()
    .toUpperCase();

  if (!rawKode) {
    return { error: "Silakan masukkan kode siswa terlebih dahulu." };
  }

  const { data: siswa, error } = await supabaseAdmin
    .from("siswa")
    .select("id, nama, kode")
    .eq("kode", rawKode)
    .maybeSingle();

  if (error || !siswa) {
    return { error: "Kode siswa tidak ditemukan. Periksa kembali kode Anda." };
  }

  await createSession({
    role: "siswa",
    siswaId: Number(siswa.id),
    nama: siswa.nama,
  });

  redirect("/jurnal");
}

export async function loginAdminAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return { error: "Konfigurasi kata sandi admin di server belum diatur." };
  }

  if (!password || password !== expectedPassword) {
    return { error: "Kata sandi admin salah. Silakan coba lagi." };
  }

  await createSession({ role: "admin" });
  redirect("/admin");
}

export async function logoutAction(
  targetRedirect: "/masuk" | "/login" = "/masuk",
) {
  await deleteSession();
  redirect(targetRedirect);
}
