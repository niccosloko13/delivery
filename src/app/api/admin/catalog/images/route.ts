import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";
import { requireAdminRequest } from "@/lib/admin/http";
import { readCatalog, writeCatalog } from "@/lib/catalog/storage";
import { uniqueId, now, UPLOAD_DIR } from "@/lib/catalog/helpers";

const MAX_SIZE = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  const formData = await request.formData();
  const file = formData.get("file");
  const productId = String(formData.get("productId") || "");
  if (!(file instanceof File)) return NextResponse.json({ success: false, message: "ملف الصورة غير موجود" }, { status: 400 });
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return NextResponse.json({ success: false, message: "نوع الصورة غير مدعوم" }, { status: 415 });
  if (file.size > MAX_SIZE) return NextResponse.json({ success: false, message: "الصورة كبيرة جدًا" }, { status: 413 });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const outputName = `${path.parse(file.name).name.replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}-${uniqueId("img").slice(-6)}.webp`;
  const outputPath = path.join(UPLOAD_DIR, outputName);
  const image = sharp(buffer);
  const meta = await image.metadata();
  if (!meta.width || !meta.height) return NextResponse.json({ success: false, message: "الصورة تالفة" }, { status: 400 });
  await image.resize(1200, 900, { fit: "cover" }).webp({ quality: 84 }).toFile(outputPath);
  const publicPath = `/uploads/products/${outputName}`;
  const catalog = await readCatalog();
  const record = {
    id: uniqueId("img"),
    path: publicPath,
    originalName: file.name,
    source: "upload" as const,
    width: 1200,
    height: 900,
    mimeType: "image/webp",
    size: (await fs.stat(outputPath)).size,
    createdAt: now(),
  };
  catalog.images.unshift(record);
  if (productId) {
    const product = catalog.products.find((item) => item.id === productId);
    if (product) {
      product.images.unshift({ id: record.id, path: publicPath, alt: product.nameAr, width: 1200, height: 900, source: "upload" });
      if (!product.primaryImageId) product.primaryImageId = record.id;
      product.updatedAt = now();
    }
  }
  await writeCatalog(catalog);
  return NextResponse.json({ success: true, image: record, path: publicPath }, { status: 201 });
}

