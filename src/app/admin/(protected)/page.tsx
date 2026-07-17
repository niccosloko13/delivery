import { readOrders } from "@/lib/settings/storage";
import { readRestaurantSettings } from "@/lib/settings/storage";
import { formatEGP } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [orders, settings] = await Promise.all([readOrders<Record<string, unknown>[]>(), readRestaurantSettings()]);
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((order) => String(order.createdAt || "").slice(0, 10) === today);
  const pending = orders.filter((order) => String(order.status || "") === "confirmed" || String(order.status || "") === "في انتظار الإرسال");
  const paymentCount = orders.reduce<Record<string, number>>((acc, order) => {
    const method = String(order.paymentMethod || "غير محدد");
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});
  const topPayment = Object.entries(paymentCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "غير محدد";
  const itemCount = orders.reduce<Record<string, number>>((acc, order) => {
    for (const item of (order.items as Array<{ nameAr?: string; quantity?: number }>) || []) {
      const name = item.nameAr || "منتج";
      acc[name] = (acc[name] || 0) + Number(item.quantity || 0);
    }
    return acc;
  }, {});
  const topProducts = Object.entries(itemCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const cards = [
    { label: "الطلبات المسجلة", value: orders.length },
    { label: "إجمالي المبيعات", value: formatEGP(totalRevenue) },
    { label: "متوسط الطلب", value: orders.length ? formatEGP(Math.round(totalRevenue / orders.length)) : formatEGP(0) },
    { label: "طلبات النهارده", value: todayOrders.length },
    { label: "بانتظار التأكيد", value: pending.length },
    { label: "حالة المطعم", value: settings.status === "open" ? "مفتوح" : settings.status === "busy" ? "مشغول" : "مقفول" },
  ];

  return (
    <div className="space-y-6">
      <header className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="text-sm font-semibold text-emerald-700">لوحة التحكم</div>
        <h1 className="mt-2 text-3xl font-black">أهلاً بيك في إدارة ألف سالاد</h1>
        <p className="mt-2 max-w-3xl text-slate-600">هنا بتراجع الطلبات، تغيّر طرق الدفع، وتحدّث بيانات المطعم من غير ما تلمس الكود.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-[28px] bg-white p-5 shadow-soft">
            <div className="text-sm text-slate-500">{card.label}</div>
            <div className="mt-2 text-3xl font-black text-[#0f3d2e]">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[32px] bg-white p-6 shadow-soft">
          <h2 className="text-xl font-bold">طريقة الدفع الأكثر استخدامًا</h2>
          <div className="mt-4 rounded-2xl bg-[#fbfaf6] px-4 py-4 text-lg font-bold">{topPayment}</div>
        </section>
        <section className="rounded-[32px] bg-white p-6 shadow-soft">
          <h2 className="text-xl font-bold">أكثر المنتجات طلبًا</h2>
          <div className="mt-4 space-y-3">
            {topProducts.length ? topProducts.map(([name, count]) => <Row key={name} label={name} value={`${count} طلب`} />) : <div className="text-sm text-slate-500">لسه مفيش طلبات.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#fbfaf6] px-4 py-3">
      <span className="font-medium">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
