import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[100dvh] max-h-[100dvh] overflow-hidden bg-background">
      <AdminSidebar />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain bg-muted/30 p-4 max-lg:pt-16 md:p-6 md:max-lg:pt-16 lg:p-8">
        <div className="mx-auto max-w-6xl pb-8">{children}</div>
      </main>
    </div>
  );
}
