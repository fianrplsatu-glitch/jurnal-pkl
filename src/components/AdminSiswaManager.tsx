// src/components/AdminSiswaManager.tsx
"use client";

import { useActionState, useState, useTransition } from "react";
import { Trash2, UserPlus } from "lucide-react";
import {
  tambahSiswaAction,
  hapusSiswaAction,
  type AdminActionState,
} from "@/actions/admin";

type SiswaItem = {
  id: number;
  nama: string;
  kelas: string;
  tempat_pkl: string;
  pembimbing: string;
  kode: string;
  jumlahJurnal: number;
};

const initialState: AdminActionState = {};

export function AdminSiswaManager({
  initialSiswa,
}: {
  initialSiswa: SiswaItem[];
}) {
  const [state, formAction, isPending] = useActionState(
    tambahSiswaAction,
    initialState,
  );
  const [deleteFeedback, setDeleteFeedback] = useState<AdminActionState>({});
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleDelete(siswaId: number) {
    setDeleteFeedback({});
    startDeleteTransition(async () => {
      const res = await hapusSiswaAction(siswaId);
      setDeleteFeedback(res);
    });
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-slate-800" />
          <h2 className="font-semibold text-slate-900">Tambah Siswa Baru</h2>
        </div>

        {state?.error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {state.error}
          </div>
        )}
        {state?.success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
            {state.success}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="nama"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Nama Lengkap (3–40 huruf)
            </label>
            <input
              id="nama"
              name="nama"
              type="text"
              minLength={3}
              maxLength={40}
              required
              placeholder="Contoh: Fian Adi"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="kelas"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Kelas
            </label>
            <input
              id="kelas"
              name="kelas"
              type="text"
              required
              placeholder="Contoh: XII RPL 1"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="tempat_pkl"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Tempat PKL / DUDI
            </label>
            <input
              id="tempat_pkl"
              name="tempat_pkl"
              type="text"
              required
              placeholder="Contoh: PT Teknologi Nusantara"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="pembimbing"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Guru Pembimbing
            </label>
            <input
              id="pembimbing"
              name="pembimbing"
              type="text"
              required
              placeholder="Contoh: Pak Budi"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <p className="text-xs text-slate-400">
            Kode akses acak (6–12 karakter) akan dibuat otomatis oleh sistem.
          </p>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-semibold transition cursor-pointer"
          >
            {isPending ? "Menyimpan..." : "Tambah Siswa"}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-slate-900">Daftar Siswa Terdaftar</h2>

        {deleteFeedback?.error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {deleteFeedback.error}
          </div>
        )}
        {deleteFeedback?.success && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
            {deleteFeedback.success}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs uppercase">
                <th className="py-3 px-3">Nama</th>
                <th className="py-3 px-3">Kelas</th>
                <th className="py-3 px-3">Tempat PKL</th>
                <th className="py-3 px-3">Kode Masuk</th>
                <th className="py-3 px-3 text-center">Jurnal</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {initialSiswa.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-3 font-medium text-slate-900">
                    {s.nama}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{s.kelas}</td>
                  <td className="py-3 px-3 text-slate-600">{s.tempat_pkl}</td>
                  <td className="py-3 px-3 font-mono text-xs font-semibold text-blue-700">
                    {s.kode}
                  </td>
                  <td className="py-3 px-3 text-center text-xs font-semibold">
                    {s.jumlahJurnal}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      disabled={isDeleting || s.jumlahJurnal > 0}
                      onClick={() => handleDelete(s.id)}
                      title={
                        s.jumlahJurnal > 0
                          ? "Siswa yang sudah punya jurnal tidak bisa dihapus"
                          : "Hapus siswa"
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 text-xs font-medium cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
