import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin/http";
import { readCatalog, writeCatalog } from "@/lib/catalog/storage";
import { now } from "@/lib/catalog/helpers";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  const { id } = await params;
  const catalog = await readCatalog();
  const product = catalog.products.find((item) => item.id === id);
  if (!product) return NextResponse.json({ success: false, message: "المنتج غير موجود" }, { status: 404 });
  product.deletedAt = undefined;
  product.available = true;
  product.updatedAt = now();
  await writeCatalog(catalog);
  return NextResponse.json({ success: true, product });
}

