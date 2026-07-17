import { NextRequest, NextResponse } from "next/server";
import { createAdminSessionCookie } from "@/lib/admin/session";

const attempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ ok: false, message: "طلب غير صالح" }, { status: 415 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  const entry = attempts.get(ip);
  const now = Date.now();
  if (entry && entry.resetAt > now && entry.count >= 5) {
    return NextResponse.json({ ok: false, message: "جرب بعد شوية" }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { username?: string; password?: string } | null;
  const username = body?.username?.trim() ?? "";
  const password = body?.password ?? "";
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass) {
    return NextResponse.json({ ok: false, message: "Admin credentials are not configured" }, { status: 500 });
  }

  if (username !== expectedUser || password !== expectedPass) {
    attempts.set(ip, { count: (entry?.count || 0) + 1, resetAt: now + 1000 * 60 * 5 });
    return NextResponse.json({ ok: false, message: "اسم المستخدم أو كلمة السر غلط" }, { status: 401 });
  }

  attempts.delete(ip);
  await createAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
