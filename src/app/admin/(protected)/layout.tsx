import { requireAdmin } from "@/lib/admin/session";
import { AdminShell } from "@/components/admin-shell";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}
