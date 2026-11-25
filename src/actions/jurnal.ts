"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";

export type JurnalFormState = {
  error?: string;
  fieldErrors?: {
    tanggal?: string;
    kegiatan?: string;
    kompetensi?: string;
    durasi_jam?: string;
  };
  values?: {
    tanggal: string;
    kegiatan: string;
    kompetensi: string;
    durasi_jam: string;
  };
};

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateBounds() {
  const now = new Date();
  const todayStr = formatDateLocal(now);

  const minDate = new Date(now);
  minDate.setDate(minDate.getDate() - 7);
  const minDateStr = formatDateLocal(minDate);

  return { todayStr, minDateStr };
}

function validateJurnalInput(raw: {
  tanggal: string;
  kegiatan: string;
  kompetensi: string;
  durasiRaw: string;
}) {
  const fieldErrors: NonNullable<JurnalFormState["fieldErrors"]> = {};
  const { todayStr, minDateStr } = getDateBounds();

  if (!raw.tanggal) {
    fieldErrors.tanggal = "Tanggal jurnal wajib dipilih.";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(raw.tanggal)) {
    fieldErrors.tanggal = "Format tanggal tidak valid.";
  } else if (raw.tanggal > todayStr) {
    fieldErrors.tanggal = "Tanggal jurnal tidak boleh di masa depan.";
  } else if (raw.tanggal < minDateStr) {
    fieldErrors.tanggal = "Tanggal jurnal paling jauh 7 hari ke belakang.";
  }

  const kegiatanTrimmed = raw.kegiatan.trim();
  if (kegiatanTrimmed.length < 30 || kegiatanTrimmed.length > 500) {
    fieldErrors.kegiatan = "Uraian kegiatan wajib 30–500 karakter.";
  }

  const kompetensiTrimmed = raw.kompetensi.trim();
  if (kompetensiTrimmed.length < 3 || kompetensiTrimmed.length > 60) {
    fieldErrors.kompetensi = "Kompetensi wajib 3–60 karakter.";
  }

  const durasiNum = Number(raw.durasiRaw);
  if (
    !raw.durasiRaw ||
    !Number.isInteger(durasiNum) ||
    durasiNum < 1 ||
    durasiNum > 10
  ) {
    fieldErrors.durasi_jam =
      "Durasi wajib bilangan bulat antara 1 sampai 10 jam.";
  }

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
    cleaned: {
      tanggal: raw.tanggal,
      kegiatan: kegiatanTrimmed,
      kompetensi: kompetensiTrimmed,
      durasi_jam: durasiNum,
    },
  };
}

export async function createJurnalAction(
  _prevState: JurnalFormState,
  formData: FormData,
): Promise<JurnalFormState> {
  const session = await getSession();
  if (!session || session.role !== "siswa") {
    return { error: "Sesi murid tidak valid. Silakan masuk kembali." };
  }

  const rawValues = {
    tanggal: String(formData.get("tanggal") ?? ""),
    kegiatan: String(formData.get("kegiatan") ?? ""),
    kompetensi: String(formData.get("kompetensi") ?? ""),
    durasi_jam: String(formData.get("durasi_jam") ?? ""),
  };

  const validation = validateJurnalInput({
    tanggal: rawValues.tanggal,
    kegiatan: rawValues.kegiatan,
    kompetensi: rawValues.kompetensi,
    durasiRaw: rawValues.durasi_jam,
  });

  if (!validation.isValid) {
    return {
      error: "Periksa kembali isian formulir yang belum sesuai.",
      fieldErrors: validation.fieldErrors,
      values: rawValues,
    };
  }

  const { data: existing } = await supabaseAdmin
    .from("jurnal")
    .select("id")
    .eq("siswa_id", session.siswaId)
    .eq("tanggal", validation.cleaned.tanggal)
    .maybeSingle();

  if (existing) {
    return {
      error:
        "Anda sudah mengisi jurnal untuk tanggal tersebut. Hanya boleh satu jurnal per hari.",
      fieldErrors: { tanggal: "Sudah ada jurnal pada tanggal ini." },
      values: rawValues,
    };
  }

  const { error: insertError } = await supabaseAdmin.from("jurnal").insert({
    siswa_id: session.siswaId,
    tanggal: validation.cleaned.tanggal,
    kegiatan: validation.cleaned.kegiatan,
    kompetensi: validation.cleaned.kompetensi,
    durasi_jam: validation.cleaned.durasi_jam,
    status: "diajukan",
    catatan: null,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        error:
          "Anda sudah mengisi jurnal untuk tanggal tersebut. Hanya boleh satu jurnal per hari.",
        fieldErrors: { tanggal: "Sudah ada jurnal pada tanggal ini." },
        values: rawValues,
      };
    }
    return {
      error: "Gagal menyimpan jurnal ke basis data. Silakan coba lagi.",
      values: rawValues,
    };
  }

  revalidatePath("/jurnal");
  redirect("/jurnal");
}

