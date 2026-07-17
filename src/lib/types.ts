export type CategoryId =
  | "top"
  | "chicken"
  | "beef"
  | "seafood"
  | "vegan"
  | "diet"
  | "build"
  | "extras"
  | "dessert"
  | "drinks";

export type ProductTag =
  | "نباتي"
  | "فيجان"
  | "بروتين عالي"
  | "قليل السعرات"
  | "كيتو"
  | "بدون جلوتين"
  | "حار"
  | "الأكثر طلبًا";

export interface ModifierGroup {
  id: string;
  nameAr: string;
  type: "single" | "multi";
  required?: boolean;
  max?: number;
  options: Array<{
    id: string;
    nameAr: string;
    price?: number;
  }>;
}

export interface Product {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  category: CategoryId;
  price: number;
  oldPrice?: number;
  image: string;
  calories: number;
  rating: number;
  reviewCount: number;
  ingredients: string[];
  tags: ProductTag[];
  modifiers: ModifierGroup[];
  available: boolean;
  featured: boolean;
}

export interface Category {
  id: CategoryId;
  nameAr: string;
  descriptionAr: string;
  emoji: string;
}

export interface Promo {
  titleAr: string;
  subtitleAr: string;
  badgeAr: string;
  ctaAr: string;
}

export interface Review {
  nameAr: string;
  date: string;
  rating: number;
  textAr: string;
}

