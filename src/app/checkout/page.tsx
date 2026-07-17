"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SiteShell } from "@/components/site-shell";
import { useAppStore } from "@/store/app-store";
import { restaurant, addresses } from "@/data/catalog";
import { formatEGP, randomOrderId } from "@/lib/utils";
import { calcSubTotal } from "@/lib/pricing";

const schema = z.object({
  name: z.string().min(2, "اكتب الاسم"),
  phone: z.string().min(8, "اكتب رقم الموبايل"),
  email: z.string().email().optional().or(z.literal("")),
  governorate: z.string().min(2, "اختار المحافظة"),
  area: z.string().min(2, "اختار المنطقة"),
  street: z.string().min(2, "اكتب الشارع"),
  building: z.string().min(1, "رقم العمارة"),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  landmark: z.string().optional(),
  driverNotes: z.string().optional(),
  paymentMethod: z.enum(["cash", "card_on_delivery", "online_card", "wallet"]),
});

type FormValues = z.infer<typeof schema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, coupon, clearCart, createOrder, setUser } = useAppStore();
  const subtotal = calcSubTotal(cart);
  const discount = coupon.trim().toUpperCase() === restaurant.couponCode ? Math.round(subtotal * 0.2) : 0;
  const total = subtotal + 25 - discount;
  const [step, setStep] = useState(0);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      governorate: "القاهرة",
      area: "التجمع الخامس",
      street: "",
      building: "",
      floor: "",
      apartment: "",
      landmark: "",
      driverNotes: "",
      paymentMethod: "cash",
    },
  });

  const summary = useMemo(() => form.getValues(), [form]);

  const onSubmit = form.handleSubmit((values) => {
    if (step < 3) {
      setStep(step + 1);
      setUser({ name: values.name, phone: values.phone, email: values.email || undefined });
      return;
    }
    const order = {
      id: randomOrderId(),
      number: randomOrderId(),
      createdAt: new Date().toISOString(),
      status: "الطلب اتأكد" as const,
      items: cart,
      total,
      addressLabel: `${values.street} - ${values.area} - ${values.governorate}`,
      phone: values.phone,
      paymentMethod: values.paymentMethod,
    };
    createOrder(order);
    clearCart();
    router.push(`/track?order=${order.number}`);
  });

  return (
    <SiteShell>
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <h1 className="font-display text-3xl font-bold">Checkout</h1>
          <div className="mt-3 flex gap-2 text-sm">
            {["1", "2", "3", "4"].map((s, index) => (
              <button key={s} onClick={() => setStep(index)} className={`h-10 w-10 rounded-full ${step === index ? "bg-[#0f3d2e] text-white" : "bg-slate-100"}`}>{s}</button>
            ))}
          </div>
          <form className="mt-6 space-y-5" onSubmit={onSubmit}>
            {step === 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <input {...form.register("name")} className="rounded-2xl border px-4 py-3" placeholder="الاسم" />
                <input {...form.register("phone")} className="rounded-2xl border px-4 py-3" placeholder="رقم الموبايل" />
                <input {...form.register("email")} className="rounded-2xl border px-4 py-3 md:col-span-2" placeholder="البريد الإلكتروني، اختياري" />
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                <select {...form.register("governorate")} className="rounded-2xl border px-4 py-3">
                  <option>القاهرة</option>
                  <option>الجيزة</option>
                  <option>القليوبية</option>
                </select>
                <select {...form.register("area")} className="rounded-2xl border px-4 py-3">
                  {addresses.map((addr) => <option key={addr.labelAr}>{addr.districtAr}</option>)}
                </select>
                <input {...form.register("street")} className="rounded-2xl border px-4 py-3 md:col-span-2" placeholder="اسم الشارع" />
                <input {...form.register("building")} className="rounded-2xl border px-4 py-3" placeholder="رقم العمارة" />
                <input {...form.register("floor")} className="rounded-2xl border px-4 py-3" placeholder="الدور" />
                <input {...form.register("apartment")} className="rounded-2xl border px-4 py-3" placeholder="رقم الشقة" />
                <input {...form.register("landmark")} className="rounded-2xl border px-4 py-3 md:col-span-2" placeholder="علامة مميزة" />
                <input {...form.register("driverNotes")} className="rounded-2xl border px-4 py-3 md:col-span-2" placeholder="ملاحظات للسواق" />
              </div>
            )}
            {step === 2 && (
              <div className="space-y-3">
                {[
                  ["cash", "كاش عند الاستلام"],
                  ["card_on_delivery", "بطاقة عند الاستلام"],
                  ["online_card", "بطاقة أونلاين"],
                  ["wallet", "محفظة إلكترونية"],
                ].map(([value, label]) => (
                  <label key={value} className="flex items-center gap-3 rounded-2xl border px-4 py-4">
                    <input type="radio" value={value} {...form.register("paymentMethod")} />
                    <span>{label}</span>
                  </label>
                ))}
                <div className="rounded-3xl bg-amber-50 p-4 text-sm text-amber-900">الدفع الأونلاين هنا demo فقط ومفيش حفظ لأي بيانات كارت.</div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4 rounded-3xl bg-slate-50 p-5">
                <div className="font-bold">تأكيد الطلب</div>
                <div className="text-sm text-slate-600">الاسم: {summary.name}</div>
                <div className="text-sm text-slate-600">الهاتف: {summary.phone}</div>
                <div className="text-sm text-slate-600">العنوان: {summary.street} - {summary.area} - {summary.governorate}</div>
                <div className="text-sm text-slate-600">طريقة الدفع: {summary.paymentMethod}</div>
              </div>
            )}
            <div className="flex gap-3">
              {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="rounded-2xl border px-5 py-3 font-bold">رجوع</button> : null}
              <button type="submit" className="flex-1 rounded-2xl bg-[#0f3d2e] px-5 py-3 font-bold text-white">
                {step < 3 ? "التالي" : "أكد الطلب"}
              </button>
            </div>
          </form>
        </div>
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <div className="text-sm text-slate-500">الملخص</div>
          <div className="mt-2 text-2xl font-black">{formatEGP(total)}</div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatEGP(subtotal)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>{formatEGP(25)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>-{formatEGP(discount)}</span></div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
