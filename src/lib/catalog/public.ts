import { readCatalog } from "./storage";

export async function getPublicCatalog() {
  return readCatalog();
}
