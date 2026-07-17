import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin/http";
import { readCatalog, writeCatalog } from "@/lib/catalog/storage";
import { duplicateProductInCatalog } from "@/lib/catalog/admin-actions";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  const { id } = await params;
  const catalog = await readCatalog();
  const copy = duplicateProductInCatalog(catalog, id);
  if (!copy) return NextResponse.json({ success: false, message: "المنتج غير موجود" }, { status: 404 });
  await writeCatalog(catalog);
  return NextResponse.json({ success: true, product: copy }, { status: 201 });
}

