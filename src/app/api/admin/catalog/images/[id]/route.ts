import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { requireAdminRequest } from "@/lib/admin/http";
import { readCatalog, writeCatalog } from "@/lib/catalog/storage";
import { CATALOG_DIR } from "@/lib/catalog/helpers";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  const { id } = await params;
  const catalog = await readCatalog();
  const image = catalog.images.find((item) => item.id === id);
  if (!image) return NextResponse.json({ success: false, message: "الصورة غير موجودة" }, { status: 404 });
  const usedBy = catalog.products.filter((product) => product.images.some((entry) => entry.id === id || entry.path === image.path)).map((product) => product.nameAr);
  if (usedBy.length) {
    return NextResponse.json({ success: false, message: "الصورة مستخدمة في منتجات أخرى", usedBy }, { status: 409 });
  }
  catalog.images = catalog.images.filter((item) => item.id !== id);
  await writeCatalog(catalog);
  try {
    await fs.unlink(path.join(CATALOG_DIR, image.path.replace(/^\//, "")));
  } catch {}
  return NextResponse.json({ success: true });
}

