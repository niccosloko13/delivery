import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/session";
import { readOrders, writeOrders } from "@/lib/settings/storage";

const bodySchema = z.object({
  status: z.enum(["created", "whatsapp_opened", "customer_marked_as_sent", "restaurant_confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]),
});

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.nextUrl.host) {
    return NextResponse.json({ ok: false, message: "Origin not allowed" }, { status: 403 });
  }
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ ok: false, message: "طلب غير صالح" }, { status: 415 });
  }
  const { id } = await context.params;
  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ ok: false, message: "بيانات غير مكتملة" }, { status: 400 });
  }
  const orders = await readOrders<Array<Record<string, unknown>>>();
  const next = orders.map((order) => (order.id === id ? { ...order, status: body.data.status } : order));
  await writeOrders(next);
  return NextResponse.json({ ok: true });
}
