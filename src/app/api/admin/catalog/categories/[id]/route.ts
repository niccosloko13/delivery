import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminRequest, requireJson } from "@/lib/admin/http";
import { readCatalog, writeCatalog } from "@/lib/catalog/storage";
import { upsertCategory } from "@/lib/catalog/admin-actions";
import { categoryHasProducts } from "@/lib/catalog/admin";

const schema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  nameAr: z.string().optional(),
  nameEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  featured: z.boolean().optional(),
  enabled: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  version: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  if (!requireJson(request)) return NextResponse.json({ success: false, message: "يلزم JSON" }, { status: 415 });
  const { id } = await params;
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ success: false, message: "بيانات القسم غير صحيحة" }, { status: 400 });
  const catalog = await readCatalog();
  const current = catalog.categories.find((category) => category.id === id);
  if (!current) return NextResponse.json({ success: false, message: "القسم غير موجود" }, { status: 404 });
  if (categoryHasProducts(catalog, id) && body.data.id && body.data.id !== id) {
    return NextResponse.json({ success: false, message: "القسم فيه منتجات. انقل المنتجات الأول قبل الحذف." }, { status: 409 });
  }
  const category = upsertCategory(catalog, { ...current, ...body.data, id }, id);
  await writeCatalog(catalog);
  return NextResponse.json({ success: true, category });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  const { id } = await params;
  const catalog = await readCatalog();
  if (categoryHasProducts(catalog, id)) return NextResponse.json({ success: false, message: "القسم فيه منتجات. انقل المنتجات الأول قبل الحذف." }, { status: 409 });
  catalog.categories = catalog.categories.filter((category) => category.id !== id);
  await writeCatalog(catalog);
  return NextResponse.json({ success: true });
}
