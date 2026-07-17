import { z } from "zod";

const baseString = z.string().trim().min(1);
const priceSchema = z.number().int().nonnegative();

export const catalogImageSchema = z.object({
  id: baseString,
  path: baseString,
  originalName: baseString,
  source: z.enum(["upload", "unsplash", "pexels", "pixabay", "generated"]),
  sourceUrl: z.string().url().optional(),
  photographer: z.string().optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  mimeType: z.string().min(1),
  size: z.number().int().nonnegative(),
  createdAt: z.string().min(1),
});

export const modifierOptionSchema = z.object({
  id: baseString,
  nameAr: baseString,
  nameEn: z.string().trim().optional(),
  price: priceSchema.optional(),
  available: z.boolean().optional(),
  image: z.string().optional(),
});

export const modifierGroupSchema = z.object({
  id: baseString,
  nameAr: baseString,
  nameEn: z.string().trim().optional(),
  descriptionAr: z.string().trim().optional(),
  type: z.enum(["single", "multiple", "quantity", "removal"]),
  required: z.boolean(),
  minSelections: z.number().int().nonnegative().optional(),
  maxSelections: z.number().int().positive().optional(),
  options: z.array(modifierOptionSchema),
  enabled: z.boolean(),
  sortOrder: z.number().int(),
  productIds: z.array(z.string().trim()).optional(),
});

export const categorySchema = z.object({
  id: baseString,
  slug: baseString,
  nameAr: baseString,
  nameEn: z.string().trim().optional(),
  descriptionAr: z.string().trim().optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  featured: z.boolean().optional(),
  enabled: z.boolean().optional(),
  sortOrder: z.number().int(),
});

export const ingredientSchema = z.object({
  id: baseString,
  nameAr: baseString,
  image: z.string().optional(),
  extraPrice: priceSchema.optional(),
  calories: z.number().int().nonnegative().optional(),
  allergens: z.array(z.string()).optional(),
  available: z.boolean(),
  removable: z.boolean(),
});

export const productImageSchema = z.object({
  id: baseString,
  path: baseString,
  alt: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  source: z.enum(["upload", "unsplash", "pexels", "pixabay", "generated"]).optional(),
});

export const productSchema = z.object({
  id: baseString,
  slug: baseString,
  sku: z.string().trim().optional(),
  productType: z.enum(["standard", "build_your_own", "drink", "side"]),
  nameAr: baseString,
  nameEn: baseString,
  shortDescriptionAr: z.string().trim().min(1).max(200),
  fullDescriptionAr: z.string().trim().optional(),
  categoryId: baseString,
  basePrice: priceSchema,
  oldPrice: priceSchema.optional(),
  promotionalPrice: priceSchema.optional(),
  badgeAr: z.string().trim().optional(),
  images: z.array(productImageSchema),
  primaryImageId: z.string().trim().optional(),
  ingredients: z.array(ingredientSchema),
  tags: z.array(z.string().trim()),
  calories: z.number().int().nonnegative().optional(),
  protein: z.number().int().nonnegative().optional(),
  carbs: z.number().int().nonnegative().optional(),
  fat: z.number().int().nonnegative().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().nonnegative().optional(),
  modifierGroupIds: z.array(z.string().trim()),
  available: z.boolean(),
  soldOut: z.boolean(),
  featured: z.boolean(),
  bestSeller: z.boolean(),
  slugAliases: z.array(z.string()).optional(),
  availableDays: z.array(z.number().int()).optional(),
  availableFrom: z.string().optional(),
  availableUntil: z.string().optional(),
  sortOrder: z.number().int(),
  deletedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const catalogSchema = z.object({
  products: z.array(productSchema),
  categories: z.array(categorySchema),
  ingredients: z.array(ingredientSchema),
  modifiers: z.array(modifierGroupSchema),
  images: z.array(catalogImageSchema),
});

export type CatalogPayload = z.infer<typeof catalogSchema>;

