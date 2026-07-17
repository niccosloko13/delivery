import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminRequest, requireJson } from "@/lib/admin/http";
import { readCatalog, writeCatalog } from "@/lib/catalog/storage";
import { categorySchema } from "@/lib/catalog/validation";
import { reorderCategories, upsertCategory } from "@/lib/catalog/admin-actions";

const schema = categorySchema.omit({ id: true }).partial().extend({ id: z.string().optional() });

export async function POST(request: NextRequest) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  if (!requireJson(request)) return NextResponse.json({ success: false, message: "يلزم JSON" }, { status: 415 });
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ success: false, message: "بيانات القسم غير صحيحة" }, { status: 400 });
  const catalog = await readCatalog();
  const category = upsertCategory(catalog, body.data);
  await writeCatalog(catalog);
  return NextResponse.json({ success: true, category }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  const payload = z.object({ ids: z.array(z.string().min(1)) }).safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ success: false, message: "بيانات الترتيب غير صحيحة" }, { status: 400 });
  const catalog = await readCatalog();
  reorderCategories(catalog, payload.data.ids);
  await writeCatalog(catalog);
  return NextResponse.json({ success: true });
}

