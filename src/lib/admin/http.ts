import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";

function allowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.nextUrl.origin;
  return origin === host;
}

export async function requireAdminRequest(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "يحتاج تسجيل دخول" }, { status: 401 });
  }
  if (!allowedOrigin(request)) {
    return NextResponse.json({ success: false, message: "الطلب مرفوض" }, { status: 403 });
  }
  return null;
}

export function requireJson(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  return contentType.includes("application/json");
}

