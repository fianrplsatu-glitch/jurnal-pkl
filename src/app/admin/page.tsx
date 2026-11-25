import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Users } from "lucide-react";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logoutAction } from "@/actions/auth";
import { AdminJournalActions } from "@/components/AdminJournalActions";

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

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ siswa?: string; status?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const filterSiswa = resolvedParams.siswa ?? "";
  const filterStatus = resolvedParams.status ?? "";

  const { data: siswaList } = await supabaseAdmin
    .from("siswa")
    .select("id, nama, kelas, tempat_pkl, pembimbing")
    .order("nama", { ascending: true });

  const { data: allJournals } = await supabaseAdmin
    .from("jurnal")
    .select(
      "id, siswa_id, tanggal, kegiatan, kompetensi, durasi_jam, status, catatan",
    )
    .order("tanggal", { ascending: false });

  const students = siswaList ?? [];
  const journals = allJournals ?? [];

  const siswaMap = new Map<number, (typeof students)[number]>();
  for (const s of students) {
    siswaMap.set(Number(s.id), s);
  }

  const rekapPerSiswa = students.map((s) => {
    const sJournals = journals.filter(
      (j) => Number(j.siswa_id) === Number(s.id),
    );
    const jumlahJurnal = sJournals.length;
    const totalJam = sJournals.reduce(
      (acc, j) => acc + Number(j.durasi_jam || 0),
      0,
    );
    const menunggu = sJournals.filter((j) => j.status === "diajukan").length;
    return {
      ...s,
      jumlahJurnal,
      totalJam,
      menunggu,
    };
  });

  const filteredJournals = journals.filter((j) => {
    if (filterSiswa && String(j.siswa_id) !== filterSiswa) return false;
    if (filterStatus && j.status !== filterStatus) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Panel Pembimbing / Admin
            </p>
            <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
              Rekap & Pemeriksaan Jurnal PKL
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/siswa"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition"
            >
              <Users className="w-4 h-4" />
              Kelola Siswa
            </Link>

            <form action={logoutAction.bind(null, "/login")}>
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

        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">
              Rekapitulasi Per Siswa
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs uppercase">
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Tempat PKL</th>
                  <th className="py-3 px-4 text-center">Jumlah Jurnal</th>
                  <th className="py-3 px-4 text-center">Total Jam</th>
                  <th className="py-3 px-4 text-center">Menunggu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rekapPerSiswa.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {row.nama}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{row.kelas}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {row.tempat_pkl}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">
                      {row.jumlahJurnal}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-blue-700">
                      {row.totalJam} jam
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {row.menunggu}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h2 className="font-semibold text-slate-900 text-lg">
                Daftar Seluruh Jurnal
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Saring berdasarkan siswa atau status pemeriksaan.
              </p>
            </div>

            <form
              method="GET"
              action="/admin"
              className="flex flex-wrap items-center gap-3"
            >
              <select
                name="siswa"
                defaultValue={filterSiswa}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="">Semua Siswa</option>
                {students.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.nama} ({s.kelas})
                  </option>
                ))}
              </select>

              <select
                name="status"
                defaultValue={filterStatus}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="">Semua Status</option>
                <option value="diajukan">Diajukan</option>
                <option value="disetujui">Disetujui</option>
                <option value="revisi">Revisi</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium cursor-pointer"
              >
                Terapkan Filter
              </button>

              {(filterSiswa || filterStatus) && (
                <Link
                  href="/admin"
                  className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Reset
                </Link>
              )}
            </form>
          </div>

          {filteredJournals.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              Tidak ada jurnal yang sesuai dengan filter saat ini.
            </p>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredJournals.map((j) => {
                const student = siswaMap.get(Number(j.siswa_id));
                return (
                  <div
                    key={j.id}
                    className="py-5 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5"
                  >
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">
                          {student?.nama ?? "Siswa"}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({student?.kelas ?? "-"})
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-medium text-slate-700">
                          {j.tanggal}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-blue-700">
                          {j.durasi_jam} jam
                        </span>
                        <StatusBadge status={j.status} />
                      </div>

                      <p className="text-xs font-medium text-slate-600">
                        Kompetensi: {j.kompetensi}
                      </p>
                      <p className="text-sm text-slate-800 leading-relaxed">
                        {j.kegiatan}
                      </p>

                      {j.catatan && (
                        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          Catatan saat ini: {j.catatan}
                        </p>
                      )}
                    </div>

                    <AdminJournalActions
                      jurnalId={Number(j.id)}
                      currentCatatan={j.catatan}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
