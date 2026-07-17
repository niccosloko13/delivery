import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminRequest, requireJson } from "@/lib/admin/http";
import { readCatalog, writeCatalog } from "@/lib/catalog/storage";
import { upsertProduct } from "@/lib/catalog/admin-actions";
import { productSchema } from "@/lib/catalog/validation";
import { now } from "@/lib/catalog/helpers";

const updateSchema = productSchema
  .omit({ createdAt: true, updatedAt: true })
  .partial()
  .extend({ version: z.string().optional() });

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  const { id } = await params;
  const catalog = await readCatalog();
  const product = catalog.products.find((item) => item.id === id);
  if (!product) return NextResponse.json({ success: false, message: "المنتج غير موجود" }, { status: 404 });
  return NextResponse.json({ success: true, product });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  if (!requireJson(request)) return NextResponse.json({ success: false, message: "يلزم JSON" }, { status: 415 });
  const { id } = await params;
  const payload = updateSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ success: false, message: "بيانات المنتج غير صحيحة" }, { status: 400 });
  const catalog = await readCatalog();
  const existing = catalog.products.find((item) => item.id === id);
  if (!existing) return NextResponse.json({ success: false, message: "المنتج غير موجود" }, { status: 404 });
  if (payload.data.version && payload.data.version !== existing.updatedAt) {
    return NextResponse.json({ success: false, message: "المنتج اتعدل من مكان تاني. حدّث الصفحة وجرب تاني." }, { status: 409 });
  }
  upsertProduct(catalog, { ...existing, ...payload.data, id, updatedAt: now() }, id);
  await writeCatalog(catalog);
  return NextResponse.json({ success: true, product: catalog.products.find((item) => item.id === id) });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  const { id } = await params;
  const catalog = await readCatalog();
  const existing = catalog.products.find((item) => item.id === id);
  if (!existing) return NextResponse.json({ success: false, message: "المنتج غير موجود" }, { status: 404 });
  existing.deletedAt = now();
  existing.updatedAt = now();
  await writeCatalog(catalog);
  return NextResponse.json({ success: true });
}
