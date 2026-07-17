import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin/http";
import { readCatalog } from "@/lib/catalog/storage";

export async function GET(request: NextRequest) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  const catalog = await readCatalog();
  return NextResponse.json({ success: true, catalog }, { headers: { "Cache-Control": "no-store" } });
}

