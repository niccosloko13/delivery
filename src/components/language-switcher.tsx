"use client";

import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <div className={cn("inline-flex items-center overflow-hidden rounded-2xl border border-white/70 bg-white shadow-sm", className)}>
      <button
        type="button"
        onClick={() => setLocale("ar-EG")}
        className={cn("px-3 py-2 text-sm font-semibold transition", locale === "ar-EG" ? "bg-[#123b2b] text-white" : "text-slate-600")}
      >
        العربية
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn("px-3 py-2 text-sm font-semibold transition", locale === "en" ? "bg-[#123b2b] text-white" : "text-slate-600")}
      >
        English
      </button>
    </div>
  );
}
