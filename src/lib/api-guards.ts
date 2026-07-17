import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";

export function assertJsonRequest(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ ok: false, message: "طلب غير صالح" }, { status: 415 });
  }
  return null;
}

export function assertOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const url = new URL(origin);
  const host = request.nextUrl.host;
  if (url.host !== host) {
    return NextResponse.json({ ok: false, message: "Origin not allowed" }, { status: 403 });
  }
  return null;
}

export async function requireAdminApi(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const originError = assertOrigin(request);
  if (originError) return originError;
  return null;
}
