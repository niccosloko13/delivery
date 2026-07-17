"use client";

import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { useAppStore } from "@/store/app-store";
import { formatEGP } from "@/lib/utils";

export default function AccountOrdersPage() {
  const { savedOrders, setActiveOrder } = useAppStore();

  return (
    <SiteShell>
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">طلباتي</h1>
            <p className="mt-2 text-slate-600">كل الطلبات المحفوظة محليًا على الجهاز</p>
          </div>
          <Link href="/account" className="rounded-2xl border px-4 py-3 font-bold">رجوع للحساب</Link>
        </div>

        <div className="mt-6 space-y-4">
          {savedOrders.length === 0 ? (
            <div className="rounded-3xl bg-slate-50 p-6 text-slate-600">مفيش طلبات لسه</div>
          ) : (
            savedOrders.map((order) => (
              <div key={order.number} className="rounded-[28px] border border-slate-200 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900">{order.number}</div>
                    <div className="text-sm text-slate-500">{order.createdAt}</div>
                  </div>
                  <div className="text-left font-black text-[#123b2b]">{formatEGP(order.total)}</div>
                </div>
                <div className="mt-3 text-sm text-slate-600">{order.address.street} - {order.address.area}</div>
                <div className="mt-4 flex gap-3">
                  <button type="button" onClick={() => setActiveOrder(order)} className="rounded-2xl bg-[#123b2b] px-4 py-2 text-sm font-bold text-white">
                    تتبع الطلب
                  </button>
                  <Link href="/checkout" className="rounded-2xl border px-4 py-2 text-sm font-bold">
                    كرر الطلب
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </SiteShell>
  );
}

