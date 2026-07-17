"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Leaf, MapPin, Search, ShoppingBag, User2 } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useRestaurantSettings } from "@/components/settings-provider";
import { InstallAppButton } from "@/components/install-app-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { cn, formatEGP } from "@/lib/utils";

const mobileNav = [
  { href: "/", label: "الرئيسية" },
  { href: "/menu", label: "المنيو" },
  { href: "/promotions", label: "العروض" },
  { href: "/track", label: "طلباتي" },
  { href: "/account", label: "حسابي" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { cart, favorites } = useAppStore();
  const settings = useRestaurantSettings();
  const subtotal = cart.reduce((sum, item) => sum + (item.customPrice ?? item.unitPrice ?? 0) * item.quantity, 0);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/60 bg-[#f6f1e8]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-3 rounded-3xl px-2 py-1 transition hover:bg-white/60">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#123b2b] text-white shadow-soft">
              <Leaf className="h-6 w-6" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-xl font-bold tracking-tight text-[#123022]">{settings.nameAr}</div>
              <div className="text-xs text-slate-500">Alef Salad</div>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center gap-3 rounded-[22px] border border-white/70 bg-white px-4 py-3 shadow-sm lg:flex">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="دور على سلطة، بول، أو مشروب..."
              aria-label="بحث"
            />
          </div>

          <div className="hidden items-center gap-2 rounded-[22px] border border-white/70 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm xl:flex">
            <MapPin className="h-4 w-4 text-emerald-700" />
            <span className="max-w-[280px] truncate">{settings.address}</span>
          </div>

          <LanguageSwitcher className="hidden lg:inline-flex" />

          <Link href="/account" className="hidden items-center gap-2 rounded-[22px] border border-white/70 bg-white px-4 py-3 text-sm font-semibold shadow-sm lg:flex">
            <User2 className="h-4 w-4" />
            حسابي
          </Link>

          <Link href="/account" className="hidden items-center gap-2 rounded-[22px] border border-white/70 bg-white px-4 py-3 text-sm font-semibold shadow-sm lg:flex">
            <Heart className="h-4 w-4 text-rose-500" />
            {favorites.length}
          </Link>

          <InstallAppButton />

          <Link href="/cart" className="relative ml-auto flex items-center gap-2 rounded-[22px] bg-[#123b2b] px-4 py-3 text-sm font-bold text-white shadow-elevated">
            <ShoppingBag className="h-4 w-4" />
            <span>السلة</span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{cart.length}</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-5 lg:px-8">{children}</main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-white/60 bg-white/92 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {mobileNav.map((item) => {
            const active = path === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-semibold transition",
                  active ? "bg-[#123b2b] text-white shadow-soft" : "text-slate-600",
                )}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="fixed bottom-5 left-5 hidden rounded-full bg-[#123b2b] px-4 py-2 text-sm font-bold text-white shadow-elevated lg:block">
        إجمالي السلة: {formatEGP(subtotal)}
      </div>
    </div>
  );
}
