"use client";

import { useEffect, useState } from "react";
import type { CouponConfig, RestaurantSettings } from "@/types/settings";
import { Loader2, Plus, Save } from "lucide-react";
import { defaultRestaurantSettings } from "@/lib/settings/defaults";

export default function AdminCouponsPage() {
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

  function updateCoupon(index: number, patch: Partial<CouponConfig>) {
    setSettings((prev) => ({ ...prev, coupons: prev.coupons.map((coupon, i) => (i === index ? { ...coupon, ...patch } : coupon)) }));
  }

  function addCoupon() {
    setSettings((prev) => ({
      ...prev,
      coupons: [...prev.coupons, { code: "NEW10", type: "percent", value: 10, active: true, areas: [] }],
    }));
  }

  if (loading) return <div className="rounded-[32px] bg-white p-8 shadow-soft">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <header className="rounded-[32px] bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-black">الكوبونات</h1>
        <p className="mt-2 text-slate-600">هنا بتعدل ALEF20 وتضيف عروض تانية بسهولة.</p>
      </header>

      <section className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">قائمة الكوبونات</h2>
          <button onClick={addCoupon} className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 font-bold">
            <Plus className="h-4 w-4" />
            إضافة كوبون
          </button>
        </div>
        <div className="mt-4 grid gap-4">
          {settings.coupons.map((coupon, index) => (
            <div key={coupon.code} className="grid gap-3 rounded-3xl border border-slate-200 p-4 md:grid-cols-2">
              <input value={coupon.code} onChange={(e) => updateCoupon(index, { code: e.target.value.toUpperCase() })} className="rounded-2xl border px-4 py-3" placeholder="الكود" />
              <select value={coupon.type} onChange={(e) => updateCoupon(index, { type: e.target.value as CouponConfig["type"] })} className="rounded-2xl border px-4 py-3">
                <option value="percent">نسبة</option>
                <option value="fixed">قيمة ثابتة</option>
              </select>
              <input value={String(coupon.value)} onChange={(e) => updateCoupon(index, { value: Number(e.target.value) || 0 })} className="rounded-2xl border px-4 py-3" placeholder="القيمة" />
              <input value={String(coupon.maxDiscount ?? "")} onChange={(e) => updateCoupon(index, { maxDiscount: e.target.value ? Number(e.target.value) : undefined })} className="rounded-2xl border px-4 py-3" placeholder="الحد الأقصى" />
              <input value={String(coupon.minimumOrder ?? "")} onChange={(e) => updateCoupon(index, { minimumOrder: e.target.value ? Number(e.target.value) : undefined })} className="rounded-2xl border px-4 py-3" placeholder="الحد الأدنى" />
              <label className="flex items-center gap-2 rounded-2xl bg-[#fbfaf6] px-4 py-3 text-sm"><input type="checkbox" checked={coupon.active} onChange={(e) => updateCoupon(index, { active: e.target.checked })} /> مفعّل</label>
            </div>
          ))}
        </div>
      </section>

      <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-[#0f3d2e] px-5 py-4 font-bold text-white disabled:opacity-60">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? "جاري الحفظ..." : "حفظ الكوبونات"}
      </button>
    </div>
  );
}
