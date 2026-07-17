import { SiteShell } from "@/components/site-shell";
import { promos } from "@/data/catalog";

export default function PromotionsPage() {
  return (
    <SiteShell>
      <div className="grid gap-5 lg:grid-cols-2">
        {promos.map((promo) => (
          <div key={promo.titleAr} className="rounded-[32px] bg-white p-6 shadow-soft">
            <div className="inline-flex rounded-full bg-[#f3d86b] px-3 py-1 text-xs font-bold">{promo.badgeAr}</div>
            <h1 className="mt-4 font-display text-3xl font-bold">{promo.titleAr}</h1>
            <p className="mt-2 text-slate-600">{promo.subtitleAr}</p>
          </div>
        ))}
      </div>
    </SiteShell>
  );
}

