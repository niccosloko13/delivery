import { NextRequest, NextResponse } from "next/server";
import { readCatalog } from "@/lib/catalog/storage";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await readCatalog();
  const product = catalog.products.find((item) => !item.deletedAt && (item.slug === slug || item.slugAliases?.includes(slug)));
  if (!product) return NextResponse.json({ success: false, message: "المنتج غير موجود" }, { status: 404 });
  return NextResponse.json({ success: true, product }, { headers: { "Cache-Control": "no-store" } });
}

