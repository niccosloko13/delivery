"use client";

import { useEffect, useState } from "react";
import type { RestaurantSettings, PaymentMethodConfig } from "@/types/settings";
import { Loader2, Plus, Save } from "lucide-react";
import { defaultRestaurantSettings } from "@/lib/settings/defaults";

export default function AdminPaymentsPage() {
  const [settings, setSettings] = useState<RestaurantSettings>(defaultRestaurantSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((data) => setSettings(data)).finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    setSaving(false);
  }

  function updateMethod(index: number, patch: Partial<PaymentMethodConfig>) {
    setSettings((prev) => ({ ...prev, paymentMethods: prev.paymentMethods.map((method, i) => (i === index ? { ...method, ...patch } : method)) }));
  }

  function move(index: number, direction: -1 | 1) {
    setSettings((prev) => {
      const next = [...prev.paymentMethods];
      const swap = index + direction;
      if (swap < 0 || swap >= next.length) return prev;
      [next[index], next[swap]] = [next[swap], next[index]];
      return { ...prev, paymentMethods: next.map((method, i) => ({ ...method, order: i + 1 })) };
    });
  }

  function addWallet() {
    setSettings((prev) => ({
      ...prev,
      wallets: [...prev.wallets, { id: crypto.randomUUID(), nameAr: "محفظة جديدة", enabled: true, requiresProof: true }],
    }));
  }

  if (loading) return <div className="rounded-[32px] bg-white p-8 shadow-soft">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <header className="rounded-[32px] bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-black">طرق الدفع</h1>
        <p className="mt-2 text-slate-600">فعّل أو عطّل وبدّل ترتيب الطرق اللي بتظهر في الشيك آوت.</p>
      </header>

      <section className="space-y-4 rounded-[32px] bg-white p-6 shadow-soft">
        <h2 className="text-xl font-bold">المهام الأساسية</h2>
        <div className="grid gap-4">
          {settings.paymentMethods.map((method, index) => (
            <div key={method.id} className="rounded-3xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-bold">{method.nameAr}</div>
                  <div className="text-sm text-slate-500">{method.type}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => move(index, -1)} className="rounded-xl border px-3 py-2 text-sm">أعلى</button>
                  <button type="button" onClick={() => move(index, 1)} className="rounded-xl border px-3 py-2 text-sm">أسفل</button>
                  <label className="flex items-center gap-2 rounded-xl bg-[#fbfaf6] px-3 py-2 text-sm">
                    <input type="checkbox" checked={method.enabled} onChange={(e) => updateMethod(index, { enabled: e.target.checked })} />
                    مفعّل
                  </label>
                </div>
              </div>
              <textarea
                value={method.instructions || ""}
                onChange={(e) => updateMethod(index, { instructions: e.target.value })}
                className="mt-3 min-h-24 w-full rounded-2xl border border-slate-200 bg-[#fbfaf6] px-4 py-3"
                placeholder="تعليمات الدفع"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">المحافظ الإلكترونية</h2>
          <button type="button" onClick={addWallet} className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 font-bold">
            <Plus className="h-4 w-4" />
            إضافة محفظة
          </button>
        </div>
        <div className="mt-4 grid gap-4">
          {settings.wallets.map((wallet, index) => (
            <div key={wallet.id} className="grid gap-3 rounded-3xl border border-slate-200 p-4 md:grid-cols-2">
              <input value={wallet.nameAr} onChange={(e) => setSettings((prev) => ({ ...prev, wallets: prev.wallets.map((item, i) => (i === index ? { ...item, nameAr: e.target.value } : item)) }))} className="rounded-2xl border px-4 py-3" />
              <input value={wallet.operatorAr || ""} onChange={(e) => setSettings((prev) => ({ ...prev, wallets: prev.wallets.map((item, i) => (i === index ? { ...item, operatorAr: e.target.value } : item)) }))} className="rounded-2xl border px-4 py-3" placeholder="الشركة" />
              <input value={wallet.number || ""} onChange={(e) => setSettings((prev) => ({ ...prev, wallets: prev.wallets.map((item, i) => (i === index ? { ...item, number: e.target.value } : item)) }))} className="rounded-2xl border px-4 py-3" placeholder="الرقم" />
              <label className="flex items-center gap-2 rounded-2xl bg-[#fbfaf6] px-4 py-3 text-sm"><input type="checkbox" checked={wallet.enabled} onChange={(e) => setSettings((prev) => ({ ...prev, wallets: prev.wallets.map((item, i) => (i === index ? { ...item, enabled: e.target.checked } : item)) }))} /> مفعّل</label>
            </div>
          ))}
        </div>
      </section>

      <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-[#0f3d2e] px-5 py-4 font-bold text-white disabled:opacity-60">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? "جاري الحفظ..." : "حفظ طرق الدفع"}
      </button>
    </div>
  );
}
