"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Copy, ImagePlus, Loader2, Plus, Search, Upload, X } from "lucide-react";
import type { CatalogData, CatalogImage, CatalogProduct } from "@/types/catalog";
import { formatEGP } from "@/lib/utils";

const productFormSchema = z.object({
  nameAr: z.string().min(2),
  nameEn: z.string().min(2),
  shortDescriptionAr: z.string().min(5).max(200),
  fullDescriptionAr: z.string().optional(),
  categoryId: z.string().min(1),
  slug: z.string().optional(),
  sku: z.string().optional(),
  productType: z.enum(["standard", "build_your_own", "drink", "side"]),
  basePrice: z.coerce.number().int().nonnegative(),
  oldPrice: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  promotionalPrice: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  calories: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  rating: z.coerce.number().min(0).max(5).optional().or(z.literal("")),
  reviewCount: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  tags: z.string().optional(),
  available: z.boolean(),
  soldOut: z.boolean(),
  featured: z.boolean(),
  bestSeller: z.boolean(),
  badgeAr: z.string().optional(),
  modifierGroupIds: z.array(z.string()).default([]),
  imagePath: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CatalogManager({ catalog, mode = "dashboard", product }: { catalog: CatalogData; mode?: "dashboard" | "product" | "categories" | "modifiers" | "ingredients" | "media"; product?: CatalogProduct | null }) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"cards" | "table">(() => (typeof window === "undefined" ? "cards" : (window.localStorage.getItem("catalog-view-mode") as "cards" | "table" | null) || "cards"));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<CatalogImage | null>(null);
  const uploadRef = useRef<HTMLInputElement | null>(null);
  void selectedImage;
  void setSelectedImage;
  void uploadRef;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog.products.filter((item) => {
      const text = [item.nameAr, item.nameEn, item.slug, item.sku || "", item.ingredients.map((x) => x.nameAr).join(" ")].join(" ").toLowerCase();
      if (q && !text.includes(q)) return false;
      if (statusFilter === "active" && (!item.available || item.soldOut || item.deletedAt)) return false;
      if (statusFilter === "paused" && item.available) return false;
      if (statusFilter === "soldout" && !item.soldOut) return false;
      if (statusFilter === "featured" && !item.featured) return false;
      if (statusFilter === "offer" && !item.promotionalPrice) return false;
      if (statusFilter === "missing-image" && item.images.length > 0) return false;
      if (statusFilter === "deleted" && !item.deletedAt) return false;
      return true;
    });
  }, [catalog.products, search, statusFilter]);

  const stats = useMemo(() => ({
    total: catalog.products.filter((p) => !p.deletedAt).length,
    active: catalog.products.filter((p) => !p.deletedAt && p.available && !p.soldOut).length,
    paused: catalog.products.filter((p) => !p.deletedAt && !p.available).length,
    soldOut: catalog.products.filter((p) => !p.deletedAt && p.soldOut).length,
    missingImage: catalog.products.filter((p) => !p.deletedAt && p.images.length === 0).length,
  }), [catalog.products]);

  async function mutate(endpoint: string, body?: unknown, method: string = "POST") {
    const response = await fetch(endpoint, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = (await response.json().catch(() => null)) as { success?: boolean; message?: string } | null;
    if (!response.ok || !result?.success) throw new Error(result?.message || "failed");
    router.refresh();
    return result;
  }

  async function duplicateProduct(id: string) {
    setBusyId(id);
    try {
      await mutate(`/api/admin/catalog/products/${id}/duplicate`);
      setMessage("تم نسخ المنتج بنجاح");
    } catch {
      setMessage("حصلت مشكلة، جرّب تاني");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleProduct(id: string, patch: Record<string, unknown>) {
    setBusyId(id);
    try {
      await mutate(`/api/admin/catalog/products/${id}/status`, patch, "PATCH");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("متأكد إنك عايز تحذف المنتج؟")) return;
    setBusyId(id);
    try {
      await mutate(`/api/admin/catalog/products/${id}`, undefined, "DELETE");
    } finally {
      setBusyId(null);
    }
  }

  async function uploadImage(file: File, productId?: string) {
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      if (productId) form.set("productId", productId);
      const response = await fetch("/api/admin/catalog/images", { method: "POST", body: form });
      const result = (await response.json().catch(() => null)) as { success?: boolean; message?: string } | null;
      if (!response.ok || !result?.success) throw new Error(result?.message || "upload failed");
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  if (mode === "dashboard") {
    return (
      <div className="space-y-6">
        <header className="rounded-[34px] bg-gradient-to-br from-[#0f3d2e] to-[#184b39] p-6 text-white shadow-elevated">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-sm text-white/70">إدارة المنيو</div>
              <h1 className="mt-2 font-display text-4xl font-black">تحكم في المنتجات والأسعار والصور والإضافات من مكان واحد</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/catalog/products/new" className="rounded-2xl bg-white px-5 py-3 font-bold text-[#0f3d2e]">إضافة منتج جديد</Link>
              <Link href="/admin/catalog/categories" className="rounded-2xl border border-white/20 px-5 py-3 font-bold text-white">إضافة قسم</Link>
              <Link href="/admin/catalog/modifiers" className="rounded-2xl border border-white/20 px-5 py-3 font-bold text-white">إدارة الإضافات</Link>
            </div>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["إجمالي المنتجات", stats.total],
            ["المنتجات المتاحة", stats.active],
            ["المنتجات الموقوفة", stats.paused],
            ["المنتجات النافدة", stats.soldOut],
            ["منتجات من غير صورة", stats.missingImage],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-[28px] bg-white p-5 shadow-soft">
              <div className="text-sm text-slate-500">{label as string}</div>
              <div className="mt-2 text-3xl font-black text-[#123b2b]">{value as number}</div>
            </div>
          ))}
        </div>

        <div className="rounded-[30px] bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent outline-none" placeholder="دور على منتج" />
            </div>
            <div className="flex flex-wrap gap-2">
              {["all", "active", "paused", "soldout", "featured", "offer", "missing-image", "deleted"].map((status) => (
                <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`rounded-full px-4 py-2 text-sm font-semibold ${statusFilter === status ? "bg-[#123b2b] text-white" : "bg-slate-100 text-slate-700"}`}>
                  {status === "all" ? "الكل" : status}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setViewMode("cards"); window.localStorage.setItem("catalog-view-mode", "cards"); }} className={`rounded-2xl px-4 py-2 font-semibold ${viewMode === "cards" ? "bg-[#123b2b] text-white" : "bg-slate-100"}`}>عرض بالكروت</button>
              <button type="button" onClick={() => { setViewMode("table"); window.localStorage.setItem("catalog-view-mode", "table"); }} className={`rounded-2xl px-4 py-2 font-semibold ${viewMode === "table" ? "bg-[#123b2b] text-white" : "bg-slate-100"}`}>عرض بالجدول</button>
            </div>
          </div>

          <div className="mt-5">
            {viewMode === "cards" ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
                    <div className="relative h-56 overflow-hidden bg-slate-100">
                      {item.images[0] ? <Image src={item.images[0].path} alt={item.nameAr} fill className="object-cover" sizes="(max-width: 1280px) 100vw, 33vw" /> : <div className="grid h-full place-items-center text-slate-400">من غير صورة</div>}
                      <div className="absolute left-4 top-4 flex gap-2">
                        {item.featured ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">مميز</span> : null}
                        {item.promotionalPrice ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">عليه عرض</span> : null}
                        {item.soldOut ? <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">نفد</span> : null}
                      </div>
                    </div>
                    <div className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-lg font-black">{item.nameAr}</div>
                          <div className="text-sm text-slate-500">{item.nameEn}</div>
                        </div>
                        <div className="text-left">
                          <div className="text-xl font-black text-[#123b2b]">{formatEGP(item.promotionalPrice ?? item.basePrice)}</div>
                          {item.oldPrice ? <div className="text-xs line-through text-slate-400">{formatEGP(item.oldPrice)}</div> : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        <span>{item.modifierGroupIds.length} إضافات</span>
                        <span>تحديث {new Date(item.updatedAt).toLocaleDateString("ar-EG")}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/catalog/products/${item.id}`} className="rounded-2xl bg-[#123b2b] px-3 py-2 text-sm font-bold text-white">تعديل</Link>
                        <button disabled={busyId === item.id} onClick={() => duplicateProduct(item.id)} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-bold">
                          {busyId === item.id ? <Loader2 className="inline h-4 w-4 animate-spin" /> : <Copy className="inline h-4 w-4" />} نسخ
                        </button>
                        <button onClick={() => toggleProduct(item.id, { available: !item.available })} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-bold">إيقاف</button>
                        <button onClick={() => toggleProduct(item.id, { soldOut: true })} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-bold">نفد</button>
                        <button onClick={() => deleteProduct(item.id)} className="rounded-2xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">حذف</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-[24px] border">
                <table className="min-w-full text-right text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3">المنتج</th>
                      <th className="px-4 py-3">القسم</th>
                      <th className="px-4 py-3">السعر</th>
                      <th className="px-4 py-3">الحالة</th>
                      <th className="px-4 py-3">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3 font-semibold">{item.nameAr}</td>
                        <td className="px-4 py-3">{catalog.categories.find((c) => c.id === item.categoryId)?.nameAr || "—"}</td>
                        <td className="px-4 py-3">{formatEGP(item.promotionalPrice ?? item.basePrice)}</td>
                        <td className="px-4 py-3">{item.soldOut ? "نفد" : item.available ? "متاح" : "موقوف"}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/admin/catalog/products/${item.id}`} className="rounded-xl bg-slate-100 px-3 py-2">تعديل</Link>
                            <button onClick={() => duplicateProduct(item.id)} className="rounded-xl bg-slate-100 px-3 py-2">نسخ</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        {message ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</div> : null}
      </div>
    );
  }

  if (mode === "product") {
    return <PremiumProductEditor catalog={catalog} product={product || null} onUpload={uploadImage} uploading={uploading} />;
  }

  if (mode === "categories") return <ResourceList title="الأقسام" items={catalog.categories.map((item) => ({ id: item.id, title: item.nameAr, subtitle: item.slug }))} addLabel="إضافة قسم" endpoint="/api/admin/catalog/categories" />;
  if (mode === "modifiers") return <ResourceList title="الإضافات" items={catalog.modifiers.map((item) => ({ id: item.id, title: item.nameAr, subtitle: item.type }))} addLabel="إضافة مجموعة" endpoint="/api/admin/catalog/modifiers" />;
  if (mode === "ingredients") return <ResourceList title="المكونات" items={catalog.ingredients.map((item) => ({ id: item.id, title: item.nameAr, subtitle: item.available ? "متاح" : "غير متاح" }))} addLabel="إضافة مكون" endpoint="/api/admin/catalog/ingredients" />;
  if (mode === "media") return <PremiumMediaLibrary catalog={catalog} onUpload={uploadImage} uploading={uploading} />;
  return null;
}

function ProductEditor({ catalog, product, onUpload, uploading }: { catalog: CatalogData; product: CatalogProduct | null; onUpload: (file: File, productId?: string) => Promise<void>; uploading: boolean }) {
  const router = useRouter();
  const defaultImage = product?.images[0]?.path || "/images/products/product-fallback.jpg";
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as unknown as Resolver<ProductFormValues>,
    defaultValues: {
      nameAr: product?.nameAr || "",
      nameEn: product?.nameEn || "",
      shortDescriptionAr: product?.shortDescriptionAr || "",
      fullDescriptionAr: product?.fullDescriptionAr || "",
      categoryId: product?.categoryId || catalog.categories[0]?.id || "",
      slug: product?.slug || "",
      sku: product?.sku || "",
      productType: product?.productType || "standard",
      basePrice: product?.basePrice || 0,
      oldPrice: product?.oldPrice || "",
      promotionalPrice: product?.promotionalPrice || "",
      calories: product?.calories || "",
      rating: product?.rating || "",
      reviewCount: product?.reviewCount || "",
      tags: product?.tags.join(", ") || "",
      available: product?.available ?? true,
      soldOut: product?.soldOut ?? false,
      featured: product?.featured ?? false,
      bestSeller: product?.bestSeller ?? false,
      badgeAr: product?.badgeAr || "",
      modifierGroupIds: product?.modifierGroupIds || [],
      imagePath: defaultImage,
    },
  });

  const imagePath = useWatch({ control: form.control, name: "imagePath" });
  const slugValue = useWatch({ control: form.control, name: "slug" });
  const nameEn = useWatch({ control: form.control, name: "nameEn" });
  const nameAr = useWatch({ control: form.control, name: "nameAr" });
  const categoryId = useWatch({ control: form.control, name: "categoryId" });
  const productType = useWatch({ control: form.control, name: "productType" });
  const modifierGroupIds = useWatch({ control: form.control, name: "modifierGroupIds" });
  const basePrice = useWatch({ control: form.control, name: "basePrice" });
  const promotionalPrice = useWatch({ control: form.control, name: "promotionalPrice" });
  const oldPrice = useWatch({ control: form.control, name: "oldPrice" });
  const featured = useWatch({ control: form.control, name: "featured" });
  const soldOut = useWatch({ control: form.control, name: "soldOut" });
  const shortDescriptionAr = useWatch({ control: form.control, name: "shortDescriptionAr" });

  async function submit(values: ProductFormValues) {
    const payload = {
      nameAr: values.nameAr,
      nameEn: values.nameEn,
      shortDescriptionAr: values.shortDescriptionAr,
      fullDescriptionAr: values.fullDescriptionAr,
      categoryId: values.categoryId,
      slug: values.slug || slugify(values.nameEn),
      sku: values.sku || undefined,
      productType: values.productType,
      basePrice: values.basePrice,
      oldPrice: values.oldPrice === "" ? undefined : values.oldPrice,
      promotionalPrice: values.promotionalPrice === "" ? undefined : values.promotionalPrice,
      calories: values.calories === "" ? undefined : values.calories,
      rating: values.rating === "" ? undefined : values.rating,
      reviewCount: values.reviewCount === "" ? undefined : values.reviewCount,
      tags: values.tags?.split(",").map((item) => item.trim()).filter(Boolean) || [],
      available: values.available,
      soldOut: values.soldOut,
      featured: values.featured,
      bestSeller: values.bestSeller,
      badgeAr: values.badgeAr || undefined,
      modifierGroupIds: values.modifierGroupIds,
      images: imagePath ? [{ id: "main", path: imagePath, alt: values.nameAr, source: "upload" as const }] : [],
    };
    const res = await fetch(product ? `/api/admin/catalog/products/${product.id}` : "/api/admin/catalog/products", {
      method: product ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await res.json().catch(() => null)) as { success?: boolean; product?: CatalogProduct; message?: string } | null;
    if (!res.ok || !result?.success) throw new Error(result?.message || "save failed");
    router.push("/admin/catalog");
    router.refresh();
  }

  const selectedCategory = catalog.categories.find((item) => item.id === categoryId);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <form onSubmit={form.handleSubmit(submit)} className="space-y-6 rounded-[32px] bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-black">{product ? "تعديل منتج" : "إضافة منتج جديد"}</h1>
            <p className="mt-2 text-slate-500">البيانات هنا بتتحفظ في المنيو الحقيقي</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{productType === "build_your_own" ? "اعمل سلطتك" : productType === "drink" ? "مشروب" : "منتج عادي"}</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="اسم المنتج بالعربي"><input {...form.register("nameAr")} className={input} /></Field>
          <Field label="اسم المنتج بالإنجليزي"><input {...form.register("nameEn")} className={input} onChange={(e) => { form.setValue("nameEn", e.target.value); if (!form.getValues("slug")) form.setValue("slug", slugify(e.target.value)); }} /></Field>
          <Field label="وصف قصير" className="md:col-span-2"><textarea {...form.register("shortDescriptionAr")} className={`${input} min-h-24`} /></Field>
          <Field label="وصف كامل" className="md:col-span-2"><textarea {...form.register("fullDescriptionAr")} className={`${input} min-h-32`} /></Field>
          <Field label="القسم"><select {...form.register("categoryId")} className={input}>{catalog.categories.map((c) => <option key={c.id} value={c.id}>{c.nameAr}</option>)}</select></Field>
          <Field label="نوع المنتج"><select {...form.register("productType")} className={input}><option value="standard">منتج عادي</option><option value="build_your_own">اعمل سلطتك</option><option value="drink">مشروب</option><option value="side">إضافة جانبية</option></select></Field>
          <Field label="رابط المنتج"><input {...form.register("slug")} className={input} placeholder={slugify(nameEn || "")} /></Field>
          <Field label="كود المنتج"><input {...form.register("sku")} className={input} /></Field>
          <Field label="السعر الأساسي"><input type="number" {...form.register("basePrice")} className={input} /></Field>
          <Field label="السعر القديم"><input type="number" {...form.register("oldPrice")} className={input} /></Field>
          <Field label="سعر العرض"><input type="number" {...form.register("promotionalPrice")} className={input} /></Field>
          <Field label="السعرات"><input type="number" {...form.register("calories")} className={input} /></Field>
          <Field label="التقييم"><input type="number" step="0.1" {...form.register("rating")} className={input} /></Field>
          <Field label="عدد التقييمات"><input type="number" {...form.register("reviewCount")} className={input} /></Field>
          <Field label="الصور" className="md:col-span-2">
            <div className="rounded-[28px] border border-dashed border-slate-300 p-4">
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (e) => { const file = e.target.files?.[0]; if (file) await onUpload(file, product?.id); }} />
              <div className="mt-3 text-sm text-slate-500">ارفع صور واضحة للمنتج. أول صورة هتظهر في المنيو.</div>
            </div>
          </Field>
          <Field label="المسار الحالي"><input value={imagePath} readOnly className={input} /></Field>
          <Field label="التاجات"><input {...form.register("tags")} className={input} placeholder="نباتي, بروتين عالي" /></Field>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {["available", "soldOut", "featured", "bestSeller"].map((name) => (
            <label key={name} className="flex items-center justify-between rounded-2xl border px-4 py-3">
              <span>{name}</span>
              <input type="checkbox" {...form.register(name as "available")} />
            </label>
          ))}
        </div>

        <div className="space-y-3">
          <div className="text-lg font-bold">الإضافات</div>
          <div className="grid gap-2 md:grid-cols-2">
            {catalog.modifiers.map((modifier) => (
              <label key={modifier.id} className="flex items-center justify-between rounded-2xl border px-4 py-3">
                <span>{modifier.nameAr}</span>
                <input type="checkbox" checked={modifierGroupIds.includes(modifier.id)} onChange={(e) => {
                  const current = new Set(form.getValues("modifierGroupIds"));
                  if (e.target.checked) current.add(modifier.id); else current.delete(modifier.id);
                  form.setValue("modifierGroupIds", Array.from(current));
                }} />
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="rounded-2xl bg-[#123b2b] px-5 py-3 font-bold text-white">حفظ</button>
          <Link href="/admin/catalog" className="rounded-2xl border px-5 py-3 font-bold">إلغاء</Link>
        </div>
      </form>

      <aside className="space-y-4 rounded-[32px] bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-black">معاينة المنتج</h2>
          <button type="button" onClick={() => form.setValue("imagePath", imagePath || "/images/products/product-fallback.jpg")} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold">تحديث</button>
        </div>
        <div className="overflow-hidden rounded-[28px] border bg-white">
          <div className="relative h-64 overflow-hidden bg-slate-100">
            <Image src={imagePath || "/images/products/product-fallback.jpg"} alt={nameAr || "معاينة المنتج"} fill className="object-cover" sizes="(max-width: 1280px) 100vw, 40vw" />
          </div>
          <div className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-black">{nameAr || "اسم المنتج"}</div>
                <div className="text-sm text-slate-500">{nameEn || "Product Name"}</div>
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-[#123b2b]">{formatEGP(promotionalPrice === "" ? basePrice : (Number(promotionalPrice) || basePrice))}</div>
                {oldPrice ? <div className="text-xs line-through text-slate-400">{formatEGP(Number(oldPrice) || 0)}</div> : null}
              </div>
            </div>
            <div className="text-sm text-slate-600">{shortDescriptionAr}</div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              {selectedCategory ? <span className="rounded-full bg-slate-100 px-3 py-1">{selectedCategory.nameAr}</span> : null}
              {featured ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">مميز</span> : null}
              {soldOut ? <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">نفد</span> : null}
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              رابط المنتج: <span className="font-semibold text-slate-900">{slugValue || slugify(nameEn || "")}</span>
            </div>
          </div>
        </div>
        {uploading ? <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">جاري رفع الصورة...</div> : null}
      </aside>
    </div>
  );
}

function ResourceList({ title, items, addLabel, endpoint }: { title: string; items: { id: string; title: string; subtitle?: string }[]; addLabel: string; endpoint: string }) {
  const [label, setLabel] = useState("");
  async function create() {
    if (!label.trim()) return;
    await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nameAr: label, nameEn: label, id: undefined, slug: label }) });
    window.location.reload();
  }
  return (
    <div className="space-y-5 rounded-[32px] bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-black">{title}</h1>
        <div className="flex gap-2">
          <input value={label} onChange={(e) => setLabel(e.target.value)} className={input} placeholder={addLabel} />
          <button type="button" onClick={create} className="rounded-2xl bg-[#123b2b] px-4 py-3 font-bold text-white"><Plus className="inline h-4 w-4" /> إضافة</button>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-[24px] border bg-slate-50 p-4">
            <div className="font-bold">{item.title}</div>
            <div className="text-sm text-slate-500">{item.subtitle}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaLibrary({ catalog, onUpload, uploading }: { catalog: CatalogData; onUpload: (file: File, productId?: string) => Promise<void>; uploading: boolean }) {
  return (
    <div className="space-y-5 rounded-[32px] bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-black">مكتبة الصور</h1>
        <label className="rounded-2xl bg-[#123b2b] px-4 py-3 font-bold text-white">
          <Upload className="inline h-4 w-4" /> رفع صورة
          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (file) await onUpload(file); }} />
        </label>
      </div>
      {uploading ? <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">جاري رفع الصورة...</div> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {catalog.images.map((image) => (
          <div key={image.id} className="overflow-hidden rounded-[24px] border bg-white">
            <Image src={image.path} alt={image.originalName} width={1200} height={900} className="h-44 w-full object-cover" sizes="(max-width: 1280px) 50vw, 25vw" />
            <div className="space-y-1 p-4 text-sm">
              <div className="font-semibold">{image.originalName}</div>
              <div className="text-slate-500">{image.width} × {image.height}</div>
              <div className="text-slate-500">{image.source}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className || ""}`}><div className="mb-2 text-sm font-medium text-slate-700">{label}</div>{children}</label>;
}

const input = "w-full rounded-2xl border border-slate-200 bg-[#fbfaf6] px-4 py-3 outline-none focus:border-[#123b2b] focus:ring-2 focus:ring-[#123b2b]/10";
void ProductEditor;
void MediaLibrary;

function PremiumProductEditor({ catalog, product, onUpload, uploading }: { catalog: CatalogData; product: CatalogProduct | null; onUpload: (file: File, productId?: string) => Promise<void>; uploading: boolean }) {
  const router = useRouter();
  const defaultImage = product?.images[0]?.path || "/images/products/product-fallback.jpg";
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as unknown as Resolver<ProductFormValues>,
    defaultValues: {
      nameAr: product?.nameAr || "",
      nameEn: product?.nameEn || "",
      shortDescriptionAr: product?.shortDescriptionAr || "",
      fullDescriptionAr: product?.fullDescriptionAr || "",
      categoryId: product?.categoryId || catalog.categories[0]?.id || "",
      slug: product?.slug || "",
      sku: product?.sku || "",
      productType: product?.productType || "standard",
      basePrice: product?.basePrice || 0,
      oldPrice: product?.oldPrice || "",
      promotionalPrice: product?.promotionalPrice || "",
      calories: product?.calories || "",
      rating: product?.rating || "",
      reviewCount: product?.reviewCount || "",
      tags: product?.tags.join(", ") || "",
      available: product?.available ?? true,
      soldOut: product?.soldOut ?? false,
      featured: product?.featured ?? false,
      bestSeller: product?.bestSeller ?? false,
      badgeAr: product?.badgeAr || "",
      modifierGroupIds: product?.modifierGroupIds || [],
      imagePath: defaultImage,
    },
  });

  const imagePath = useWatch({ control: form.control, name: "imagePath" });
  const slugValue = useWatch({ control: form.control, name: "slug" });
  const nameEn = useWatch({ control: form.control, name: "nameEn" });
  const nameAr = useWatch({ control: form.control, name: "nameAr" });
  const categoryId = useWatch({ control: form.control, name: "categoryId" });
  const productType = useWatch({ control: form.control, name: "productType" });
  const modifierGroupIds = useWatch({ control: form.control, name: "modifierGroupIds" });
  const basePrice = useWatch({ control: form.control, name: "basePrice" });
  const promotionalPrice = useWatch({ control: form.control, name: "promotionalPrice" });
  const oldPrice = useWatch({ control: form.control, name: "oldPrice" });
  const featured = useWatch({ control: form.control, name: "featured" });
  const soldOut = useWatch({ control: form.control, name: "soldOut" });
  const shortDescriptionAr = useWatch({ control: form.control, name: "shortDescriptionAr" });
  const selectedCategory = catalog.categories.find((item) => item.id === categoryId);

  async function submit(values: ProductFormValues) {
    const payload = {
      nameAr: values.nameAr,
      nameEn: values.nameEn,
      shortDescriptionAr: values.shortDescriptionAr,
      fullDescriptionAr: values.fullDescriptionAr,
      categoryId: values.categoryId,
      slug: values.slug || slugify(values.nameEn),
      sku: values.sku || undefined,
      productType: values.productType,
      basePrice: values.basePrice,
      oldPrice: values.oldPrice === "" ? undefined : values.oldPrice,
      promotionalPrice: values.promotionalPrice === "" ? undefined : values.promotionalPrice,
      calories: values.calories === "" ? undefined : values.calories,
      rating: values.rating === "" ? undefined : values.rating,
      reviewCount: values.reviewCount === "" ? undefined : values.reviewCount,
      tags: values.tags?.split(",").map((item) => item.trim()).filter(Boolean) || [],
      available: values.available,
      soldOut: values.soldOut,
      featured: values.featured,
      bestSeller: values.bestSeller,
      badgeAr: values.badgeAr || undefined,
      modifierGroupIds: values.modifierGroupIds,
      images: imagePath ? [{ id: "main", path: imagePath, alt: values.nameAr, source: "upload" as const }] : [],
    };
    const res = await fetch(product ? `/api/admin/catalog/products/${product.id}` : "/api/admin/catalog/products", {
      method: product ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await res.json().catch(() => null)) as { success?: boolean; product?: CatalogProduct; message?: string } | null;
    if (!res.ok || !result?.success) throw new Error(result?.message || "save failed");
    router.push("/admin/catalog");
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <form onSubmit={form.handleSubmit(submit)} className="space-y-6 rounded-[32px] bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-black">{product ? "تعديل منتج" : "إضافة منتج جديد"}</h1>
            <p className="mt-2 text-slate-500">في تغييرات لسه متحفظتش</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">Slug: {slugValue || slugify(nameEn || "")}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">آخر تحديث: {product ? new Date(product.updatedAt).toLocaleDateString("ar-EG") : "جديد"}</span>
            </div>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{productType === "build_your_own" ? "اعمل سلطتك" : productType === "drink" ? "مشروب" : "منتج عادي"}</div>
        </div>
        {uploading ? <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">جاري رفع الصورة وتحسينها...</div> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="اسم المنتج بالعربي"><input {...form.register("nameAr")} className={input} /></Field>
          <Field label="اسم المنتج بالإنجليزي"><input {...form.register("nameEn")} className={input} /></Field>
          <Field label="وصف قصير" className="md:col-span-2"><textarea {...form.register("shortDescriptionAr")} className={`${input} min-h-24`} /></Field>
          <Field label="وصف كامل" className="md:col-span-2"><textarea {...form.register("fullDescriptionAr")} className={`${input} min-h-32`} /></Field>
          <Field label="القسم"><select {...form.register("categoryId")} className={input}>{catalog.categories.map((c) => <option key={c.id} value={c.id}>{c.nameAr}</option>)}</select></Field>
          <Field label="نوع المنتج"><select {...form.register("productType")} className={input}><option value="standard">منتج عادي</option><option value="build_your_own">اعمل سلطتك</option><option value="drink">مشروب</option><option value="side">إضافة جانبية</option></select></Field>
          <Field label="رابط المنتج"><input {...form.register("slug")} className={input} placeholder={slugify(nameEn || "")} /></Field>
          <Field label="كود المنتج"><input {...form.register("sku")} className={input} /></Field>
          <Field label="السعر الأساسي"><input type="number" {...form.register("basePrice")} className={input} /></Field>
          <Field label="السعر القديم"><input type="number" {...form.register("oldPrice")} className={input} /></Field>
          <Field label="سعر العرض"><input type="number" {...form.register("promotionalPrice")} className={input} /></Field>
          <Field label="السعرات"><input type="number" {...form.register("calories")} className={input} /></Field>
          <Field label="التقييم"><input type="number" step="0.1" {...form.register("rating")} className={input} /></Field>
          <Field label="عدد التقييمات"><input type="number" {...form.register("reviewCount")} className={input} /></Field>
          <Field label="الصور" className="md:col-span-2">
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-[#fbfaf6] p-5">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm"><ImagePlus className="h-5 w-5 text-[#123b2b]" /></div>
                <div className="font-bold">اسحب الصور هنا أو اضغط علشان تختار</div>
                <div className="text-sm text-slate-500">JPG أو PNG أو WebP — بحد أقصى 8 ميجا للصورة</div>
                <label className="cursor-pointer rounded-2xl bg-[#123b2b] px-4 py-3 font-bold text-white">
                  رفع صورة
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (file) await onUpload(file, product?.id); }} />
                </label>
              </div>
            </div>
          </Field>
          <Field label="المسار الحالي"><input value={imagePath} readOnly className={input} /></Field>
          <Field label="التاجات"><input {...form.register("tags")} className={input} placeholder="نباتي, بروتين عالي" /></Field>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {["available", "soldOut", "featured", "bestSeller"].map((name) => (
            <label key={name} className="flex items-center justify-between rounded-2xl border px-4 py-3">
              <span>{name}</span>
              <input type="checkbox" {...form.register(name as "available")} />
            </label>
          ))}
        </div>

        <div className="space-y-3">
          <div className="text-lg font-bold">الإضافات</div>
          <div className="grid gap-2 md:grid-cols-2">
            {catalog.modifiers.map((modifier) => (
              <label key={modifier.id} className="flex items-center justify-between rounded-2xl border px-4 py-3">
                <span>{modifier.nameAr}</span>
                <input type="checkbox" checked={modifierGroupIds.includes(modifier.id)} onChange={(e) => {
                  const current = new Set(form.getValues("modifierGroupIds"));
                  if (e.target.checked) current.add(modifier.id); else current.delete(modifier.id);
                  form.setValue("modifierGroupIds", Array.from(current));
                }} />
              </label>
            ))}
          </div>
        </div>

        <div className="sticky bottom-4 flex flex-wrap gap-3 rounded-[24px] bg-[#fbfaf6]/90 p-3 backdrop-blur">
          <button type="submit" className="rounded-2xl bg-[#123b2b] px-5 py-3 font-bold text-white">حفظ</button>
          <Link href="/admin/catalog" className="rounded-2xl border px-5 py-3 font-bold">إلغاء</Link>
        </div>
      </form>

      <aside className="space-y-4 rounded-[32px] bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-black">معاينة المنتج</h2>
          <button type="button" onClick={() => router.push(`/product/${slugValue || slugify(nameEn || "")}`)} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold">Preview</button>
        </div>
        <div className="overflow-hidden rounded-[28px] border bg-white">
          <div className="relative h-64 overflow-hidden bg-slate-100">
            <Image src={imagePath || "/images/products/product-fallback.jpg"} alt={nameAr || "معاينة المنتج"} fill className="object-cover" priority sizes="(max-width: 1280px) 100vw, 40vw" />
          </div>
          <div className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-black">{nameAr || "اسم المنتج"}</div>
                <div className="text-sm text-slate-500">{nameEn || "Product Name"}</div>
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-[#123b2b]">{formatEGP(promotionalPrice === "" ? basePrice : (Number(promotionalPrice) || basePrice))}</div>
                {oldPrice ? <div className="text-xs line-through text-slate-400">{formatEGP(Number(oldPrice) || 0)}</div> : null}
              </div>
            </div>
            <div className="text-sm text-slate-600">{shortDescriptionAr}</div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              {selectedCategory ? <span className="rounded-full bg-slate-100 px-3 py-1">{selectedCategory.nameAr}</span> : null}
              {featured ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">مميز</span> : null}
              {soldOut ? <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">نفد</span> : null}
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              رابط المنتج: <span className="font-semibold text-slate-900">{slugValue || slugify(nameEn || "")}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function PremiumMediaLibrary({ catalog, onUpload, uploading }: { catalog: CatalogData; onUpload: (file: File, productId?: string) => Promise<void>; uploading: boolean }) {
  const usedPaths = new Map<string, string[]>();
  for (const product of catalog.products) {
    for (const image of product.images) usedPaths.set(image.path, [...(usedPaths.get(image.path) || []), product.nameAr]);
  }
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selected, setSelected] = useState<CatalogImage | null>(null);
  const totalSize = catalog.images.reduce((sum, image) => sum + image.size, 0);
  const issues = catalog.images.filter((image) => image.width < 1000 || image.height < 750 || image.size > 2_000_000);
  const selectedUsedBy = selected ? usedPaths.get(selected.path) || [] : [];

  return (
    <div className="space-y-6 rounded-[32px] bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-sm text-slate-500">مكتبة الصور</div>
          <h1 className="font-display text-3xl font-black">نظّم صور المنتجات والأقسام والعروض من مكان واحد</h1>
          <p className="mt-2 text-slate-500">اسحب الصور هنا أو اضغط علشان تختار</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-2xl bg-[#123b2b] px-4 py-3 font-bold text-white"><ImagePlus className="h-4 w-4" /> رفع صور جديدة</button>
          <button type="button" className="rounded-2xl border px-4 py-3 font-bold">اختيار من المكتبة</button>
          <button type="button" className="rounded-2xl border px-4 py-3 font-bold">فحص الصور</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["إجمالي الصور", catalog.images.length],
          ["صور مستخدمة", catalog.images.length - catalog.images.filter((image) => (usedPaths.get(image.path) || []).length === 0).length],
          ["صور غير مستخدمة", catalog.images.filter((image) => (usedPaths.get(image.path) || []).length === 0).length],
          ["صور فيها مشكلة", issues.length],
          ["حجم المكتبة", `${Math.max(1, Math.round(totalSize / 1024 / 1024))} MB`],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-[24px] bg-slate-50 p-4">
            <div className="text-sm text-slate-500">{label as string}</div>
            <div className="mt-2 text-2xl font-black text-[#123b2b]">{value as string | number}</div>
          </div>
        ))}
      </div>

      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (file) await onUpload(file); }} />
      {uploading ? <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">جاري تحسين الصورة...</div> : null}

      <div className="rounded-[28px] border border-dashed border-slate-300 bg-[#fbfaf6] p-5">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm"><Upload className="h-5 w-5 text-[#123b2b]" /></div>
          <div className="text-lg font-bold">اسحب الصور هنا أو اضغط علشان تختار</div>
          <div className="text-sm text-slate-500">JPG أو PNG أو WebP — بحد أقصى 8 ميجا للصورة</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {catalog.images.map((image) => {
          const usedBy = usedPaths.get(image.path) || [];
          const issue = image.width < 1000 || image.height < 750 || image.size > 2_000_000;
          return (
            <button key={image.id} type="button" onClick={() => setSelected(image)} className="overflow-hidden rounded-[24px] border bg-white text-right shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="relative h-52 bg-slate-100">
                <Image src={image.path} alt={image.originalName} fill className="object-cover" sizes="(max-width: 1280px) 50vw, 25vw" />
                <div className="absolute left-3 top-3 flex gap-2">
                  {usedBy.length ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">مستخدمة</span> : <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">غير مستخدمة</span>}
                  {issue ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">جودة منخفضة</span> : null}
                </div>
              </div>
              <div className="space-y-2 p-4 text-sm">
                <div className="font-bold text-slate-900">{image.originalName}</div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>{image.width} × {image.height}</span>
                  <span>{Math.max(1, Math.round(image.size / 1024))} KB</span>
                  <span>{image.mimeType.replace("image/", "")}</span>
                  <span>{image.source}</span>
                </div>
                <div className="text-xs text-slate-500">{usedBy[0] ? `مستخدمة في ${usedBy[0]}` : "غير مرتبطة بمنتج"}</div>
              </div>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-elevated" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <div className="text-sm text-slate-500">معاينة الصورة</div>
                <div className="font-bold">{selected.originalName}</div>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="rounded-full p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-0 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="relative min-h-[420px] bg-slate-100">
                <Image src={selected.path} alt={selected.originalName} fill className="object-contain" sizes="(max-width: 1024px) 100vw, 60vw" />
              </div>
              <div className="space-y-4 p-5">
                <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                  <div className="font-bold">المعلومات</div>
                  <div className="mt-2 space-y-1 text-slate-600">
                    <div>الأبعاد: {selected.width} × {selected.height}</div>
                    <div>الحجم: {Math.max(1, Math.round(selected.size / 1024))} KB</div>
                    <div>MIME: {selected.mimeType}</div>
                    <div>المصدر: {selected.source}</div>
                    {selected.sourceUrl ? <div>الرابط: {selected.sourceUrl}</div> : null}
                    {selected.photographer ? <div>المصور: {selected.photographer}</div> : null}
                  </div>
                </div>
                <div className="rounded-2xl border p-4 text-sm text-slate-600">
                  <div className="font-bold text-slate-900">الاستخدامات</div>
                  <div className="mt-2">{selectedUsedBy.length ? selectedUsedBy.join("، ") : "الصورة غير مستخدمة حالياً"}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="rounded-2xl bg-[#123b2b] px-4 py-3 font-bold text-white">استخدم كصورة رئيسية</button>
                  <button type="button" className="rounded-2xl border px-4 py-3 font-bold">استبدال الصورة</button>
                  <button type="button" className="rounded-2xl border px-4 py-3 font-bold">تعديل نقطة التركيز</button>
                  <button type="button" className="rounded-2xl border px-4 py-3 font-bold text-rose-700">حذف الصورة</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
