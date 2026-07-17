import type { CatalogCategory, CatalogData, CatalogIngredient, CatalogModifierGroup, CatalogProduct, CatalogProductImage } from "@/types/catalog";
import { now, uniqueId, slugify, normalizeProduct, nextSortOrder, productMainImage } from "./helpers";

export function upsertProduct(catalog: CatalogData, input: Partial<CatalogProduct>, currentId?: string) {
  const current = currentId ? catalog.products.find((product) => product.id === currentId) : undefined;
  const slug = input.slug ? input.slug : slugify(input.nameEn || current?.nameEn || "product");
  const aliases = new Set([...(current?.slugAliases ?? []), ...(current?.slug && current.slug !== slug ? [current.slug] : []), ...(input.slugAliases ?? [])]);
  const product = normalizeProduct({
    id: current?.id || input.id || uniqueId("prd"),
    slug,
    sku: input.sku ?? current?.sku,
    productType: input.productType || current?.productType || "standard",
    nameAr: input.nameAr || current?.nameAr || "منتج جديد",
    nameEn: input.nameEn || current?.nameEn || "New Product",
    shortDescriptionAr: input.shortDescriptionAr || current?.shortDescriptionAr || "وصف قصير للمنتج",
    fullDescriptionAr: input.fullDescriptionAr ?? current?.fullDescriptionAr,
    categoryId: input.categoryId || current?.categoryId || catalog.categories[0]?.id || "top",
    basePrice: input.basePrice ?? current?.basePrice ?? 0,
    oldPrice: input.oldPrice ?? current?.oldPrice,
    promotionalPrice: input.promotionalPrice ?? current?.promotionalPrice,
    badgeAr: input.badgeAr ?? current?.badgeAr,
    images: input.images ?? current?.images ?? [],
    primaryImageId: input.primaryImageId ?? current?.primaryImageId,
    ingredients: input.ingredients ?? current?.ingredients ?? [],
    tags: input.tags ?? current?.tags ?? [],
    calories: input.calories ?? current?.calories,
    protein: input.protein ?? current?.protein,
    carbs: input.carbs ?? current?.carbs,
    fat: input.fat ?? current?.fat,
    rating: input.rating ?? current?.rating,
    reviewCount: input.reviewCount ?? current?.reviewCount,
    modifierGroupIds: input.modifierGroupIds ?? current?.modifierGroupIds ?? [],
    available: input.available ?? current?.available ?? true,
    soldOut: input.soldOut ?? current?.soldOut ?? false,
    featured: input.featured ?? current?.featured ?? false,
    bestSeller: input.bestSeller ?? current?.bestSeller ?? false,
    slugAliases: Array.from(aliases),
    availableDays: input.availableDays ?? current?.availableDays,
    availableFrom: input.availableFrom ?? current?.availableFrom,
    availableUntil: input.availableUntil ?? current?.availableUntil,
    sortOrder: input.sortOrder ?? current?.sortOrder ?? nextSortOrder(catalog.products),
    deletedAt: input.deletedAt ?? current?.deletedAt,
    createdAt: current?.createdAt || now(),
    updatedAt: now(),
  });
  if (current) {
    catalog.products = catalog.products.map((item) => (item.id === current.id ? product : item));
  } else {
    catalog.products.push(product);
  }
  return product;
}

export function duplicateProductInCatalog(catalog: CatalogData, productId: string) {
  const source = catalog.products.find((product) => product.id === productId);
  if (!source) return null;
  const copy: CatalogProduct = {
    ...source,
    id: uniqueId("prd"),
    slug: `${source.slug}-copy`,
    slugAliases: [source.slug],
    sku: source.sku ? `${source.sku}-copy` : undefined,
    nameAr: `${source.nameAr} - نسخة`,
    nameEn: `${source.nameEn} copy`,
    available: false,
    featured: false,
    bestSeller: false,
    soldOut: false,
    deletedAt: undefined,
    createdAt: now(),
    updatedAt: now(),
    images: source.images.map((image) => ({ ...image, id: uniqueId("img") })),
    primaryImageId: source.primaryImageId,
  };
  catalog.products.unshift(copy);
  return copy;
}

