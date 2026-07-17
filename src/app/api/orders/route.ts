import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readCatalog } from "@/lib/catalog/storage";
import { calculateCatalogOrder } from "@/lib/catalog/pricing";
import { readRestaurantSettings, readOrders, writeOrders } from "@/lib/settings/storage";
import { buildWhatsAppMessage, buildWhatsAppUrl, generateOrderNumber } from "@/lib/orders";
import type { Order, OrderItemSnapshot } from "@/lib/types";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  selectedModifiers: z.array(z.object({ groupId: z.string().min(1), optionIds: z.array(z.string()) })).default([]),
  notes: z.string().optional(),
});

const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    phone: z.string().min(8),
  }),
  address: z.object({
    area: z.string().min(2),
    street: z.string().min(2),
    building: z.string().min(1),
    floor: z.string().optional(),
    apartment: z.string().optional(),
    landmark: z.string().optional(),
    driverNotes: z.string().optional(),
  }),
  items: z.array(orderItemSchema).min(1),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["cash", "card_on_delivery", "instapay", "wallet"]),
  changeFor: z.number().nullable().optional(),
});

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return NextResponse.json({ ok: false, message: "طلب غير صالح" }, { status: 415 });
  const body = createOrderSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ ok: false, message: "بيانات الطلب غير مكتملة" }, { status: 400 });

  const catalog = await readCatalog();
  const settings = await readRestaurantSettings();
  const payload = body.data;

  const orderCalculation = calculateCatalogOrder({ items: payload.items, couponCode: payload.couponCode }, catalog, settings);
  if (orderCalculation.subtotal < settings.minimumOrder) {
    return NextResponse.json({ ok: false, message: `الحد الأدنى للطلب ${settings.minimumOrder} جنيه` }, { status: 400 });
  }

  const existingOrders = await readOrders<Array<{ number?: string }>>();
  const orderNumber = generateOrderNumber(existingOrders.map((order) => order.number || ""));
  const createdAt = new Date().toISOString();

  const items: OrderItemSnapshot[] = orderCalculation.items.map((item, index) => ({
    productId: item.productId,
    nameAr: item.nameAr,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.lineTotal,
    notes: payload.items[index]?.notes,
    modifiers: item.modifiers.map((modifier) => ({
      groupNameAr: modifier.groupNameAr,
      optionNamesAr: modifier.optionNamesAr,
      optionPrice: modifier.optionPrice,
    })),
  }));

  const order: Order = {
    id: orderNumber,
    number: orderNumber,
    createdAt,
    customer: payload.customer,
    address: payload.address,
    items,
    subtotal: orderCalculation.subtotal,
    deliveryFee: orderCalculation.deliveryFee,
    discount: orderCalculation.discount,
    total: orderCalculation.total,
    couponCode: payload.couponCode,
    paymentMethod: payload.paymentMethod,
    changeFor: payload.changeFor ?? null,
    status: "created",
  };

  const message = buildWhatsAppMessage({
    order,
    customer: order.customer,
    address: order.address,
    paymentMethodLabel: settings.paymentMethods.find((item) => item.type === payload.paymentMethod || item.id === payload.paymentMethod)?.nameAr || payload.paymentMethod,
    settings,
    changeFor: order.changeFor,
    couponCode: order.couponCode,
    discountValue: orderCalculation.discount,
    subtotal: orderCalculation.subtotal,
    deliveryFee: orderCalculation.deliveryFee,
    total: orderCalculation.total,
    deliveryTimeLabel: `من ${settings.minDeliveryTime} لـ ${settings.maxDeliveryTime} دقيقة`,
  });
  const whatsappUrl = buildWhatsAppUrl(settings.whatsapp, message);
  await writeOrders([{ ...order, whatsappMessage: message, whatsappUrl }, ...existingOrders] as unknown as Array<Record<string, unknown>>);

  return NextResponse.json({ success: true, orderId: orderNumber, whatsappUrl, status: "created" });
}
