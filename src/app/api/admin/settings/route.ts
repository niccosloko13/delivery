import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { readRestaurantSettings, writeRestaurantSettings } from "@/lib/settings/storage";
import type { RestaurantSettings } from "@/types/settings";
import { assertJsonRequest, assertOrigin } from "@/lib/api-guards";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  const settings = await readRestaurantSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  const originError = assertOrigin(request);
  if (originError) return originError;
  const jsonError = assertJsonRequest(request);
  if (jsonError) return jsonError;
  const body = (await request.json()) as Partial<RestaurantSettings>;
  const current = await readRestaurantSettings();
  const next: RestaurantSettings = {
    ...current,
    ...body,
    paymentMethods: Array.isArray(body.paymentMethods) ? body.paymentMethods : current.paymentMethods,
    wallets: Array.isArray(body.wallets) ? body.wallets : current.wallets,
    zones: Array.isArray(body.zones) ? body.zones : current.zones,
    coupons: Array.isArray(body.coupons) ? body.coupons : current.coupons,
    checkoutMessage: body.checkoutMessage ? { ...current.checkoutMessage, ...body.checkoutMessage } : current.checkoutMessage,
  };
  await writeRestaurantSettings(next);
  return NextResponse.json({ ok: true, settings: next });
}
