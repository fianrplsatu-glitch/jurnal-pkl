import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { updateJurnalAction } from "@/actions/jurnal";
import { JurnalForm } from "@/components/JurnalForm";

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function UbahJurnalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "siswa") {
    redirect("/masuk");
  }

  const { id } = await params;
  const jurnalId = Number(id);
  if (!Number.isSafeInteger(jurnalId) || jurnalId <= 0) {
    notFound();
  }

  const { data: jurnal, error } = await supabaseAdmin
    .from("jurnal")
    .select("id, siswa_id, tanggal, kegiatan, kompetensi, durasi_jam, status")
    .eq("id", jurnalId)
    .maybeSingle();

  if (error) {
    throw new Error("Gagal memuat jurnal untuk diubah.", { cause: error });
  }

  if (!jurnal || Number(jurnal.siswa_id) !== session.siswaId) {
    notFound();
  }

  if (jurnal.status === "disetujui") {
    redirect("/jurnal");
  }

  const now = new Date();
  const maxDate = formatDateLocal(now);
  const min = new Date(now);
  min.setDate(min.getDate() - 7);
  const minDate = formatDateLocal(min);

  const boundUpdateAction = updateJurnalAction.bind(null, jurnalId);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <JurnalForm
        action={boundUpdateAction}
        heading="Ubah Jurnal Harian"
        submitLabel="Simpan Perubahan"
        minDate={minDate}
        maxDate={maxDate}
        initialValues={{
          tanggal: String(jurnal.tanggal),
          kegiatan: String(jurnal.kegiatan),
          kompetensi: String(jurnal.kompetensi),
          durasi_jam: String(jurnal.durasi_jam),
        }}
      />
    </main>
  );
}
