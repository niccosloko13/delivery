import { Suspense } from "react";
import { SiteShell } from "@/components/site-shell";
import MenuClient from "./menu-client";
import { getPublicCatalog } from "@/lib/catalog/public";

export default async function MenuPage() {
  const catalog = await getPublicCatalog();
  return (
    <SiteShell>
      <Suspense fallback={<div className="rounded-[32px] bg-white p-6 shadow-soft">جاري تحميل المنيو...</div>}>
        <MenuClient initialCatalog={catalog} />
      </Suspense>
    </SiteShell>
  );
}
