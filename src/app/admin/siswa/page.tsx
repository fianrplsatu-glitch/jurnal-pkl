// src/app/admin/siswa/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { AdminSiswaManager } from "@/components/AdminSiswaManager";

export default async function AdminSiswaPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const { data: siswaRows } = await supabaseAdmin
    .from("siswa")
    .select("id, nama, kelas, tempat_pkl, pembimbing, kode")
    .order("id", { ascending: true });

  const { data: jurnalRows } = await supabaseAdmin
    .from("jurnal")
    .select("siswa_id");

  const countMap = new Map<number, number>();
  for (const j of jurnalRows ?? []) {
    const id = Number(j.siswa_id);
    countMap.set(id, (countMap.get(id) ?? 0) + 1);
  }

  const formattedSiswa = (siswaRows ?? []).map((s) => ({
    id: Number(s.id),
    nama: s.nama,
    kelas: s.kelas,
    tempat_pkl: s.tempat_pkl,
    pembimbing: s.pembimbing,
    kode: s.kode,
    jumlahJurnal: countMap.get(Number(s.id)) ?? 0,
  }));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Panel Admin
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            Kelola Data Siswa PKL
          </h1>
        </div>

        <AdminSiswaManager initialSiswa={formattedSiswa} />
      </div>
    </main>
  );
}
