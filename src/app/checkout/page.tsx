"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Loader2, MessageCircleMore, ShoppingBag, Truck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { useRestaurantSettings } from "@/components/settings-provider";
import { useAppStore } from "@/store/app-store";
import { buildWhatsAppMessage, calculateDiscount, calculateCartSubtotal, generateOrderNumber } from "@/lib/orders";
import type { Order } from "@/lib/types";
import { formatEGP } from "@/lib/utils";

const changeOptions = ["مش محتاج", "فكة من ٢٠٠", "فكة من ٥٠٠", "فكة من ١٠٠٠", "مبلغ تاني"] as const;

const schema = z
  .object({
    name: z.string().min(2, "اكتب اسمك من فضلك"),
    phone: z.string().regex(/^(?:\+20|20|0)?1[0125][0-9]{8}$/, "اكتب رقم موبايل صحيح"),
    area: z.string().min(2, "اختار المنطقة"),
    street: z.string().min(2, "اكتب اسم الشارع"),
    building: z.string().min(1, "اكتب رقم العمارة"),
    floor: z.string().optional(),
    apartment: z.string().optional(),
    landmark: z.string().optional(),
    driverNotes: z.string().optional(),
    paymentMethod: z.enum(["cash", "card_on_delivery", "instapay", "wallet"]),
    changeChoice: z.enum(changeOptions).optional(),
    customChange: z.string().optional(),
  })
  .refine((values) => values.paymentMethod !== "cash" || values.changeChoice !== "مبلغ تاني" || !!values.customChange?.trim(), {
    path: ["customChange"],
    message: "اكتب المبلغ المطلوب للفكة",
  });

type FormValues = z.infer<typeof schema>;

