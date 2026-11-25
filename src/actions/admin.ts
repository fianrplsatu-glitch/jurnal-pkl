"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";

export type AdminActionState = {
  error?: string;
  success?: string;
};

function generateRandomKode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(4);
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[bytes[i] % chars.length];
  }
  return `PKL-${suffix}`;
}

export async function setujuiJurnalAction(
  jurnalId: number,
): Promise<AdminActionState> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "Akses ditolak. Silakan login sebagai admin." };
  }

  const { error } = await supabaseAdmin
    .from("jurnal")
    .update({ status: "disetujui", catatan: null })
    .eq("id", jurnalId);

  if (error) {
    return { error: "Gagal menyetujui jurnal." };
  }

  revalidatePath("/admin");
  return { success: "Jurnal berhasil disetujui." };
}

export async function revisiJurnalAction(
  jurnalId: number,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "Akses ditolak. Silakan login sebagai admin." };
  }

  const catatan = String(formData.get("catatan") ?? "").trim();
  if (catatan.length < 5) {
    return { error: "Catatan revisi wajib diisi minimal 5 huruf." };
  }

  const { error } = await supabaseAdmin
    .from("jurnal")
    .update({ status: "revisi", catatan })
    .eq("id", jurnalId);

  if (error) {
    return {
      error: "Gagal menyimpan status revisi. Pastikan catatan minimal 5 huruf.",
    };
  }

  revalidatePath("/admin");
  return { success: "Status jurnal diubah menjadi revisi." };
}

export async function tambahSiswaAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "Akses ditolak. Silakan login sebagai admin." };
  }

  const nama = String(formData.get("nama") ?? "").trim();
  const kelas = String(formData.get("kelas") ?? "").trim();
  const tempat_pkl = String(formData.get("tempat_pkl") ?? "").trim();
  const pembimbing = String(formData.get("pembimbing") ?? "").trim();

  if (nama.length < 3 || nama.length > 40) {
    return { error: "Nama siswa wajib 3–40 huruf." };
  }
  if (!kelas || !tempat_pkl || !pembimbing) {
    return { error: "Kelas, tempat PKL, dan pembimbing wajib diisi." };
  }

  let kode = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateRandomKode();
    const { data: existing } = await supabaseAdmin
      .from("siswa")
      .select("id")
      .eq("kode", candidate)
      .maybeSingle();
    if (!existing) {
      kode = candidate;
      break;
    }
  }

  if (!kode) {
    return { error: "Gagal membuat kode unik siswa. Silakan coba lagi." };
  }

  const { error } = await supabaseAdmin.from("siswa").insert({
    nama,
    kelas,
    tempat_pkl,
    pembimbing,
    kode,
  });

  if (error) {
    return { error: "Gagal menambahkan data siswa." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/siswa");
  return {
    success: `Siswa "${nama}" berhasil ditambahkan dengan kode ${kode}.`,
  };
}

export async function hapusSiswaAction(
  siswaId: number,
): Promise<AdminActionState> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "Akses ditolak. Silakan login sebagai admin." };
  }

  const { count, error: countError } = await supabaseAdmin
    .from("jurnal")
    .select("id", { count: "exact", head: true })
    .eq("siswa_id", siswaId);

  if (countError) {
    return { error: "Gagal memeriksa riwayat jurnal siswa." };
  }

  if ((count ?? 0) > 0) {
    return {
      error: "Siswa yang sudah memiliki jurnal tidak dapat dihapus.",
    };
  }

  const { error: deleteError } = await supabaseAdmin
    .from("siswa")
    .delete()
    .eq("id", siswaId);

  if (deleteError) {
    if (deleteError.code === "23503") {
      return {
        error: "Siswa yang sudah memiliki jurnal tidak dapat dihapus.",
      };
    }
    return { error: "Gagal menghapus data siswa." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/siswa");
  return { success: "Data siswa berhasil dihapus." };
}
