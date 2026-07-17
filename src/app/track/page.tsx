"use client";

import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { useAppStore } from "@/store/app-store";

const steps = ["الطلب اتأكد", "المطعم بيجهز الطلب", "الطلب خرج للتوصيل", "الطلب وصل"] as const;

export default function TrackPage() {
  const { activeOrder } = useAppStore();
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setActive((value) => Math.min(value + 1, steps.length - 1)), 3500);
    return () => clearInterval(timer);
  }, []);
  return (
    <SiteShell>
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <h1 className="font-display text-3xl font-bold">تتبع الطلب</h1>
        <div className="mt-8 grid gap-4">
          {steps.map((step, index) => (
            <div key={step} className={`rounded-3xl border p-5 ${index <= active ? "border-[#0f3d2e] bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
              <div className="flex items-center justify-between">
                <div className="font-bold">{step}</div>
                <div className="text-sm">{index <= active ? "شغال" : "مستني"}</div>
              </div>
            </div>
          ))}
        </div>
        {activeOrder ? <div className="mt-6 rounded-3xl bg-slate-50 p-4 text-sm">رقم الطلب: {activeOrder.number}</div> : null}
      </div>
    </SiteShell>
  );
}

