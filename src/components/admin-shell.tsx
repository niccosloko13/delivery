"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, CreditCard, Truck, Ticket, Settings2, LogOut, Salad, Image as ImageIcon, Layers3, Boxes, Shapes } from "lucide-react";

const navItems = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/settings", label: "إعدادات المطعم", icon: Settings2 },
  { href: "/admin/payments", label: "طرق الدفع", icon: CreditCard },
  { href: "/admin/delivery", label: "التوصيل", icon: Truck },
  { href: "/admin/orders", label: "الطلبات", icon: Package },
  { href: "/admin/coupons", label: "الكوبونات", icon: Ticket },
  { href: "/admin/catalog", label: "المنيو والمنتجات", icon: Salad },
  { href: "/admin/catalog/categories", label: "الأقسام", icon: Shapes },
  { href: "/admin/catalog/modifiers", label: "الإضافات", icon: Layers3 },
  { href: "/admin/catalog/ingredients", label: "المكونات", icon: Boxes },
  { href: "/admin/catalog/media", label: "مكتبة الصور", icon: ImageIcon },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-black/5 bg-[#0f3d2e] px-5 py-6 text-white lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:border-b-0 lg:border-l">
          <div className="mb-8">
            <div className="text-2xl font-black">ألف سالاد</div>
            <div className="mt-1 text-sm text-white/70">لوحة الإدارة</div>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active ? "bg-white text-[#0f3d2e]" : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={logout}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-3 text-sm font-bold text-white/90 transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
          <div className="mt-8 rounded-3xl bg-white/10 p-4 text-sm text-white/70">
            بيانات الدخول الافتراضية للتجربة فقط. غيّر كلمة السر قبل نشر الموقع.
          </div>
        </aside>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
