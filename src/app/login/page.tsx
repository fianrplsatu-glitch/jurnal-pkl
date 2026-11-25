// src/app/login/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginAdminForm } from "@/components/AuthForms";

export const instant = false;

export default async function LoginPage() {
  const session = await getSession();
  if (session?.role === "admin") {
    redirect("/admin");
  }
  return <LoginAdminForm />;
}
