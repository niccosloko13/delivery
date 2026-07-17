import { categories as seedCategories, products as seedProducts } from "@/data/catalog";
import type { CatalogData, CatalogProduct, CatalogCategory, CatalogIngredient, CatalogModifierGroup } from "@/types/catalog";

function now() {
  return new Date().toISOString();
}

const categories: CatalogCategory[] = seedCategories.map((cat, index) => ({
  id: cat.id,
  slug: cat.id,
  nameAr: cat.nameAr,
  nameEn: cat.nameAr,
  descriptionAr: cat.descriptionAr,
  icon: cat.emoji,
  featured: index < 5,
  enabled: true,
  sortOrder: index,
}));

const ingredients: CatalogIngredient[] = Array.from(new Set(seedProducts.flatMap((p) => p.ingredients))).map((nameAr, index) => ({
  id: `ing-${index + 1}`,
  nameAr,
  available: true,
  removable: true,
}));

const modifiers: CatalogModifierGroup[] = [];

const products: CatalogProduct[] = seedProducts.map((product, index) => ({
  id: product.id,
  slug: product.slug,
  sku: product.id.toUpperCase(),
  productType: product.id === "build-salad" ? "build_your_own" : "standard",
  nameAr: product.nameAr,
  nameEn: product.nameEn,
  shortDescriptionAr: product.descriptionAr,
  fullDescriptionAr: product.descriptionAr,
  categoryId: product.category,
  basePrice: product.price,
  oldPrice: product.oldPrice,
  promotionalPrice: product.oldPrice ? product.price : undefined,
  images: [{ id: `img-${product.id}`, path: product.image, alt: product.nameAr, source: "generated" }],
  primaryImageId: `img-${product.id}`,
  ingredients: ingredients.filter((ingredient) => product.ingredients.includes(ingredient.nameAr)),
  tags: product.tags,
  calories: product.calories,
  rating: product.rating,
  reviewCount: product.reviewCount,
  modifierGroupIds: modifiers.map((modifier) => modifier.id),
  available: product.available,
  soldOut: !product.available,
  featured: product.featured,
  bestSeller: product.featured,
  sortOrder: index,
  createdAt: now(),
  updatedAt: now(),
}));

export const defaultCatalogData: CatalogData = {
  products,
  categories,
  ingredients,
  modifiers,
  images: products.flatMap((product) => product.images.map((image) => ({
    id: image.id,
    path: image.path,
    originalName: image.alt || image.id,
    source: "generated",
    width: image.width || 1200,
    height: image.height || 900,
    mimeType: "image/jpeg",
    size: 0,
    createdAt: now(),
  }))),
};