export function reorderProducts(catalog: CatalogData, ids: string[]) {
  const lookup = new Map(catalog.products.map((product) => [product.id, product]));
  const reordered = ids.map((id, index) => {
    const product = lookup.get(id);
    if (!product) return null;
    return { ...product, sortOrder: index, updatedAt: now() };
  }).filter(Boolean) as CatalogProduct[];
  const rest = catalog.products.filter((product) => !ids.includes(product.id)).map((product) => ({ ...product, sortOrder: ids.length + product.sortOrder }));
  catalog.products = [...reordered, ...rest].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function upsertCategory(catalog: CatalogData, input: Partial<CatalogCategory>, currentId?: string) {
  const current = currentId ? catalog.categories.find((category) => category.id === currentId) : undefined;
  const category: CatalogCategory = {
    id: current?.id || input.id || uniqueId("cat"),
    slug: input.slug || slugify(input.nameEn || input.nameAr || current?.nameAr || "category"),
    nameAr: input.nameAr || current?.nameAr || "قسم جديد",
    nameEn: input.nameEn || current?.nameEn || "",
    descriptionAr: input.descriptionAr ?? current?.descriptionAr ?? "",
    image: input.image ?? current?.image,
    icon: input.icon ?? current?.icon,
    featured: input.featured ?? current?.featured ?? false,
    enabled: input.enabled ?? current?.enabled ?? true,
    sortOrder: input.sortOrder ?? current?.sortOrder ?? nextSortOrder(catalog.categories),
  };
  if (current) {
    catalog.categories = catalog.categories.map((item) => (item.id === current.id ? category : item));
  } else {
    catalog.categories.push(category);
  }
  return category;
}

export function reorderCategories(catalog: CatalogData, ids: string[]) {
  catalog.categories = ids
    .map((id, index) => {
      const category = catalog.categories.find((item) => item.id === id);
      return category ? { ...category, sortOrder: index } : null;
    })
    .filter(Boolean) as CatalogCategory[];
}

export function upsertModifierGroup(catalog: CatalogData, input: Partial<CatalogModifierGroup>, currentId?: string) {
  const current = currentId ? catalog.modifiers.find((modifier) => modifier.id === currentId) : undefined;
  const modifier: CatalogModifierGroup = {
    id: current?.id || input.id || uniqueId("mod"),
    nameAr: input.nameAr || current?.nameAr || "مجموعة جديدة",
    nameEn: input.nameEn ?? current?.nameEn,
    descriptionAr: input.descriptionAr ?? current?.descriptionAr,
    type: input.type || current?.type || "single",
    required: input.required ?? current?.required ?? false,
    minSelections: input.minSelections ?? current?.minSelections,
    maxSelections: input.maxSelections ?? current?.maxSelections,
    options: (input.options || current?.options || []).map((option) => ({
      id: option.id || uniqueId("opt"),
      nameAr: option.nameAr,
      nameEn: option.nameEn,
      price: option.price,
      available: option.available ?? true,
      image: option.image,
    })),
    enabled: input.enabled ?? current?.enabled ?? true,
    sortOrder: input.sortOrder ?? current?.sortOrder ?? nextSortOrder(catalog.modifiers),
    productIds: input.productIds ?? current?.productIds ?? [],
  };
  if (current) {
    catalog.modifiers = catalog.modifiers.map((item) => (item.id === current.id ? modifier : item));
  } else {
    catalog.modifiers.push(modifier);
  }
  return modifier;
}

export function upsertIngredient(catalog: CatalogData, input: Partial<CatalogIngredient>, currentId?: string) {
  const current = currentId ? catalog.ingredients.find((ingredient) => ingredient.id === currentId) : undefined;
  const ingredient: CatalogIngredient = {
    id: current?.id || input.id || uniqueId("ing"),
    nameAr: input.nameAr || current?.nameAr || "مكون جديد",
    image: input.image ?? current?.image,
    extraPrice: input.extraPrice ?? current?.extraPrice,
    calories: input.calories ?? current?.calories,
    allergens: input.allergens ?? current?.allergens ?? [],
    available: input.available ?? current?.available ?? true,
    removable: input.removable ?? current?.removable ?? true,
  };
  if (current) {
    catalog.ingredients = catalog.ingredients.map((item) => (item.id === current.id ? ingredient : item));
  } else {
    catalog.ingredients.push(ingredient);
  }
  return ingredient;
}

export function attachProductImage(catalog: CatalogData, productId: string, image: CatalogProductImage) {
  const product = catalog.products.find((item) => item.id === productId);
  if (!product) return null;
  product.images = [...product.images, image];
  if (!product.primaryImageId) product.primaryImageId = image.id;
  product.updatedAt = now();
  const existing = catalog.images.find((item) => item.path === image.path);
  if (!existing) {
    catalog.images.push({
      id: image.id,
      path: image.path,
      originalName: image.alt || image.id,
      source: image.source || "upload",
      width: image.width || 1200,
      height: image.height || 900,
      mimeType: "image/webp",
      size: 0,
      createdAt: now(),
    });
  }
  return image;
}

export function removeProductImage(catalog: CatalogData, productId: string, imageId: string) {
  const product = catalog.products.find((item) => item.id === productId);
  if (!product) return null;
  product.images = product.images.filter((image) => image.id !== imageId);
  if (product.primaryImageId === imageId) product.primaryImageId = product.images[0]?.id;
  product.updatedAt = now();
  return product;
}

export function catalogStats(catalog: CatalogData) {
  return {
    totalProducts: catalog.products.filter((product) => !product.deletedAt).length,
    activeProducts: catalog.products.filter((product) => !product.deletedAt && product.available && !product.soldOut).length,
    pausedProducts: catalog.products.filter((product) => !product.deletedAt && !product.available).length,
    soldOutProducts: catalog.products.filter((product) => !product.deletedAt && product.soldOut).length,
    productsWithoutImage: catalog.products.filter((product) => !product.deletedAt && !productMainImage(product)).length,
    categories: catalog.categories.length,
    modifiers: catalog.modifiers.length,
    ingredients: catalog.ingredients.length,
  };
}
