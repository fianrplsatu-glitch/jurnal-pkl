import Link from "next/link";
import { BookOpenCheck, KeyRound, ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center px-6 py-12">
      <div className="max-w-3xl mx-auto w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4">
          <BookOpenCheck className="w-4 h-4" />
          Sistem Informasi Praktik Kerja Lapangan
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
          Jurnal Harian PKL
        </h1>
        <p className="text-slate-600 leading-relaxed mb-8">
          Catat kegiatan harian Praktik Kerja Lapangan secara daring, pantau
          status persetujuan atau revisi dari guru pembimbing, dan kelola
          rekapitulasi jurnal dengan terstruktur.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href={session?.role === "siswa" ? "/jurnal" : "/masuk"}
            className="group flex items-start gap-4 p-5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition"
          >
            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 group-hover:text-blue-700">
                {session?.role === "siswa"
                  ? "Lanjut ke Jurnal Saya"
                  : "Masuk Murid PKL"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Akses jurnal harian menggunakan kode pribadi siswa.
              </p>
            </div>
          </Link>

          <Link
            href={session?.role === "admin" ? "/admin" : "/login"}
            className="group flex items-start gap-4 p-5 rounded-xl border border-slate-200 hover:border-slate-800 hover:bg-slate-50 transition"
          >
            <div className="p-2.5 rounded-lg bg-slate-200 text-slate-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">
                {session?.role === "admin"
                  ? "Lanjut ke Panel Admin"
                  : "Login Guru / Admin"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Periksa jurnal siswa, beri catatan revisi, dan kelola data
                siswa.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
