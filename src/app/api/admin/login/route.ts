import { NextRequest, NextResponse } from "next/server";
import { createAdminSessionCookie } from "@/lib/admin/session";

const attempts = new Map<string, { count: number; resetAt: number }>();

function envValue(name: "ADMIN_USERNAME" | "ADMIN_PASSWORD" | "ADMIN_SESSION_SECRET") {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ ok: false, message: "طلب غير صالح" }, { status: 415 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  const entry = attempts.get(ip);
  const now = Date.now();
  if (entry && entry.resetAt > now && entry.count >= 5) {
    return NextResponse.json({ ok: false, message: "محاولات كتير. استنى شوية وجرب تاني" }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { username?: string; password?: string } | null;
  const username = body?.username?.trim() ?? "";
  const password = body?.password?.trim() ?? "";
  const expectedUser = envValue("ADMIN_USERNAME");
  const expectedPass = envValue("ADMIN_PASSWORD");
  const expectedSecret = envValue("ADMIN_SESSION_SECRET");

  if (!expectedUser || !expectedPass || !expectedSecret) {
    return NextResponse.json(
      {
        ok: false,
        message: "في مشكلة في إعدادات السيرفر. تواصل مع الدعم",
        missing: {
          adminUsernameConfigured: Boolean(expectedUser),
          adminPasswordConfigured: Boolean(expectedPass),
          adminSessionSecretConfigured: Boolean(expectedSecret),
        },
      },
      { status: 500 },
    );
  }

  if (username !== expectedUser || password !== expectedPass) {
    attempts.set(ip, { count: (entry?.count || 0) + 1, resetAt: now + 1000 * 60 * 5 });
    return NextResponse.json({ ok: false, message: "اسم المستخدم أو كلمة السر غلط" }, { status: 401 });
  }

  attempts.delete(ip);
  await createAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
