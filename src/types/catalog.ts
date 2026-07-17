export type ModifierGroupType = "single" | "multiple" | "quantity" | "removal";

export type CatalogImageSource = "upload" | "unsplash" | "pexels" | "pixabay" | "generated";

export type CatalogImage = {
  id: string;
  path: string;
  originalName: string;
  source: CatalogImageSource;
  sourceUrl?: string;
  photographer?: string;
  width: number;
  height: number;
  mimeType: string;
  size: number;
  createdAt: string;
};

export type CatalogCategory = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn?: string;
  descriptionAr?: string;
  image?: string;
  icon?: string;
  featured?: boolean;
  enabled?: boolean;
  sortOrder: number;
};

export type CatalogIngredient = {
  id: string;
  nameAr: string;
  image?: string;
  extraPrice?: number;
  calories?: number;
  allergens?: string[];
  available: boolean;
  removable: boolean;
};

export type CatalogModifierOption = {
  id: string;
  nameAr: string;
  nameEn?: string;
  price?: number;
  available?: boolean;
  image?: string;
};

export type CatalogModifierGroup = {
  id: string;
  nameAr: string;
  nameEn?: string;
  descriptionAr?: string;
  type: ModifierGroupType;
  required: boolean;
  minSelections?: number;
  maxSelections?: number;
  options: CatalogModifierOption[];
  enabled: boolean;
  sortOrder: number;
  productIds?: string[];
};

export type CatalogProductImage = {
  id: string;
  path: string;
  alt?: string;
  width?: number;
  height?: number;
  source?: CatalogImageSource;
};

export type ProductType = "standard" | "build_your_own" | "drink" | "side";

export type CatalogProduct = {
  id: string;
  slug: string;
  sku?: string;
  productType: ProductType;
  nameAr: string;
  nameEn: string;
  shortDescriptionAr: string;
  fullDescriptionAr?: string;
  categoryId: string;
  basePrice: number;
  oldPrice?: number;
  promotionalPrice?: number;
  badgeAr?: string;
  images: CatalogProductImage[];
  primaryImageId?: string;
  ingredients: CatalogIngredient[];
  tags: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  rating?: number;
  reviewCount?: number;
  modifierGroupIds: string[];
  available: boolean;
  soldOut: boolean;
  featured: boolean;
  bestSeller: boolean;
  slugAliases?: string[];
  availableDays?: number[];
  availableFrom?: string;
  availableUntil?: string;
  sortOrder: number;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type CatalogData = {
  products: CatalogProduct[];
  categories: CatalogCategory[];
  ingredients: CatalogIngredient[];
  modifiers: CatalogModifierGroup[];
  images: CatalogImage[];
};
