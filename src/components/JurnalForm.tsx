"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { JurnalFormState } from "@/actions/jurnal";

type JurnalFormProps = {
  action: (
    prevState: JurnalFormState,
    formData: FormData,
  ) => Promise<JurnalFormState>;
  submitLabel: string;
  heading: string;
  initialValues?: {
    tanggal: string;
    kegiatan: string;
    kompetensi: string;
    durasi_jam: string;
  };
  minDate: string;
  maxDate: string;
};

export function JurnalForm({
  action,
  submitLabel,
  heading,
  initialValues,
  minDate,
  maxDate,
}: JurnalFormProps) {
  const initialState: JurnalFormState = {
    values: initialValues ?? {
      tanggal: maxDate,
      kegiatan: "",
      kompetensi: "",
      durasi_jam: "8",
    },
  };

  const [state, formAction, isPending] = useActionState(action, initialState);
  const currentValues = state?.values ?? initialState.values!;

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
      <Link
        href="/jurnal"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Jurnal
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">{heading}</h1>

      {state?.error && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div>
          <label
            htmlFor="tanggal"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Tanggal Kegiatan
          </label>
          <input
            id="tanggal"
            name="tanggal"
            type="date"
            min={minDate}
            max={maxDate}
            defaultValue={currentValues.tanggal}
            required
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-400 mt-1">
            Maksimal hari ini dan paling jauh 7 hari ke belakang (1 jurnal per
            hari).
          </p>
          {state?.fieldErrors?.tanggal && (
            <p className="text-xs text-red-600 mt-1">
              {state.fieldErrors.tanggal}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="kompetensi"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Kompetensi / Topik
          </label>
          <input
            id="kompetensi"
            name="kompetensi"
            type="text"
            minLength={3}
            maxLength={60}
            defaultValue={currentValues.kompetensi}
            placeholder="Contoh: Pengembangan Frontend Next.js"
            required
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-400 mt-1">3–60 karakter.</p>
          {state?.fieldErrors?.kompetensi && (
            <p className="text-xs text-red-600 mt-1">
              {state.fieldErrors.kompetensi}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="durasi_jam"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Durasi (Jam)
          </label>
          <input
            id="durasi_jam"
            name="durasi_jam"
            type="number"
            min={1}
            max={10}
            step={1}
            defaultValue={currentValues.durasi_jam}
            required
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-400 mt-1">
            Bilangan bulat 1–10 jam.
          </p>
          {state?.fieldErrors?.durasi_jam && (
            <p className="text-xs text-red-600 mt-1">
              {state.fieldErrors.durasi_jam}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="kegiatan"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Uraian Kegiatan
          </label>
          <textarea
            id="kegiatan"
            name="kegiatan"
            rows={5}
            minLength={30}
            maxLength={500}
            defaultValue={currentValues.kegiatan}
            placeholder="Jelaskan kegiatan yang Anda kerjakan hari ini secara jelas..."
            required
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-400 mt-1">30–500 karakter.</p>
          {state?.fieldErrors?.kegiatan && (
            <p className="text-xs text-red-600 mt-1">
              {state.fieldErrors.kegiatan}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/jurnal"
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition cursor-pointer"
          >
            {isPending ? "Menyimpan..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
