"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { useAppStore } from "@/store/app-store";
import { formatEGP } from "@/lib/utils";
import { restaurant } from "@/data/catalog";
import { calcSubTotal } from "@/lib/pricing";

export default function CartPage() {
  const { cart, updateCartItem, removeFromCart, coupon, setCoupon } = useAppStore();
  const subtotal = calcSubTotal(cart);
  const discount = coupon.trim().toUpperCase() === restaurant.couponCode ? Math.round(subtotal * 0.2) : 0;
  const total = subtotal + 25 - discount;
  return (
    <SiteShell>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <h1 className="font-display text-3xl font-bold">السلة</h1>
          <div className="mt-6 space-y-4">
            {cart.length === 0 ? <div className="rounded-3xl bg-slate-50 p-6 text-slate-600">السلة فاضية دلوقتي</div> : cart.map((item, index) => (
              <div key={index} className="flex gap-4 rounded-3xl border p-4">
                <div className="h-20 w-20 rounded-2xl bg-slate-100" />
                <div className="flex-1">
                  <div className="font-bold">منتج {index + 1}</div>
                  <div className="text-sm text-slate-600">{item.notes || "بدون ملاحظات"}</div>
                  <div className="mt-2 text-sm text-slate-500">الإضافات: {item.extras?.join("، ") || "لا يوجد"}</div>
                </div>
                <div className="text-left">
                  <div className="font-black">{formatEGP((item.customPrice ?? 0) * item.quantity)}</div>
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <button onClick={() => updateCartItem(index, { quantity: Math.max(1, item.quantity - 1) })} className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100"><Minus className="h-4 w-4" /></button>
                    <span className="min-w-6 text-center font-bold">{item.quantity}</span>
                    <button onClick={() => updateCartItem(index, { quantity: item.quantity + 1 })} className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100"><Plus className="h-4 w-4" /></button>
                  </div>
                  <button onClick={() => removeFromCart(index)} className="mt-2 inline-flex items-center gap-1 text-sm text-rose-600"><Trash2 className="h-4 w-4" /> حذف</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <h2 className="font-display text-2xl font-bold">ملخص الطلب</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatEGP(subtotal)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>{formatEGP(25)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>-{formatEGP(discount)}</span></div>
            <div className="flex justify-between border-t pt-3 text-lg font-black"><span>Total</span><span>{formatEGP(total)}</span></div>
          </div>
          <div className="mt-5">
            <label className="text-sm font-bold">كود الخصم</label>
            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" placeholder={restaurant.couponCode} />
          </div>
          <div className="mt-5 space-y-3">
            <Link href="/checkout" className="block rounded-2xl bg-[#0f3d2e] px-5 py-3 text-center font-bold text-white">كمل للدفع</Link>
            <Link href="/menu" className="block rounded-2xl border px-5 py-3 text-center font-bold">رجوع للمنيو</Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
