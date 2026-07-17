import type { CatalogData, CatalogProduct } from "@/types/catalog";
import type { RestaurantSettings } from "@/types/settings";

export type OrderItemInput = {
  productId: string;
  quantity: number;
  selectedModifiers: {
    groupId: string;
    optionIds: string[];
  }[];
  notes?: string;
};

export type CalculatedOrderItem = {
  productId: string;
  nameAr: string;
  quantity: number;
  unitBasePrice: number;
  modifierPrice: number;
  unitPrice: number;
  lineTotal: number;
  modifiers: {
    groupId: string;
    groupNameAr: string;
    optionIds: string[];
    optionNamesAr: string[];
    optionPrice: number;
  }[];
};

export type CalculatedCatalogOrder = {
  items: CalculatedOrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
};

function currentProductPrice(product: CatalogProduct) {
  return product.promotionalPrice ?? product.basePrice;
}

function selectedModifierGroups(product: CatalogProduct, catalog: CatalogData) {
  return catalog.modifiers.filter((group) => product.modifierGroupIds.includes(group.id) && group.enabled);
}

export function calculateCatalogOrder(input: { items: OrderItemInput[]; couponCode?: string }, catalog: CatalogData, settings: RestaurantSettings): CalculatedCatalogOrder {
  const items: CalculatedOrderItem[] = [];
  for (const item of input.items) {
    const product = catalog.products.find((entry) => entry.id === item.productId && !entry.deletedAt && entry.available && !entry.soldOut);
    if (!product) continue;
    const groups = selectedModifierGroups(product, catalog);
    let modifierPrice = 0;
    const modifierDetails: CalculatedOrderItem["modifiers"] = [];
    for (const selected of item.selectedModifiers || []) {
      const group = groups.find((entry) => entry.id === selected.groupId);
      if (!group) continue;
      const optionIds = selected.optionIds.filter(Boolean);
      const validOptions = group.options.filter((option) => optionIds.includes(option.id) && option.available !== false);
      const optionPrice = validOptions.reduce((sum, option) => sum + (option.price ?? 0), 0);
      modifierPrice += optionPrice;
      modifierDetails.push({
        groupId: group.id,
        groupNameAr: group.nameAr,
        optionIds,
        optionNamesAr: validOptions.map((option) => option.nameAr),
        optionPrice,
      });
    }
    const unitBasePrice = currentProductPrice(product);
    const unitPrice = unitBasePrice + modifierPrice;
    items.push({
      productId: product.id,
      nameAr: product.nameAr,
      quantity: item.quantity,
      unitBasePrice,
      modifierPrice,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      modifiers: modifierDetails,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discount = input.couponCode?.toUpperCase() === "ALEF20" ? Math.min(Math.round(subtotal * 0.2), 100) : 0;
  const deliveryFee = settings.deliveryFee;
  const total = Math.max(0, subtotal + deliveryFee - discount);
  return { items, subtotal, discount, deliveryFee, total };
}
