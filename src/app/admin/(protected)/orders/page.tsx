"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, MessageCircleMore, RefreshCcw } from "lucide-react";

type AdminOrder = {
  id?: string;
  number?: string;
  createdAt?: string;
  customer?: { name?: string; phone?: string };
  address?: { area?: string };
  total?: number;
  paymentMethod?: string;
  status?: string;
  whatsappUrl?: string;
  whatsappMessage?: string;
};

const statusFilters = ["الكل", "created", "whatsapp_opened", "customer_marked_as_sent", "restaurant_confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [filter, setFilter] = useState<(typeof statusFilters)[number]>("الكل");
  const [query, setQuery] = useState("");

  async function load() {
    const response = await fetch("/api/admin/orders");
    if (response.status === 401) {
      setOrders([]);
      return;
    }
    setOrders(await response.json());
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function updateStatus(orderId?: string, status?: string) {
    if (!orderId || !status) return;
    await fetch(`/api/admin/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    await load();
  }

  const visibleOrders = useMemo(() => {
    const list = orders || [];
    return list.filter((order) => {
      const text = `${order.number || ""} ${order.customer?.name || ""} ${order.customer?.phone || ""}`.toLowerCase();
      const matchesQuery = !query || text.includes(query.toLowerCase());
      const matchesFilter = filter === "الكل" || order.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [orders, filter, query]);

  if (!orders) return <div className="rounded-[32px] bg-white p-8 shadow-soft">جاري تحميل الطلبات...</div>;

  return (
    <div className="space-y-6">
      <header className="rounded-[32px] bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-black">الطلبات</h1>
        <p className="mt-2 text-slate-600">بتقدر تبحث، تفتح واتساب، وتغير حالة كل طلب من هنا.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {statusFilters.map((item) => (
            <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === item ? "bg-[#0f3d2e] text-white" : "bg-slate-100"}`}>
              {item}
            </button>
          ))}
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} className="mt-4 w-full rounded-2xl border border-slate-200 bg-[#fbfaf6] px-4 py-3" placeholder="ابحث برقم الطلب أو الاسم أو الموبايل" />
      </header>

      <div className="grid gap-4">
        {visibleOrders.length ? visibleOrders.map((order) => (
          <article key={order.id || order.number} className="rounded-[30px] bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm text-slate-500">{order.number}</div>
                <div className="mt-1 text-lg font-bold">{order.customer?.name || "-"}</div>
                <div className="text-sm text-slate-500">{order.customer?.phone || "-"}</div>
              </div>
              <div className="text-right">
                <div className="font-black text-[#0f3d2e]">{order.total || 0} جنيه</div>
                <div className="text-sm text-slate-500">{order.address?.area || "-"}</div>
                <div className="text-xs text-slate-400">{order.createdAt || ""}</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {statusFilters.slice(1).map((status) => (
                <button key={status} type="button" onClick={() => updateStatus(order.id, status)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${order.status === status ? "bg-[#0f3d2e] text-white" : "border"}`}>
                  {status}
                </button>
              ))}
              <button type="button" onClick={() => order.whatsappUrl && window.open(order.whatsappUrl, "_blank", "noopener,noreferrer")} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold">
                <MessageCircleMore className="h-4 w-4" />
                واتساب
              </button>
              <button type="button" onClick={() => order.whatsappMessage && navigator.clipboard.writeText(order.whatsappMessage)} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold">
                <Copy className="h-4 w-4" />
                نسخ الرسالة
              </button>
              <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold">
                <RefreshCcw className="h-4 w-4" />
                تحديث
              </button>
            </div>
          </article>
        )) : <div className="rounded-[30px] bg-white p-8 text-slate-500 shadow-soft">مفيش طلبات مطابقة.</div>}
      </div>
    </div>
  );
}
