import { arEG, type LocaleDict } from "./ar-EG";
import { en } from "./en";

export type LocaleCode = "ar-EG" | "en";

export const localeMessages: Record<LocaleCode, LocaleDict> = {
  "ar-EG": arEG,
  en,
};

export function normalizeLocale(value?: string | null): LocaleCode {
  return value === "en" || value === "en-EG" ? "en" : "ar-EG";
}
