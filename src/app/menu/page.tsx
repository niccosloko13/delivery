"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { categories, products } from "@/data/catalog";
import { ProductCard } from "@/components/product-card";

export default function MenuPage({ searchParams }: { searchParams: { category?: string } }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(searchParams.category || "");
  const [filters, setFilters] = useState<string[]>([]);
  const [sort, setSort] = useState("featured");

  const filtered = useMemo(() => {
    let list = products.filter((product) => {
      const matchesCategory = !activeCategory || product.category === activeCategory;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        product.nameAr.toLowerCase().includes(query) ||
        product.descriptionAr.toLowerCase().includes(query) ||
        product.ingredients.some((ingredient) => ingredient.toLowerCase().includes(query));
      const matchesFilters =
        filters.length === 0 ||
        filters.every((filter) =>
          product.tags.includes(filter as never) ||
          (filter === "الأكثر طلبًا" && product.featured) ||
          (filter === "بروتين عالي" && product.tags.includes("بروتين عالي")) ||
          (filter === "قليل السعرات" && product.tags.includes("قليل السعرات")) ||
          (filter === "نباتي" && product.tags.includes("نباتي")) ||
          (filter === "فيجان" && product.tags.includes("فيجان")) ||
          (filter === "كيتو" && product.tags.includes("كيتو")) ||
          (filter === "بدون جلوتين" && product.tags.includes("بدون جلوتين"))
        );
      return matchesCategory && matchesSearch && matchesFilters;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "popular") list = [...list].sort((a, b) => b.reviewCount - a.reviewCount);
    return list;
  }, [activeCategory, filters, search, sort]);

  const toggleFilter = (value: string) => {
    setFilters((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  return (
    <SiteShell>
      <div className="rounded-[32px] bg-white p-5 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label className="flex items-center gap-3 rounded-2xl border px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full outline-none" placeholder="ابحث بالاسم أو المكون أو التصنيف" />
          </label>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-2xl border px-4 py-3">
            <option value="featured">الأكثر طلبًا</option>
            <option value="rating">الأعلى تقييمًا</option>
            <option value="price-asc">السعر من الأقل للأعلى</option>
            <option value="price-desc">السعر من الأعلى للأقل</option>
          </select>
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 font-bold">
            <SlidersHorizontal className="h-4 w-4" /> فلاتر
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["نباتي", "فيجان", "بروتين عالي", "قليل السعرات", "كيتو", "بدون جلوتين", "حار", "الأكثر طلبًا"].map((filter) => (
            <button key={filter} type="button" onClick={() => toggleFilter(filter)} className={`rounded-full px-4 py-2 text-sm font-bold ${filters.includes(filter) ? "bg-[#0f3d2e] text-white" : "bg-slate-100 text-slate-700"}`}>
              {filter}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => setActiveCategory("")} className={`rounded-full px-4 py-2 text-sm font-bold ${activeCategory === "" ? "bg-[#0f3d2e] text-white" : "bg-white"}`}>
          الكل
        </button>
        {categories.map((cat) => (
          <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)} className={`rounded-full px-4 py-2 text-sm font-bold ${activeCategory === cat.id ? "bg-[#0f3d2e] text-white" : "bg-white text-slate-700"}`}>
            {cat.nameAr}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {filtered.length ? filtered.map((product) => <ProductCard key={product.id} product={product} />) : <div className="rounded-[28px] bg-white p-6 shadow-soft">مفيش نتائج مطابقة للبحث أو الفلتر ده</div>}
      </div>
    </SiteShell>
  );
}
