import type { CartItem } from "@/store/app-store";
import type { Order } from "@/lib/types";
import type { RestaurantSettings } from "@/types/settings";
import { formatEGP } from "@/lib/utils";

export type AddressData = {
  area: string;
  street: string;
  building: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
  driverNotes?: string;
};

export type CustomerData = {
  name: string;
  phone: string;
};

export function calculateCartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + (item.unitPrice ?? item.customPrice ?? 0) * item.quantity, 0);
}

export function calculateDiscount(subtotal: number, coupon: string) {
  if (coupon.trim().toUpperCase() !== "ALEF20") return 0;
  return Math.min(Math.round(subtotal * 0.2), 100);
}

export function generateOrderNumber(existingNumbers: string[] = []) {
  let number = "";
  do {
    number = `AS-${Math.floor(100000 + Math.random() * 900000)}`;
  } while (existingNumbers.includes(number));
  return number;
}

function formatDateCairo(date = new Date()) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeZone: "Africa/Cairo",
  }).format(date);
}

function formatTimeCairo(date = new Date()) {
  return new Intl.DateTimeFormat("ar-EG", {
    timeStyle: "short",
    timeZone: "Africa/Cairo",
  }).format(date);
}

function formatOrderItem(item: {
  quantity: number;
  nameAr: string;
  size?: string;
  base?: string;
  protein?: string[];
  vegetables?: string[];
  extras?: string[];
  removals?: string[];
  sauces?: string[];
  notes?: string;
  unitPrice: number;
  modifiers?: { groupNameAr: string; optionNamesAr: string[]; optionPrice?: number }[];
}) {
  const lines = [`${item.quantity}× ${item.nameAr}`];
  if (item.size) lines.push(`الحجم: ${item.size}`);
  if (item.base) lines.push(`القاعدة: ${item.base}`);
  if (item.protein?.length) lines.push(`البروتين: ${item.protein.join("، ")}`);
  if (item.vegetables?.length) lines.push(`الخضار: ${item.vegetables.join("، ")}`);
  if (item.extras?.length) lines.push(`الإضافات: ${item.extras.join("، ")}`);
  if (item.removals?.length) lines.push(`من غير: ${item.removals.join("، ")}`);
  if (item.sauces?.length) lines.push(`الصوص: ${item.sauces.join("، ")}`);
  if (item.modifiers?.length) {
    item.modifiers.forEach((modifier) => {
      if (modifier.optionNamesAr.length) lines.push(`${modifier.groupNameAr}: ${modifier.optionNamesAr.join("، ")}`);
    });
  }
  if (item.notes) lines.push(`ملاحظات: ${item.notes}`);
  lines.push(`سعر الوحدة: ${formatEGP(item.unitPrice)}`);
  lines.push(`إجمالي الصنف: ${formatEGP(item.unitPrice * item.quantity)}`);
  return lines.join("\n");
}

function renderTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? "");
}

function paymentDetailsText(params: { settings: RestaurantSettings; paymentMethod: string; changeFor?: number | null }) {
  const method = params.settings.paymentMethods.find((item) => item.type === params.paymentMethod || item.id === params.paymentMethod || item.nameAr === params.paymentMethod);
  const lines: string[] = [];
  if (method?.instructions) lines.push(method.instructions);
  if (params.changeFor && params.paymentMethod === "cash") lines.push(`محتاج فكة من ${formatEGP(params.changeFor)}`);
  if (method?.type === "instapay") {
    const ipa = String(method.config.ipa || "");
    const beneficiaryName = String(method.config.beneficiaryName || "");
    if (beneficiaryName) lines.push(`اسم المستفيد: ${beneficiaryName}`);
    if (ipa) lines.push(`IPA: ${ipa}`);
  }
  return lines.join("\n");
}

export function buildWhatsAppMessage(params: {
  order: Order;
  customer: CustomerData;
  address: AddressData;
  paymentMethodLabel: string;
  settings: RestaurantSettings;
  changeFor?: number | null;
  couponCode?: string;
  discountValue: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryTimeLabel?: string;
  locationUrl?: string;
  notes?: string;
}) {
  const { order, customer, address, paymentMethodLabel, settings, changeFor, couponCode, discountValue, subtotal, deliveryFee, total, deliveryTimeLabel, locationUrl, notes } = params;
  const values = {
    restaurantName: settings.nameAr,
    orderNumber: order.number,
    date: formatDateCairo(new Date(order.createdAt)),
    time: formatTimeCairo(new Date(order.createdAt)),
    customerName: customer.name,
    customerPhone: customer.phone,
    address: [
      `المنطقة: ${address.area}`,
      `الشارع: ${address.street}`,
      `رقم العمارة: ${address.building}`,
      address.floor ? `الدور: ${address.floor}` : "",
      address.apartment ? `الشقة: ${address.apartment}` : "",
      address.landmark ? `علامة مميزة: ${address.landmark}` : "",
      address.driverNotes ? `ملاحظات للسواق: ${address.driverNotes}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    locationUrl: locationUrl || "",
    items: order.items
      .map((item) =>
        formatOrderItem({
          quantity: item.quantity,
          nameAr: item.nameAr,
          size: item.size,
          base: item.base,
          protein: item.protein,
          vegetables: item.vegetables,
          extras: item.extras,
          removals: item.removals,
          sauces: item.sauces,
          notes: item.notes,
          unitPrice: item.unitPrice,
          modifiers: item.modifiers,
        }),
      )
      .join("\n\n"),
    subtotal: formatEGP(subtotal),
    deliveryFee: formatEGP(deliveryFee),
    discount: formatEGP(discountValue),
    total: formatEGP(total),
    paymentMethod: paymentMethodLabel,
    paymentDetails: paymentDetailsText({ settings, paymentMethod: paymentMethodLabel, changeFor }),
    deliveryTime: deliveryTimeLabel || "من أسرع وقت",
    notes: notes || address.driverNotes || "-",
    couponCode: couponCode || "",
  };

  return renderTemplate(settings.checkoutMessage.body || "", values);
}

export function buildWhatsAppUrl(whatsapp: string, message: string) {
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
}
