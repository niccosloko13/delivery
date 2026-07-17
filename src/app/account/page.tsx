"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { useAppStore } from "@/store/app-store";
import { addresses, restaurant } from "@/data/catalog";

export default function AccountPage() {
  const { user, setUser, savedOrders, favorites } = useAppStore();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  return (
    <SiteShell>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <h1 className="font-display text-3xl font-bold">حسابي</h1>
          <p className="mt-2 text-slate-600">دخول وكداما demo محلي من غير backend</p>
          <div className="mt-5 space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl border px-4 py-3" placeholder="الاسم" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-2xl border px-4 py-3" placeholder="رقم الموبايل" />
            <button type="button" onClick={() => setUser({ name, phone })} className="w-full rounded-2xl bg-[#0f3d2e] px-4 py-3 font-bold text-white">احفظ البيانات</button>
          </div>
          <div className="mt-6 rounded-3xl bg-slate-50 p-4">
            <div className="font-bold">{user?.name || "ضيف"}</div>
            <div className="text-sm text-slate-600">{user?.phone || restaurant.phone}</div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <Link href="/checkout" className="block rounded-2xl border px-4 py-3">إضافة عنوان جديد</Link>
            <button type="button" className="block w-full rounded-2xl border px-4 py-3 text-right">تكرار آخر طلب</button>
            <button type="button" className="block w-full rounded-2xl border px-4 py-3 text-right">الكوپنات</button>
            <button type="button" className="block w-full rounded-2xl border px-4 py-3 text-right">تسجيل خروج</button>
          </div>
        </div>
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <h2 className="font-display text-2xl font-bold">الطلبات السابقة</h2>
          <div className="mt-4 space-y-3">
            {savedOrders.length === 0 ? <div className="rounded-3xl bg-slate-50 p-5 text-slate-600">مفيش طلبات لسه</div> : savedOrders.map((order) => (
              <div key={order.id} className="rounded-3xl border p-5">
                <div className="flex justify-between"><span className="font-bold">{order.number}</span><span>{order.status}</span></div>
                <div className="mt-1 text-sm text-slate-600">{order.addressLabel}</div>
                <Link href="/track" className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm">تتبع الطلب</Link>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl bg-slate-50 p-4 text-sm">المفضلات: {favorites.length}</div>
          <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm">العناوين المحفوظة: {addresses.length}</div>
        </div>
      </div>
    </SiteShell>
  );
}