const paymentLabels: Record<FormValues["paymentMethod"], string> = {
  cash: "كاش عند الاستلام",
  card_on_delivery: "بطاقة عند الاستلام",
  instapay: "إنستا باي",
  wallet: "محفظة إلكترونية",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, coupon, savedOrders, createOrder, clearCart } = useAppStore();
  const settings = useRestaurantSettings();
  const [submitted, setSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [createdNumber, setCreatedNumber] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const subtotal = useMemo(() => calculateCartSubtotal(cart), [cart]);
  const discount = useMemo(() => calculateDiscount(subtotal, coupon), [coupon, subtotal]);
  const deliveryFee = settings.deliveryFee;
  const total = Math.max(0, subtotal + deliveryFee - discount);
  const paymentMethods = useMemo(() => settings.paymentMethods.filter((method) => method.enabled).sort((a, b) => a.order - b.order), [settings.paymentMethods]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      area: settings.area || "",
      street: "",
      building: "",
      floor: "",
      apartment: "",
      landmark: "",
      driverNotes: "",
      paymentMethod: "cash",
      changeChoice: "مش محتاج",
      customChange: "",
    },
    mode: "onSubmit",
  });

  const paymentMethod = useWatch({ control: form.control, name: "paymentMethod" });
  const changeChoice = useWatch({ control: form.control, name: "changeChoice" });

  const onSubmit = form.handleSubmit(async (values) => {
    if (submitting) return;
    if (cart.length === 0) {
      form.setError("root", { message: "السلة فاضية" });
      return;
    }
    if (subtotal < settings.minimumOrder) {
      form.setError("root", { message: `الحد الأدنى للطلب ${settings.minimumOrder} جنيه` });
      return;
    }

    setSubmitting(true);
    const number = generateOrderNumber(savedOrders.map((order) => order.number));
    const createdAt = new Date().toISOString();
    const orderItems = cart.map((item) => {
      const unitPrice = item.unitPrice ?? item.customPrice ?? 0;
      return {
        productId: item.productId,
        nameAr: item.displaySnapshot?.nameAr || item.nameAr || item.productId,
        quantity: item.quantity,
        size: item.size,
        base: item.base,
        protein: item.protein,
        vegetables: item.vegetables,
        sauces: item.sauces,
        extras: item.extras,
        removals: item.removals,
        notes: item.notes,
        modifiers: item.selectedModifiers?.flatMap((modifier) =>
          modifier.optionNamesAr?.length
            ? [
                {
                  groupNameAr: modifier.groupNameAr || modifier.groupId,
                  optionNamesAr: modifier.optionNamesAr,
                },
              ]
            : [],
        ) || [],
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      };
    });

    const address = {
      area: values.area,
      street: values.street,
      building: values.building,
      floor: values.floor,
      apartment: values.apartment,
      landmark: values.landmark,
      driverNotes: values.driverNotes,
    };

    const changeFor = values.paymentMethod === "cash" && values.changeChoice === "مبلغ تاني" && values.customChange ? Number(values.customChange) : values.changeChoice === "فكة من ٢٠٠" ? 200 : values.changeChoice === "فكة من ٥٠٠" ? 500 : values.changeChoice === "فكة من ١٠٠٠" ? 1000 : null;

    const order = {
      id: number,
      number,
      createdAt,
      customer: { name: values.name, phone: values.phone },
      address,
      items: orderItems,
      subtotal,
      deliveryFee,
      discount,
      total,
      couponCode: coupon.trim().toUpperCase() === "ALEF20" ? "ALEF20" : undefined,
      paymentMethod: values.paymentMethod,
      changeFor,
      status: "في انتظار الإرسال" as const,
    };

    const message = buildWhatsAppMessage({
      order,
      customer: order.customer,
      address,
      paymentMethodLabel: paymentLabels[values.paymentMethod],
      settings,
      changeFor,
      couponCode: order.couponCode,
      discountValue: discount,
      subtotal,
      deliveryFee,
      total,
      deliveryTimeLabel: "في أسرع وقت",
    });

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: order.customer,
        address: order.address,
        items: cart,
        couponCode: order.couponCode,
        paymentMethod: values.paymentMethod,
        changeFor: order.changeFor,
      }),
    });
    const result = (await response.json().catch(() => null)) as { success?: boolean; orderId?: string; whatsappUrl?: string; status?: string } | null;
    if (!response.ok || !result?.success || !result.orderId || !result.whatsappUrl) {
      form.setError("root", { message: "حصلت مشكلة أثناء إنشاء الطلب" });
      setSubmitting(false);
      return;
    }

    const persistedOrder: Order = { ...order, id: result.orderId, number: result.orderId, whatsappMessage: message, whatsappUrl: result.whatsappUrl, status: "created" };
    createOrder(persistedOrder);
    clearCart();
    setWhatsappUrl(result.whatsappUrl);
    setCreatedNumber(result.orderId);
    setConfirmedOrder({
      id: result.orderId,
      number: result.orderId,
      createdAt,
      whatsappUrl: result.whatsappUrl,
      customer: order.customer,
      address: order.address,
      items: order.items,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      total: order.total,
      couponCode: order.couponCode,
      paymentMethod: order.paymentMethod,
      changeFor: order.changeFor,
      status: result.status || "created",
    } as Order);
    setSubmitted(true);
    window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
    setSubmitting(false);
  });

  if (submitted && createdNumber) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl rounded-[36px] bg-white p-8 text-center shadow-elevated">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold">طلبك اتجهز للإرسال على واتساب</h1>
          <p className="mt-3 text-slate-600">بعد ما تبعت الرسالة للمطعم، ارجع هنا واضغط إنك بعت الطلب. الطلب مش بيتأكد غير لما المطعم يرد عليك.</p>
          <div className="mt-6 rounded-[28px] bg-slate-50 p-5 text-right">
            <div className="text-sm text-slate-500">رقم الطلب</div>
            <div className="mt-1 text-2xl font-black text-[#123b2b]">{createdNumber}</div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href={whatsappUrl || "#"} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#123b2b] px-5 py-3 font-bold text-white">
              <MessageCircleMore className="h-4 w-4" />
              افتح واتساب تاني
            </a>
            <button
              type="button"
              onClick={() => {
                if (!confirmedOrder) return;
                createOrder({ ...confirmedOrder, status: "customer_marked_as_sent", createdAt: new Date().toISOString() });
              }}
              className="rounded-2xl border px-5 py-3 font-bold"
            >
              أنا بعت الطلب
            </button>
            <button type="button" onClick={() => router.push("/track")} className="rounded-2xl border px-5 py-3 font-bold">
              تابع الطلب
            </button>
            <button type="button" onClick={() => router.push("/")} className="rounded-2xl border px-5 py-3 font-bold">
              ارجع للرئيسية
            </button>
          </div>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <form onSubmit={onSubmit} className="space-y-6 rounded-[34px] bg-white p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold">Checkout</h1>
              <p className="mt-2 text-slate-600">راجع الطلب وأكده على واتساب</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
              {settings.minimumOrder} جنيه الحد الأدنى
            </div>
          </div>

          {form.formState.errors.root?.message ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{form.formState.errors.root.message}</div> : null}

          <Section title="بيانات العميل">
            <Field label="الاسم" error={form.formState.errors.name?.message}>
              <input {...form.register("name")} className={inputStyle} placeholder="الاسم" />
            </Field>
            <Field label="رقم الموبايل" error={form.formState.errors.phone?.message}>
              <input {...form.register("phone")} className={inputStyle} placeholder="01012345678" />
            </Field>
          </Section>

          <Section title="عنوان التوصيل">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="المنطقة" error={form.formState.errors.area?.message}>
                <input {...form.register("area")} className={inputStyle} placeholder={settings.area} />
              </Field>
              <Field label="اسم الشارع" error={form.formState.errors.street?.message}>
                <input {...form.register("street")} className={inputStyle} placeholder="شارع التسعين الشمالي" />
              </Field>
              <Field label="رقم العمارة" error={form.formState.errors.building?.message}>
                <input {...form.register("building")} className={inputStyle} placeholder="25" />
              </Field>
              <Field label="الدور">
                <input {...form.register("floor")} className={inputStyle} placeholder="3" />
              </Field>
              <Field label="رقم الشقة">
                <input {...form.register("apartment")} className={inputStyle} placeholder="12" />
              </Field>
              <Field label="علامة مميزة">
                <input {...form.register("landmark")} className={inputStyle} placeholder="جنب البنك" />
              </Field>
              <Field label="ملاحظات للسواق" className="md:col-span-2">
                <textarea {...form.register("driverNotes")} className={`${inputStyle} min-h-24`} placeholder="مثلاً: من غير بصل، الصوص على الجنب" />
              </Field>
            </div>
          </Section>

          <Section title="طريقة الدفع">
            <div className="grid gap-3">
              {paymentMethods.map((method) => (
                <label key={method.id} className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-[#fbfaf6] px-4 py-4">
                  <div>
                    <div className="font-medium">{method.nameAr}</div>
                    {method.instructions ? <div className="text-sm text-slate-500">{method.instructions}</div> : null}
                  </div>
                  <input type="radio" value={method.type === "mobile_wallet" ? "wallet" : method.type} {...form.register("paymentMethod")} />
                </label>
              ))}
            </div>
          </Section>

          <Section title="محتاج فكة؟">
            {paymentMethod === "cash" ? (
              <div className="grid gap-3 md:grid-cols-2">
                {changeOptions.map((item) => (
                  <label key={item} className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 px-4 py-4">
                    <span>{item}</span>
                    <input type="radio" value={item} {...form.register("changeChoice")} />
                  </label>
                ))}
                {changeChoice === "مبلغ تاني" ? (
                  <Field label="اكتب المبلغ">
                    <input {...form.register("customChange")} className={inputStyle} placeholder="500" inputMode="numeric" />
                  </Field>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">مش محتاج فكة لأن طريقة الدفع المختارة مش كاش.</div>
            )}
          </Section>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#123b2b] px-5 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
              {submitting ? "جاري تجهيز الطلب..." : `أكد الطلب على واتساب — ${formatEGP(total)}`}
            </button>
            <button type="button" onClick={() => router.push("/cart")} className="rounded-2xl border px-5 py-4 font-bold">
              <ArrowLeft className="inline-block h-4 w-4" /> رجوع
            </button>
          </div>
        </form>

        <aside className="space-y-4 rounded-[34px] bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">ملخص الطلب</h2>
            <Truck className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="space-y-3 rounded-[28px] bg-slate-50 p-4 text-sm">
            <Row label="المجموع الفرعي" value={formatEGP(subtotal)} />
            <Row label="رسوم التوصيل" value={formatEGP(deliveryFee)} />
            <Row label="الخصم" value={`-${formatEGP(discount)}`} />
            <div className="border-t pt-3">
              <Row label="الإجمالي" value={formatEGP(total)} strong />
            </div>
          </div>
          <div className="rounded-[28px] bg-[#fbfaf6] p-4 text-sm text-slate-600">
            <div className="font-bold text-slate-900">واتساب المطعم</div>
            <div className="mt-1">{settings.phone}</div>
            <div className="mt-1">{settings.address}</div>
          </div>
          <div className="rounded-[28px] border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            بعد التأكيد هيفتح واتساب مباشرة، ولو ما فتحش تقدر تضغط زر الفتح في شاشة النجاح.
          </div>
        </aside>
      </div>
    </SiteShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">{title}</h3>
      <div>{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className || ""}`}>
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      {children}
      {error ? <div className="mt-2 text-sm text-rose-600">{error}</div> : null}
    </label>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${strong ? "text-base font-black text-slate-900" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

const inputStyle = "w-full rounded-2xl border border-slate-200 bg-[#fbfaf6] px-4 py-3 outline-none transition focus:border-[#123b2b] focus:ring-2 focus:ring-[#123b2b]/10";
