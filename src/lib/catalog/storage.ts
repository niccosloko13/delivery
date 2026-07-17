import "server-only";

import fs from "node:fs/promises";
import { defaultCatalogData } from "./defaults";
import { CATALOG_PATH, atomicWriteJson, ensureCatalogDir, normalizeCatalog, safeReadJson } from "./helpers";
import { catalogSchema } from "./validation";
import type { CatalogData } from "@/types/catalog";

let queue: Promise<unknown> = Promise.resolve();

export async function readCatalog(): Promise<CatalogData> {
  await ensureCatalogDir();
  const raw = await safeReadJson<unknown>(CATALOG_PATH, defaultCatalogData);
  const parsed = catalogSchema.safeParse(raw);
  if (parsed.success) return normalizeCatalog(parsed.data);
  const fallback = normalizeCatalog(defaultCatalogData);
  await atomicWriteJson(CATALOG_PATH, fallback);
  return fallback;
}

export async function writeCatalog(catalog: CatalogData) {
  const parsed = catalogSchema.parse(catalog);
  const normalized = normalizeCatalog(parsed);
  queue = queue.then(async () => {
    await atomicWriteJson(CATALOG_PATH, normalized);
  });
  await queue;
}

export async function refreshCatalogFile() {
  const catalog = await readCatalog();
  await writeCatalog(catalog);
}

export async function readCatalogRawText() {
  await ensureCatalogDir();
  try {
    return await fs.readFile(CATALOG_PATH, "utf8");
  } catch {
    return JSON.stringify(defaultCatalogData, null, 2);
  }
}

export function catalogVersionKey(catalog: CatalogData) {
  return `${catalog.products.length}-${catalog.categories.length}-${catalog.modifiers.length}-${catalog.ingredients.length}`;
}