export async function updateJurnalAction(
  jurnalId: number,
  _prevState: JurnalFormState,
  formData: FormData,
): Promise<JurnalFormState> {
  const session = await getSession();
  if (!session || session.role !== "siswa") {
    return { error: "Sesi murid tidak valid. Silakan masuk kembali." };
  }

  const rawValues = {
    tanggal: String(formData.get("tanggal") ?? ""),
    kegiatan: String(formData.get("kegiatan") ?? ""),
    kompetensi: String(formData.get("kompetensi") ?? ""),
    durasi_jam: String(formData.get("durasi_jam") ?? ""),
  };

  const { data: existingJurnal, error: fetchError } = await supabaseAdmin
    .from("jurnal")
    .select("id, siswa_id, status")
    .eq("id", jurnalId)
    .maybeSingle();

  if (fetchError || !existingJurnal) {
    return { error: "Data jurnal tidak ditemukan." };
  }

  if (Number(existingJurnal.siswa_id) !== session.siswaId) {
    return {
      error:
        "Anda tidak memiliki akses untuk mengubah jurnal milik siswa lain.",
    };
  }

  if (existingJurnal.status === "disetujui") {
    return {
      error:
        "Jurnal yang sudah disetujui terkunci dan tidak dapat diubah lagi.",
      values: rawValues,
    };
  }

  const validation = validateJurnalInput({
    tanggal: rawValues.tanggal,
    kegiatan: rawValues.kegiatan,
    kompetensi: rawValues.kompetensi,
    durasiRaw: rawValues.durasi_jam,
  });

  if (!validation.isValid) {
    return {
      error: "Periksa kembali isian formulir yang belum sesuai.",
      fieldErrors: validation.fieldErrors,
      values: rawValues,
    };
  }

  const { data: duplicateDate } = await supabaseAdmin
    .from("jurnal")
    .select("id")
    .eq("siswa_id", session.siswaId)
    .eq("tanggal", validation.cleaned.tanggal)
    .neq("id", jurnalId)
    .maybeSingle();

  if (duplicateDate) {
    return {
      error: "Tanggal tersebut sudah dipakai pada jurnal lain milik Anda.",
      fieldErrors: { tanggal: "Tanggal sudah terpakai jurnal lain." },
      values: rawValues,
    };
  }

  const { error: updateError } = await supabaseAdmin
    .from("jurnal")
    .update({
      tanggal: validation.cleaned.tanggal,
      kegiatan: validation.cleaned.kegiatan,
      kompetensi: validation.cleaned.kompetensi,
      durasi_jam: validation.cleaned.durasi_jam,
      status: "diajukan",
      catatan: null,
    })
    .eq("id", jurnalId)
    .eq("siswa_id", session.siswaId);

  if (updateError) {
    return {
      error: "Gagal memperbarui jurnal. Silakan coba lagi.",
      values: rawValues,
    };
  }

  revalidatePath("/jurnal");
  redirect("/jurnal");
}
