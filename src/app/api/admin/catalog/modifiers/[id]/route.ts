import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { requireAdminRequest, requireJson } from "@/lib/admin/http";
import { readCatalog, writeCatalog } from "@/lib/catalog/storage";
import { upsertModifierGroup } from "@/lib/catalog/admin-actions";

const schema = z.object({
  id: z.string().optional(),
  nameAr: z.string().optional(),
  nameEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  type: z.enum(["single", "multiple", "quantity", "removal"]).optional(),
  required: z.boolean().optional(),
  minSelections: z.number().int().nonnegative().optional(),
  maxSelections: z.number().int().positive().optional(),
  options: z.array(z.object({
    id: z.string().optional(),
    nameAr: z.string(),
    nameEn: z.string().optional(),
    price: z.number().int().nonnegative().optional(),
    available: z.boolean().optional(),
    image: z.string().optional(),
  })).optional(),
  enabled: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  productIds: z.array(z.string()).optional(),
  version: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  if (!requireJson(request)) return NextResponse.json({ success: false, message: "يلزم JSON" }, { status: 415 });
  const { id } = await params;
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ success: false, message: "بيانات الإضافات غير صحيحة" }, { status: 400 });
  const catalog = await readCatalog();
  const existing = catalog.modifiers.find((modifier) => modifier.id === id);
  if (!existing) return NextResponse.json({ success: false, message: "المجموعة غير موجودة" }, { status: 404 });
  const modifier = upsertModifierGroup(
    catalog,
    {
      ...existing,
      ...body.data,
      id,
      options: body.data.options?.map((option) => ({
        id: option.id || crypto.randomUUID(),
        nameAr: option.nameAr,
        nameEn: option.nameEn,
        price: option.price,
        available: option.available,
        image: option.image,
      })),
    },
    id,
  );
  await writeCatalog(catalog);
  return NextResponse.json({ success: true, modifier });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  const { id } = await params;
  const catalog = await readCatalog();
  catalog.modifiers = catalog.modifiers.filter((modifier) => modifier.id !== id);
  catalog.products = catalog.products.map((product) => ({ ...product, modifierGroupIds: product.modifierGroupIds.filter((modifierId) => modifierId !== id), updatedAt: new Date().toISOString() }));
  await writeCatalog(catalog);
  return NextResponse.json({ success: true });
}
