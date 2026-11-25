import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Pencil, Plus } from "lucide-react";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { logoutAction } from "@/actions/auth";

export const instant = false;

function StatusBadge({ status }: { status: string }) {
  if (status === "disetujui") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
        Disetujui
      </span>
    );
  }
  if (status === "revisi") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        Revisi
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      Diajukan
    </span>
  );
}

export default async function JurnalPage() {
  const session = await getSession();
  if (!session || session.role !== "siswa") {
    redirect("/masuk");
  }

  const { data: siswa } = await getSupabaseAdmin()
    .from("siswa")
    .select("id, nama, kelas, tempat_pkl, pembimbing")
    .eq("id", session.siswaId)
    .maybeSingle();

  const { data: journals, error } = await getSupabaseAdmin()
    .from("jurnal")
    .select("id, tanggal, kegiatan, kompetensi, durasi_jam, status, catatan")
    .eq("siswa_id", session.siswaId)
    .order("tanggal", { ascending: false });

  const list = journals ?? [];
  const totalJam = list.reduce(
    (sum, item) => sum + Number(item.durasi_jam || 0),
    0,
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              Dashboard Murid PKL
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              {siswa?.nama ?? session.nama}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {siswa
                ? `${siswa.kelas} • ${siswa.tempat_pkl} • Pembimbing: ${siswa.pembimbing}`
                : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/jurnal/baru"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              Tulis Jurnal
            </Link>

            <form action={logoutAction.bind(null, "/masuk")}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500">Total Jurnal</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {list.length}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500">Total Jam PKL</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {totalJam} Jam
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-slate-500">Perlu Revisi</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {list.filter((j) => j.status === "revisi").length}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            Gagal memuat data jurnal.
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">
              Riwayat Jurnal Harian
            </h2>
          </div>

          {list.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Belum ada jurnal yang ditulis. Klik <strong>Tulis Jurnal</strong>{" "}
              untuk memulai.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {list.map((item) => {
                const canEdit = item.status !== "disetujui";
                return (
                  <div
                    key={item.id}
                    className="p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
                  >
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-sm font-semibold text-slate-900">
                          {item.tanggal}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-medium text-slate-600">
                          {item.kompetensi}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-blue-700">
                          {item.durasi_jam} jam
                        </span>
                        <StatusBadge status={item.status} />
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed">
                        {item.kegiatan}
                      </p>

                      {item.catatan && (
                        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                          <span className="font-semibold">
                            Catatan Pembimbing:
                          </span>{" "}
                          {item.catatan}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0">
                      {canEdit ? (
                        <Link
                          href={`/jurnal/${item.id}/ubah`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Ubah
                        </Link>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-500">
                          Terkunci
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
