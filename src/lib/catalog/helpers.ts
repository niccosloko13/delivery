import { readFile, writeFile, rename, copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type {
  CatalogCategory,
  CatalogData,
  CatalogImage,
  CatalogIngredient,
  CatalogModifierGroup,
  CatalogModifierOption,
  CatalogProduct,
  CatalogProductImage,
  ProductType,
} from "@/types/catalog";

export const CATALOG_DIR = path.join(process.cwd(), "data");
export const CATALOG_PATH = path.join(CATALOG_DIR, "catalog.json");
export const CATALOG_BACKUP_PATH = path.join(CATALOG_DIR, "catalog.json.bak");
export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");

export function now() {
  return new Date().toISOString();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function uniqueId(prefix: string) {
  return `${prefix}-${crypto.randomBytes(4).toString("hex")}`;
}

export function ensureArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

export function hasImage(pathname?: string) {
  return !!pathname && pathname.trim().length > 0;
}

export function normalizeProduct(product: CatalogProduct, fallbackSortOrder = 0): CatalogProduct {
  const images = ensureArray(product.images);
  return {
    ...product,
    images,
    ingredients: ensureArray(product.ingredients),
    tags: ensureArray(product.tags),
    modifierGroupIds: ensureArray(product.modifierGroupIds),
    productType: product.productType || "standard",
    available: product.available ?? true,
    soldOut: product.soldOut ?? false,
    featured: product.featured ?? false,
    bestSeller: product.bestSeller ?? false,
    sortOrder: Number.isFinite(product.sortOrder) ? product.sortOrder : fallbackSortOrder,
    slugAliases: ensureArray((product as CatalogProduct & { slugAliases?: string[] }).slugAliases),
    createdAt: product.createdAt || now(),
    updatedAt: product.updatedAt || now(),
  } as CatalogProduct & { slugAliases?: string[] };
}

export function normalizeCatalog(catalog: CatalogData): CatalogData {
  const products = ensureArray(catalog.products).map((product, index) => normalizeProduct(product, index));
  const categories = ensureArray(catalog.categories).map((category, index) => ({
    enabled: true,
    featured: false,
    ...category,
    sortOrder: Number.isFinite(category.sortOrder) ? category.sortOrder : index,
  })) as CatalogCategory[];
  const ingredients = ensureArray(catalog.ingredients).map((ingredient) => ({
    ...ingredient,
    available: ingredient.available ?? true,
    removable: ingredient.removable ?? true,
  })) as CatalogIngredient[];
  const modifiers = ensureArray(catalog.modifiers).map((modifier, index) => ({
    ...modifier,
    sortOrder: Number.isFinite(modifier.sortOrder) ? modifier.sortOrder : index,
    enabled: modifier.enabled ?? true,
    options: ensureArray(modifier.options).map((option) => ({ ...option, available: option.available ?? true })) as CatalogModifierOption[],
  })) as CatalogModifierGroup[];
  const images = ensureArray(catalog.images).map((image) => ({ ...image })) as CatalogImage[];
  return { products, categories, ingredients, modifiers, images };
}

export async function ensureCatalogDir() {
  await mkdir(CATALOG_DIR, { recursive: true });
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export async function safeReadJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function atomicWriteJson(filePath: string, data: unknown) {
  await ensureCatalogDir();
  const tmpPath = `${filePath}.tmp`;
  await writeFile(tmpPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  try {
    await copyFile(filePath, `${filePath}.bak`);
  } catch {
    // ignore missing original
  }
  await rename(tmpPath, filePath);
}

export async function removeFileIfExists(filePath: string) {
  try {
    await rm(filePath);
  } catch {
    // ignore
  }
}

export function nextSortOrder<T extends { sortOrder: number }>(items: T[]) {
  return (items.reduce((max, item) => Math.max(max, item.sortOrder), -1) ?? -1) + 1;
}

export function cloneImage(image: CatalogProductImage): CatalogProductImage {
  return { ...image, id: uniqueId("img") };
}

export function productUsesImage(product: CatalogProduct, imagePath: string) {
  return ensureArray(product.images).some((image) => image.path === imagePath);
}

export function productMainImage(product: CatalogProduct) {
  return product.images.find((image) => image.id === product.primaryImageId) ?? product.images[0];
}

export function isActiveProduct(product: CatalogProduct) {
  return product.available && !product.soldOut && !product.deletedAt;
}

export function productTypeLabel(type: ProductType) {
  switch (type) {
    case "build_your_own":
      return "اعمل سلطتك";
    case "drink":
      return "مشروب";
    case "side":
      return "إضافة جانبية";
    default:
      return "منتج عادي";
  }
}
