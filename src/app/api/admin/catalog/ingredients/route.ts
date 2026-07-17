import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminRequest, requireJson } from "@/lib/admin/http";
import { readCatalog, writeCatalog } from "@/lib/catalog/storage";
import { ingredientSchema } from "@/lib/catalog/validation";
import { upsertIngredient } from "@/lib/catalog/admin-actions";

const schema = ingredientSchema.omit({ id: true }).partial().extend({ id: z.string().optional() });

export async function POST(request: NextRequest) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  if (!requireJson(request)) return NextResponse.json({ success: false, message: "يلزم JSON" }, { status: 415 });
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ success: false, message: "بيانات المكون غير صحيحة" }, { status: 400 });
  const catalog = await readCatalog();
  const ingredient = upsertIngredient(catalog, body.data);
  await writeCatalog(catalog);
  return NextResponse.json({ success: true, ingredient }, { status: 201 });
}

