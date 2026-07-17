"use client";

import { useEffect, useMemo, useState } from "react";
import type { RestaurantSettings, WhatsAppMessageTemplate } from "@/types/settings";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { defaultRestaurantSettings } from "@/lib/settings/defaults";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings>(defaultRestaurantSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .finally(() => setLoading(false));
  }, []);

  const preview = useMemo(() => renderPreview(settings.checkoutMessage, settings), [settings]);

  async function save() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setMessage(response.ok ? "تم حفظ الإعدادات بنجاح" : "حصلت مشكلة، جرّب تاني");
  }

  if (loading) {
    return <div className="rounded-[32px] bg-white p-8 shadow-soft">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <header className="rounded-[32px] bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-black">إعدادات المطعم</h1>
        <p className="mt-2 text-slate-600">كل تعديل هنا هيأثر على الموقع، الشيك آوت، ورسالة واتساب.</p>
      </header>

      {message ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-700">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="بيانات المطعم">
          <Grid>
            <Input label="اسم المطعم بالعربي" value={settings.nameAr} onChange={(value) => setSettings({ ...settings, nameAr: value })} />
            <Input label="اسم المطعم بالإنجليزي" value={settings.nameEn} onChange={(value) => setSettings({ ...settings, nameEn: value })} />
            <Input label="وصف المطعم" value={settings.description} onChange={(value) => setSettings({ ...settings, description: value })} className="md:col-span-2" />
            <Input label="رقم الموبايل" value={settings.phone} onChange={(value) => setSettings({ ...settings, phone: value })} />
            <Input label="رقم واتساب الطلبات" value={settings.whatsapp} onChange={(value) => setSettings({ ...settings, whatsapp: value.replace(/[^\d]/g, "") })} />
            <Input label="العنوان" value={settings.address} onChange={(value) => setSettings({ ...settings, address: value })} className="md:col-span-2" />
            <Input label="المنطقة" value={settings.area} onChange={(value) => setSettings({ ...settings, area: value })} />
            <Input label="المدينة" value={settings.city} onChange={(value) => setSettings({ ...settings, city: value })} />
          </Grid>
        </Card>

        <Card title="التوصيل والفتح">
          <Grid>
            <Input label="ميعاد الفتح" value={settings.openTime} onChange={(value) => setSettings({ ...settings, openTime: value })} />
            <Input label="ميعاد القفل" value={settings.closeTime} onChange={(value) => setSettings({ ...settings, closeTime: value })} />
            <Input label="أقل وقت للتوصيل" value={String(settings.minDeliveryTime)} onChange={(value) => setSettings({ ...settings, minDeliveryTime: Number(value) || 0 })} />
            <Input label="أقصى وقت للتوصيل" value={String(settings.maxDeliveryTime)} onChange={(value) => setSettings({ ...settings, maxDeliveryTime: Number(value) || 0 })} />
            <Input label="الحد الأدنى للطلب" value={String(settings.minimumOrder)} onChange={(value) => setSettings({ ...settings, minimumOrder: Number(value) || 0 })} />
            <Input label="رسوم التوصيل" value={String(settings.deliveryFee)} onChange={(value) => setSettings({ ...settings, deliveryFee: Number(value) || 0 })} />
            <Input label="المطعم مقفول" value={settings.status} onChange={(value) => setSettings({ ...settings, status: value as RestaurantSettings["status"] })} className="md:col-span-2" />
            <Input label="رسالة المطعم المقفول" value={settings.closedMessage} onChange={(value) => setSettings({ ...settings, closedMessage: value })} className="md:col-span-2" />
          </Grid>
        </Card>

        <Card title="رسالة واتساب">
          <Grid>
            <Input label="عنوان الرسالة" value={settings.checkoutMessage.title} onChange={(value) => setSettings({ ...settings, checkoutMessage: { ...settings.checkoutMessage, title: value } })} className="md:col-span-2" />
            <TextArea label="قالب الرسالة" value={settings.checkoutMessage.body} onChange={(value) => setSettings({ ...settings, checkoutMessage: { ...settings.checkoutMessage, body: value } })} className="md:col-span-2 min-h-72" />
          </Grid>
          <div className="mt-4 rounded-2xl bg-[#fbfaf6] p-4 text-sm leading-7 whitespace-pre-wrap">{preview}</div>
        </Card>

        <Card title="رابط واتساب">
          <div className="rounded-2xl bg-[#fbfaf6] p-4 text-sm break-all">https://wa.me/{settings.whatsapp}</div>
          <button type="button" className="mt-4 rounded-2xl border border-slate-200 px-4 py-3 font-bold">جرّب رقم الواتساب</button>
        </Card>
      </div>

      <div className="flex gap-3">
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-[#0f3d2e] px-5 py-4 font-bold text-white disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
        <button type="button" onClick={() => setSettings(defaultRestaurantSettings)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-4 font-bold">
          <RotateCcw className="h-4 w-4" />
          استرجاع الافتراضي
        </button>
      </div>
    </div>
  );
}

function renderPreview(template: WhatsAppMessageTemplate, settings: RestaurantSettings) {
  return template.body
    .replaceAll("{{restaurantName}}", settings.nameAr)
    .replaceAll("{{orderNumber}}", "AS-123456")
    .replaceAll("{{date}}", "١٦/٠٧/٢٠٢٦")
    .replaceAll("{{time}}", "٩:٣٥ م")
    .replaceAll("{{customerName}}", "أحمد محمد")
    .replaceAll("{{customerPhone}}", "٠١٠٠٠٠٠٠٠٠٠")
    .replaceAll("{{address}}", settings.address)
    .replaceAll("{{locationUrl}}", "https://maps.google.com/?q=30.0,31.0")
    .replaceAll("{{items}}", "١× سيزر تشيكن سالاد\nسعر الوحدة: ١٨٥ جنيه\nإجمالي الصنف: ١٨٥ جنيه")
    .replaceAll("{{subtotal}}", "١٨٥ جنيه")
    .replaceAll("{{deliveryFee}}", `${settings.deliveryFee} جنيه`)
    .replaceAll("{{discount}}", "٢٠ جنيه")
    .replaceAll("{{total}}", "١٩٠ جنيه")
    .replaceAll("{{paymentMethod}}", "كاش عند الاستلام")
    .replaceAll("{{paymentDetails}}", "")
    .replaceAll("{{deliveryTime}}", "في أسرع وقت")
    .replaceAll("{{notes}}", "من غير بصل");
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[32px] bg-white p-6 shadow-soft">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function Input({ label, value, onChange, className }: { label: string; value: string; onChange: (value: string) => void; className?: string }) {
  return (
    <label className={`block ${className || ""}`}>
      <div className="mb-2 text-sm font-semibold text-slate-700">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-[#fbfaf6] px-4 py-3 outline-none focus:border-[#0f3d2e]" />
    </label>
  );
}

function TextArea({ label, value, onChange, className }: { label: string; value: string; onChange: (value: string) => void; className?: string }) {
  return (
    <label className={`block ${className || ""}`}>
      <div className="mb-2 text-sm font-semibold text-slate-700">{label}</div>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-[#fbfaf6] px-4 py-3 outline-none focus:border-[#0f3d2e]" />
    </label>
  );
}
