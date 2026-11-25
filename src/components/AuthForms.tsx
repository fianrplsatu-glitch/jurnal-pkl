"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { KeyRound, ShieldCheck, ArrowLeft } from "lucide-react";
import {
  loginAdminAction,
  loginSiswaAction,
  type AuthState,
} from "@/actions/auth";

function SubmitButton({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {icon}
      {pending ? "Memproses..." : children}
    </button>
  );
}

function AuthLayout({
  title,
  description,
  icon,
  children,
  backLabel,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  backLabel: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2.5 text-slate-800">
            {icon}
          </div>
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
        </div>

        {children}
      </div>
    </main>
  );
}

export function LoginAdminForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(
    loginAdminAction,
    {},
  );

  return (
    <AuthLayout
      title="Login Guru / Admin"
      description="Masuk untuk mengelola jurnal siswa."
      icon={<ShieldCheck className="h-5 w-5" />}
      backLabel="Kembali ke beranda"
    >
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Kata sandi admin
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            placeholder="Masukkan kata sandi"
          />
        </div>

        {state.error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
          >
            {state.error}
          </p>
        ) : null}

        <SubmitButton icon={<ShieldCheck className="h-4 w-4" />}>
          Masuk sebagai admin
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}

export function MasukSiswaForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(
    loginSiswaAction,
    {},
  );

  return (
    <AuthLayout
      title="Masuk Murid PKL"
      description="Gunakan kode pribadi siswa untuk membuka jurnal."
      icon={<KeyRound className="h-5 w-5" />}
      backLabel="Kembali ke beranda"
    >
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="kode"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Kode siswa
          </label>
          <input
            id="kode"
            name="kode"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            required
            className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm uppercase outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
            placeholder="Contoh: PKL001"
          />
        </div>

        {state.error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
          >
            {state.error}
          </p>
        ) : null}

        <SubmitButton icon={<KeyRound className="h-4 w-4" />}>
          Masuk ke jurnal
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}
