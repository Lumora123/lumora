import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Lumora" },
  robots: { index: false, follow: false },
};

export const revalidate = 0;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = getSessionUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/profile");

  return (
    <div className="pt-[calc(var(--header-h)+1rem)]">
      <div className="shell grid gap-8 py-6 lg:grid-cols-[220px_1fr] lg:py-10">
        <AdminNav userName={user.name} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
