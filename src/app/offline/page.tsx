"use client";

import Link from "next/link";
import { RotateCcw, WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(146,184,111,0.18),transparent_28%),linear-gradient(180deg,#f7f3ea_0%,#f5f1e8_55%,#efe8da_100%)] px-4 py-10 text-right">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl flex-col items-center justify-center rounded-[36px] border border-white/70 bg-white/85 p-8 text-center shadow-elevated backdrop-blur-xl">
        <div className="grid h-18 w-18 place-items-center rounded-[28px] bg-[#123b2b] text-white shadow-soft">
          <WifiOff className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-[#123022]">أنت أوفلاين دلوقتي</h1>
        <p className="mt-3 max-w-md text-base leading-8 text-slate-600">اتأكد إن الإنترنت شغال وجرب تاني</p>
        <div className="mt-4 rounded-[24px] bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">محتاج إنترنت علشان تبعت الطلب</div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#123b2b] px-5 py-3 font-bold text-white shadow-elevated transition hover:-translate-y-0.5"
          >
            <RotateCcw className="h-4 w-4" />
            حاول تاني
          </button>
          <Link href="/" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50">
            ارجع للرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
