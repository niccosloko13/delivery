"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { RestaurantSettings } from "@/types/settings";
import { defaultRestaurantSettings } from "@/lib/settings/defaults";

const SettingsContext = createContext<RestaurantSettings>(defaultRestaurantSettings);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<RestaurantSettings>(defaultRestaurantSettings);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/settings")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.settings) setSettings(data.settings);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useRestaurantSettings() {
  return useContext(SettingsContext);
}

