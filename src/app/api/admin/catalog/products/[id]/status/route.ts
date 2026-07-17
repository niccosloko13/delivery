import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminRequest, requireJson } from "@/lib/admin/http";
import { readCatalog, writeCatalog } from "@/lib/catalog/storage";
import { now } from "@/lib/catalog/helpers";

const schema = z.object({
  available: z.boolean().optional(),
  soldOut: z.boolean().optional(),
  featured: z.boolean().optional(),
  bestSeller: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  if (!requireJson(request)) return NextResponse.json({ success: false, message: "يلزم JSON" }, { status: 415 });
  const { id } = await params;
  const payload = schema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ success: false, message: "بيانات غير صحيحة" }, { status: 400 });
  const catalog = await readCatalog();
  const product = catalog.products.find((item) => item.id === id);
  if (!product) return NextResponse.json({ success: false, message: "المنتج غير موجود" }, { status: 404 });
  Object.assign(product, payload.data, { updatedAt: now() });
  await writeCatalog(catalog);
  return NextResponse.json({ success: true, product });
}

