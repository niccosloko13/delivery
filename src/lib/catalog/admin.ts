import { slugify, now, uniqueId, normalizeProduct, isActiveProduct } from "./helpers";
import type { CatalogData, CatalogProduct } from "@/types/catalog";

export function productPublicImage(product: CatalogProduct) {
  return product.images.find((image) => image.id === product.primaryImageId) ?? product.images[0] ?? null;
}

export function findProduct(catalog: CatalogData, idOrSlug: string) {
  return catalog.products.find((product) => product.id === idOrSlug || product.slug === idOrSlug || product.slugAliases?.includes(idOrSlug)) ?? null;
}

export function productUsedByOrders() {
  return false;
}

export function createUniqueSlug(catalog: CatalogData, nameEn: string, currentId?: string) {
  const base = slugify(nameEn) || `product-${uniqueId("p")}`;
  let slug = base;
  let counter = 2;
  const existing = new Set(catalog.products.filter((product) => product.id !== currentId).flatMap((product) => [product.slug, ...(product.slugAliases ?? [])]));
  while (existing.has(slug)) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

export function createProductTemplate(partial?: Partial<CatalogProduct>): CatalogProduct {
  const id = partial?.id || uniqueId("prd");
  const nowIso = now();
  return normalizeProduct({
    id,
    slug: partial?.slug || `${id}`,
    sku: partial?.sku,
    productType: partial?.productType || "standard",
    nameAr: partial?.nameAr || "منتج جديد",
    nameEn: partial?.nameEn || "New Product",
    shortDescriptionAr: partial?.shortDescriptionAr || "وصف قصير للمنتج",
    fullDescriptionAr: partial?.fullDescriptionAr || "",
    categoryId: partial?.categoryId || "top",
    basePrice: partial?.basePrice ?? 0,
    oldPrice: partial?.oldPrice,
    promotionalPrice: partial?.promotionalPrice,
    badgeAr: partial?.badgeAr,
    images: partial?.images ?? [],
    primaryImageId: partial?.primaryImageId,
    ingredients: partial?.ingredients ?? [],
    tags: partial?.tags ?? [],
    calories: partial?.calories,
    protein: partial?.protein,
    carbs: partial?.carbs,
    fat: partial?.fat,
    rating: partial?.rating,
    reviewCount: partial?.reviewCount,
    modifierGroupIds: partial?.modifierGroupIds ?? [],
    available: partial?.available ?? true,
    soldOut: partial?.soldOut ?? false,
    featured: partial?.featured ?? false,
    bestSeller: partial?.bestSeller ?? false,
    slugAliases: partial?.slugAliases ?? [],
    availableDays: partial?.availableDays,
    availableFrom: partial?.availableFrom,
    availableUntil: partial?.availableUntil,
    sortOrder: partial?.sortOrder ?? 0,
    deletedAt: partial?.deletedAt,
    createdAt: partial?.createdAt || nowIso,
    updatedAt: partial?.updatedAt || nowIso,
  });
}

export function duplicateProduct(product: CatalogProduct, catalog: CatalogData) {
  const copyId = uniqueId("prd");
  const slug = createUniqueSlug(catalog, `${product.nameEn} copy`, copyId);
  const copy = createProductTemplate({
    ...product,
    id: copyId,
    slug,
    sku: product.sku ? `${product.sku}-copy` : undefined,
    nameAr: `${product.nameAr} - نسخة`,
    nameEn: `${product.nameEn} copy`,
    available: false,
    featured: false,
    bestSeller: false,
    soldOut: false,
    deletedAt: undefined,
    createdAt: now(),
    updatedAt: now(),
    slugAliases: [product.slug],
    images: product.images.map((image) => ({ ...image, id: uniqueId("img") })),
  });
  return copy;
}

export function normalizeProductPayload(catalog: CatalogData, product: Partial<CatalogProduct>, currentId?: string) {
  const slug = product.slug ? createUniqueSlug(catalog, product.slug, currentId) : createUniqueSlug(catalog, product.nameEn || "Product", currentId);
  const current = catalog.products.find((item) => item.id === currentId);
  const slugAliases = Array.from(new Set([...(current?.slugAliases ?? []), ...(current?.slug && current.slug !== slug ? [current.slug] : []), ...(product.slugAliases ?? [])]));
  return createProductTemplate({
    ...(current || {}),
    ...product,
    slug,
    slugAliases,
    updatedAt: now(),
    createdAt: current?.createdAt || now(),
  });
}

export function filterActiveProducts(catalog: CatalogData) {
  return catalog.products.filter(isActiveProduct);
}

export function categoryHasProducts(catalog: CatalogData, categoryId: string) {
  return catalog.products.some((product) => product.categoryId === categoryId && !product.deletedAt);
}

export function relatedProductCount(catalog: CatalogData, imagePath: string) {
  return catalog.products.filter((product) => product.images.some((image) => image.path === imagePath)).length;
}

export function ensureModifierIds(product: CatalogProduct, modifierIds: string[]) {
  return { ...product, modifierGroupIds: modifierIds };
}
