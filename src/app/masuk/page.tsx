// src/app/masuk/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { MasukSiswaForm } from "@/components/AuthForms";

export const instant = false;

export default async function MasukPage() {
  const session = await getSession();
  if (session?.role === "siswa") {
    redirect("/jurnal");
  }
  return <MasukSiswaForm />;
}
