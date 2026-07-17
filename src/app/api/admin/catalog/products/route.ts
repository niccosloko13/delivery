import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminRequest, requireJson } from "@/lib/admin/http";
import { readCatalog, writeCatalog } from "@/lib/catalog/storage";
import { reorderProducts, upsertProduct } from "@/lib/catalog/admin-actions";
import { productSchema } from "@/lib/catalog/validation";
import { now, uniqueId } from "@/lib/catalog/helpers";

const productInputSchema = productSchema
  .omit({ createdAt: true, updatedAt: true })
  .partial()
  .extend({
    version: z.string().optional(),
  });

export async function GET(request: NextRequest) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  const catalog = await readCatalog();
  return NextResponse.json({ success: true, products: catalog.products });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  if (!requireJson(request)) return NextResponse.json({ success: false, message: "يلزم JSON" }, { status: 415 });
  const payload = productInputSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ success: false, message: "بيانات المنتج غير صحيحة" }, { status: 400 });
  const catalog = await readCatalog();
  const product = upsertProduct(catalog, { ...payload.data, id: uniqueId("prd"), createdAt: now(), updatedAt: now() });
  await writeCatalog(catalog);
  return NextResponse.json({ success: true, product }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  if (!requireJson(request)) return NextResponse.json({ success: false, message: "يلزم JSON" }, { status: 415 });
  const schema = z.object({ ids: z.array(z.string().min(1)) });
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ success: false, message: "بيانات الترتيب غير صحيحة" }, { status: 400 });
  const catalog = await readCatalog();
  reorderProducts(catalog, body.data.ids);
  await writeCatalog(catalog);
  return NextResponse.json({ success: true });
}
