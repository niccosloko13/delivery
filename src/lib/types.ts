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

export type PaymentMethod = "cash" | "card_on_delivery" | "instapay" | "wallet";

export interface Customer {
  name: string;
  phone: string;
  email?: string;
}

export interface Address {
  area: string;
  street: string;
  building: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
  driverNotes?: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  maxDiscount?: number;
}

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

export interface OrderItemSnapshot {
  productId: string;
  nameAr: string;
  quantity: number;
  modifiers?: Array<{
    groupNameAr: string;
    optionNamesAr: string[];
    optionPrice?: number;
  }>;
  size?: "عادي" | "كبير";
  base?: string;
  protein?: string[];
  vegetables?: string[];
  sauces?: string[];
  extras?: string[];
  removals?: string[];
  notes?: string;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  number: string;
  createdAt: string;
  customer: Customer;
  address: Address;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  changeFor?: number | null;
  status: "created" | "whatsapp_opened" | "customer_marked_as_sent" | "restaurant_confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled" | "confirmed" | "pending" | "في انتظار الإرسال" | "تم إرسال الطلب" | "تم التأكيد" | "جاري التحضير" | "خرج للتوصيل" | "تم التوصيل" | "ملغي";
  whatsappMessage?: string;
  whatsappUrl?: string;
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
