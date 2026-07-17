"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { CatalogData } from "@/types/catalog";
import { ProductCard } from "@/components/product-card";

export default function MenuClient({ initialCatalog }: { initialCatalog: CatalogData }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [sort, setSort] = useState("featured");

  const products = initialCatalog.products.filter((product) => !product.deletedAt);
  const categories = initialCatalog.categories.filter((cat) => cat.enabled !== false);

  const filtered = useMemo(() => {
    let list = products.filter((product) => {
      const matchesCategory = !activeCategory || product.categoryId === activeCategory || product.categoryId === activeCategory.replace(/-/g, "");
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        product.nameAr.toLowerCase().includes(query) ||
        product.nameEn.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        product.shortDescriptionAr.toLowerCase().includes(query) ||
        product.ingredients.some((ingredient) => ingredient.nameAr.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => (a.promotionalPrice ?? a.basePrice) - (b.promotionalPrice ?? b.basePrice));
    if (sort === "price-desc") list = [...list].sort((a, b) => (b.promotionalPrice ?? b.basePrice) - (a.promotionalPrice ?? a.basePrice));
    if (sort === "rating") list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === "popular") list = [...list].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    return list;
  }, [activeCategory, products, search, sort]);

  return (
    <>
      <div className="rounded-[32px] bg-white p-5 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label className="flex items-center gap-3 rounded-2xl border px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full outline-none" placeholder="دور على منتج" />
          </label>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-2xl border px-4 py-3">
            <option value="featured">الأكثر طلبًا</option>
            <option value="rating">الأعلى تقييمًا</option>
            <option value="price-asc">السعر من الأقل للأعلى</option>
            <option value="price-desc">السعر من الأعلى للأقل</option>
          </select>
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 font-bold"><SlidersHorizontal className="h-4 w-4" />فلاتر</button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => setActiveCategory("")} className={`rounded-full px-4 py-2 text-sm font-bold ${activeCategory === "" ? "bg-[#123b2b] text-white" : "bg-white"}`}>الكل</button>
        {categories.map((cat) => (
          <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)} className={`rounded-full px-4 py-2 text-sm font-bold ${activeCategory === cat.id ? "bg-[#123b2b] text-white" : "bg-white text-slate-700"}`}>{cat.nameAr}</button>
        ))}
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {filtered.length ? filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              id: product.id,
              slug: product.slug,
              nameAr: product.nameAr,
              nameEn: product.nameEn,
              descriptionAr: product.shortDescriptionAr,
              category: product.categoryId as never,
              price: product.promotionalPrice ?? product.basePrice,
              oldPrice: product.oldPrice,
              image: product.images[0]?.path || "/images/products/product-fallback.jpg",
              calories: product.calories || 0,
              rating: product.rating || 0,
              reviewCount: product.reviewCount || 0,
              ingredients: product.ingredients.map((ingredient) => ingredient.nameAr),
              tags: product.tags as never,
              modifiers: [],
              available: product.available && !product.soldOut && !product.deletedAt,
              featured: product.featured,
            }}
          />
        )) : <div className="rounded-[28px] bg-white p-6 shadow-soft">مفيش نتائج مطابقة للبحث أو الفلتر ده</div>}
      </div>
    </>
  );
}
