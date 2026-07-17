import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminRequest, requireJson } from "@/lib/admin/http";
import { readCatalog, writeCatalog } from "@/lib/catalog/storage";
import { upsertIngredient } from "@/lib/catalog/admin-actions";

const schema = z.object({
  id: z.string().optional(),
  nameAr: z.string().optional(),
  image: z.string().optional(),
  extraPrice: z.number().int().nonnegative().optional(),
  calories: z.number().int().nonnegative().optional(),
  allergens: z.array(z.string()).optional(),
  available: z.boolean().optional(),
  removable: z.boolean().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  if (!requireJson(request)) return NextResponse.json({ success: false, message: "يلزم JSON" }, { status: 415 });
  const { id } = await params;
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ success: false, message: "بيانات المكون غير صحيحة" }, { status: 400 });
  const catalog = await readCatalog();
  const existing = catalog.ingredients.find((ingredient) => ingredient.id === id);
  if (!existing) return NextResponse.json({ success: false, message: "المكون غير موجود" }, { status: 404 });
  const ingredient = upsertIngredient(catalog, { ...existing, ...body.data, id }, id);
  await writeCatalog(catalog);
  return NextResponse.json({ success: true, ingredient });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  const { id } = await params;
  const catalog = await readCatalog();
  catalog.ingredients = catalog.ingredients.filter((ingredient) => ingredient.id !== id);
  await writeCatalog(catalog);
  return NextResponse.json({ success: true });
}

