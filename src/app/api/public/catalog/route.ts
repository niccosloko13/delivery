import { NextResponse } from "next/server";
import { getPublicCatalog } from "@/lib/catalog/public";

export async function GET() {
  const catalog = await getPublicCatalog();
  return NextResponse.json(catalog, { headers: { "Cache-Control": "no-store" } });
}
