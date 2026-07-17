import Link from "next/link";
import { ArrowLeft, ChevronLeft, Clock3, Truck, Star } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { SectionTitle } from "@/components/section-title";
import { ProductCard } from "@/components/product-card";
import { SmartImage } from "@/components/smart-image";
import { Badge } from "@/components/badge";
import { getPublicCatalog } from "@/lib/catalog/public";
import { readRestaurantSettings } from "@/lib/settings/storage";
import type { Product } from "@/lib/types";
import type { CatalogProduct } from "@/types/catalog";

function toLegacyProduct(product: CatalogProduct): Product {
  return {
    id: product.id,
    slug: product.slug,
    nameAr: product.nameAr,
    nameEn: product.nameEn,
    descriptionAr: product.shortDescriptionAr,
    category: product.categoryId as Product["category"],
    price: product.promotionalPrice ?? product.basePrice,
    oldPrice: product.oldPrice,
    image: product.images[0]?.path || "/images/products/product-fallback.jpg",
    calories: product.calories || 0,
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 0,
    ingredients: product.ingredients.map((ingredient: { nameAr: string }) => ingredient.nameAr),
    tags: product.tags as Product["tags"],
    modifiers: [],
    available: product.available && !product.soldOut && !product.deletedAt,
    featured: product.featured,
  };
}

export default async function HomePage() {
  const [catalog, settings] = await Promise.all([getPublicCatalog(), readRestaurantSettings()]);
  const featured = catalog.products.filter((p) => p.featured && !p.deletedAt).slice(0, 8).map(toLegacyProduct);
  const categories = catalog.categories.filter((c) => c.enabled !== false);

  return (
    <SiteShell>
      <section className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="relative overflow-hidden rounded-[38px] bg-[linear-gradient(145deg,#123b2b_0%,#0f2f23_50%,#1f4a35_100%)] p-6 text-white shadow-elevated lg:p-10">
          <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(243,216,107,0.18),transparent_22%)]" />
          <div className="relative flex flex-wrap items-center gap-2 text-sm text-white/80">
            <Badge className="bg-white/12 text-white">Delivery only</Badge>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1"><Clock3 className="h-4 w-4" />{settings.minDeliveryTime} لـ {settings.maxDeliveryTime} دقيقة</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1"><Truck className="h-4 w-4" />{settings.deliveryFee} جنيه</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1"><Star className="h-4 w-4 fill-amber-300 text-amber-300" />٤٫٩</span>
          </div>
          <div className="relative mt-6 max-w-2xl">
            <h1 className="font-display text-4xl font-black leading-[1.15] lg:text-6xl">سلطتك المفضلة معمولة فريش مخصوص ليك</h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-white/86">اختار، عدّل، واطلب أكلك الصحي لحد باب البيت من غير وجع دماغ</p>
          </div>
          <div className="relative mt-8 flex flex-wrap gap-3">
            <Link href="/menu" className="inline-flex items-center gap-2 rounded-2xl bg-[#f3d86b] px-5 py-3 font-bold text-[#123022]">اطلب دلوقتي <ArrowLeft className="h-4 w-4" /></Link>
            <Link href="/product/build-your-salad" className="inline-flex items-center gap-2 rounded-2xl border border-white/22 bg-white/8 px-5 py-3 font-bold text-white">اعمل سلطتك <ChevronLeft className="h-4 w-4" /></Link>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[38px] bg-white p-4 shadow-soft">
          <SmartImage src={catalog.products.find((p) => p.featured)?.images[0]?.path || "/images/products/product-fallback.jpg"} alt="طبق سلطة فريش" width={1200} height={900} priority sizes="(max-width: 768px) 100vw, 42vw" className="h-[440px] w-full rounded-[30px]" />
          <div className="absolute inset-x-4 bottom-4 rounded-[28px] bg-white/92 p-4 shadow-elevated">
            <div className="flex items-center justify-between gap-4">
              <div><div className="text-sm text-slate-500">عرض اليوم</div><div className="font-bold text-[#123022]">خصم ٢٠٪ على أول طلب</div></div>
              <div className="rounded-2xl bg-[#123b2b] px-4 py-3 text-white">ALEF20</div>
            </div>
          </div>
        </div>
      </section>
      <section className="mt-8 rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-soft">
        <SectionTitle title="حدد عنوان التوصيل" subtitle="اكتب مكانك عشان نجهز أسرع delivery" />
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="rounded-2xl border border-slate-200 bg-[#fbfaf6] px-4 py-4 text-slate-700"><div className="text-sm text-slate-500">العنوان الحالي</div><div className="mt-1 font-semibold">{settings.address}</div></div>
          <Link href="/checkout" className="rounded-2xl bg-[#123b2b] px-5 py-4 text-center font-bold text-white shadow-soft">ابدأ الطلب</Link>
        </div>
      </section>
      <section className="mt-8">
        <SectionTitle title="التصنيفات" subtitle="اختصار سريع يوصلّك للمنيو الصح" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <Link key={category.id} href={`/menu?category=${category.id}`} className="rounded-[28px] border border-white/70 bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-elevated">
              <div className="text-3xl">{category.icon || "🥗"}</div><div className="mt-3 font-bold text-slate-900">{category.nameAr}</div><div className="mt-1 text-sm leading-6 text-slate-600">{category.descriptionAr}</div>
            </Link>
          ))}
        </div>
      </section>
      <section className="mt-10"><SectionTitle title="الأكثر طلبًا" subtitle="أكتر الطلبات اللي الناس بترجع لها" /><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{featured.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>
    </SiteShell>
  );
}
