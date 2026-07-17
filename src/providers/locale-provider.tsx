"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { LocaleCode } from "@/i18n";
import { normalizeLocale } from "@/i18n";

type LocaleContextValue = {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  dir: "rtl" | "ltr";
};

const STORAGE_KEY = "alef-salad-locale";
const LocaleContext = createContext<LocaleContextValue>({
  locale: "ar-EG",
  setLocale: () => undefined,
  dir: "rtl",
});

function applyLocale(locale: LocaleCode) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale === "en" ? "en" : "ar-EG";
  document.documentElement.dir = locale === "en" ? "ltr" : "rtl";
  document.cookie = `${STORAGE_KEY}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(() => {
    if (typeof window === "undefined") return "ar-EG";
    return normalizeLocale(window.localStorage.getItem(STORAGE_KEY));
  });

  useEffect(() => {
    applyLocale(locale);
  }, [locale]);

  const setLocale = (next: LocaleCode) => {
    setLocaleState(next);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, next);
    applyLocale(next);
  };

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      dir: locale === "en" ? "ltr" : "rtl",
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}
