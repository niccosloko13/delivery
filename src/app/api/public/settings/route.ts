import { NextResponse } from "next/server";
import { readRestaurantSettings } from "@/lib/settings/storage";
import type { PublicRestaurantSettings } from "@/types/settings";

export async function GET() {
  const settings = await readRestaurantSettings();
  const publicSettings: PublicRestaurantSettings = {
    nameAr: settings.nameAr,
    nameEn: settings.nameEn,
    description: settings.description,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    address: settings.address,
    area: settings.area,
    city: settings.city,
    openTime: settings.openTime,
    closeTime: settings.closeTime,
    minDeliveryTime: settings.minDeliveryTime,
    maxDeliveryTime: settings.maxDeliveryTime,
    currency: settings.currency,
    minimumOrder: settings.minimumOrder,
    deliveryFee: settings.deliveryFee,
    status: settings.status,
    acceptScheduledOrders: settings.acceptScheduledOrders,
    closedMessage: settings.closedMessage,
    paymentMethods: settings.paymentMethods.filter((method) => method.enabled).map((method) => ({ ...method, config: {} })),
    wallets: settings.wallets.filter((wallet) => wallet.enabled).map((wallet) => ({ ...wallet })),
    zones: settings.zones.filter((zone) => zone.enabled),
    coupons: settings.coupons.filter((coupon) => coupon.active),
    checkoutMessage: {
      ...settings.checkoutMessage,
      body: settings.checkoutMessage.body,
    },
  };
  return NextResponse.json(publicSettings);
}
