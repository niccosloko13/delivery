import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { readOrders } from "@/lib/settings/storage";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.nextUrl.host) {
    return NextResponse.json({ ok: false, message: "Origin not allowed" }, { status: 403 });
  }
  const orders = await readOrders<unknown[]>();
  return NextResponse.json(orders);
}
