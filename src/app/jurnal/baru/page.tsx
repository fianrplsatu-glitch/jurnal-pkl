import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createJurnalAction } from "@/actions/jurnal";
import { JurnalForm } from "@/components/JurnalForm";

export const instant = false;

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function JurnalBaruPage() {
  const session = await getSession();
  if (!session || session.role !== "siswa") {
    redirect("/masuk");
  }

  const now = new Date();
  const maxDate = formatDateLocal(now);
  const min = new Date(now);
  min.setDate(min.getDate() - 7);
  const minDate = formatDateLocal(min);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <JurnalForm
        action={createJurnalAction}
        heading="Tulis Jurnal Harian Baru"
        submitLabel="Simpan Jurnal"
        minDate={minDate}
        maxDate={maxDate}
      />
    </main>
  );
}
