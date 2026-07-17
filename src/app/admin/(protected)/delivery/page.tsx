"use client";

import { useEffect, useState } from "react";
import type { DeliveryZone, RestaurantSettings } from "@/types/settings";
import { Loader2, Plus, Save } from "lucide-react";
import { defaultRestaurantSettings } from "@/lib/settings/defaults";

export default function AdminDeliveryPage() {
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

  function updateZone(index: number, patch: Partial<DeliveryZone>) {
    setSettings((prev) => ({ ...prev, zones: prev.zones.map((zone, i) => (i === index ? { ...zone, ...patch } : zone)) }));
  }

  function addZone() {
    setSettings((prev) => ({
      ...prev,
      zones: [
        ...prev.zones,
        { id: crypto.randomUUID(), nameAr: "منطقة جديدة", fee: 25, minimumOrder: prev.minimumOrder, estimatedMinMinutes: 25, estimatedMaxMinutes: 40, enabled: true },
      ],
    }));
  }

  if (loading) return <div className="rounded-[32px] bg-white p-8 shadow-soft">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <header className="rounded-[32px] bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-black">إعدادات التوصيل</h1>
        <p className="mt-2 text-slate-600">المنطقة المختارة في الشيك آوت هتغيّر الرسوم والحد الأدنى والوقت تلقائيًا.</p>
      </header>

      <section className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">مناطق التوصيل</h2>
          <button onClick={addZone} className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 font-bold">
            <Plus className="h-4 w-4" />
            إضافة منطقة
          </button>
        </div>
        <div className="mt-4 grid gap-4">
          {settings.zones.map((zone, index) => (
            <div key={zone.id} className="grid gap-3 rounded-3xl border border-slate-200 p-4 md:grid-cols-2">
              <input value={zone.nameAr} onChange={(e) => updateZone(index, { nameAr: e.target.value })} className="rounded-2xl border px-4 py-3" placeholder="اسم المنطقة" />
              <input value={String(zone.fee)} onChange={(e) => updateZone(index, { fee: Number(e.target.value) || 0 })} className="rounded-2xl border px-4 py-3" placeholder="رسوم التوصيل" />
              <input value={String(zone.minimumOrder)} onChange={(e) => updateZone(index, { minimumOrder: Number(e.target.value) || 0 })} className="rounded-2xl border px-4 py-3" placeholder="الحد الأدنى" />
              <input value={String(zone.estimatedMinMinutes)} onChange={(e) => updateZone(index, { estimatedMinMinutes: Number(e.target.value) || 0 })} className="rounded-2xl border px-4 py-3" placeholder="أقل وقت" />
              <input value={String(zone.estimatedMaxMinutes)} onChange={(e) => updateZone(index, { estimatedMaxMinutes: Number(e.target.value) || 0 })} className="rounded-2xl border px-4 py-3" placeholder="أقصى وقت" />
              <label className="flex items-center gap-2 rounded-2xl bg-[#fbfaf6] px-4 py-3 text-sm"><input type="checkbox" checked={zone.enabled} onChange={(e) => updateZone(index, { enabled: e.target.checked })} /> مفعّل</label>
            </div>
          ))}
        </div>
      </section>

      <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-[#0f3d2e] px-5 py-4 font-bold text-white disabled:opacity-60">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? "جاري الحفظ..." : "حفظ التوصيل"}
      </button>
    </div>
  );
}
