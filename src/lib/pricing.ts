import { CartItem } from "@/store/app-store";
import { getProductById } from "@/store/app-store";

export function calcCartItemPrice(item: CartItem) {
  const product = getProductById(item.productId);
  const basePrice = item.customPrice ?? product?.promotionalPrice ?? product?.basePrice ?? 0;
  return basePrice * item.quantity;
}

export function calcSubTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + calcCartItemPrice(item), 0);
}

export function calcDiscount(subtotal: number, coupon: string) {
  return coupon.trim().toUpperCase() === "ALEF20" ? Math.round(subtotal * 0.2) : 0;
}
