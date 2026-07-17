"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";
import { Keyboard } from "@capacitor/keyboard";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { hapticError } from "@/lib/native/capacitor";

export function NativeAppBridge() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const setup = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#0f3d2e" });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch {
        // ignore status bar setup errors
      }

      try {
        await SplashScreen.hide();
      } catch {
        // ignore splash hide errors
      }
    };

    void setup();

    const cleanup: Array<() => Promise<void> | void> = [];

    App.addListener("backButton", async () => {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      const shouldExit = window.confirm("عايز تقفل التطبيق؟");
      if (!shouldExit) return;
      try {
        await App.exitApp();
      } catch {
        // ignore
      }
    }).then((handle) => cleanup.push(() => handle.remove()));

    Keyboard.addListener("keyboardWillShow", () => {
      document.documentElement.classList.add("keyboard-visible");
    }).then((handle) => cleanup.push(() => handle.remove()));

    Keyboard.addListener("keyboardWillHide", () => {
      document.documentElement.classList.remove("keyboard-visible");
    }).then((handle) => cleanup.push(() => handle.remove()));

    App.addListener("appStateChange", (event) => {
      document.documentElement.dataset.appState = event.isActive ? "active" : "background";
    }).then((handle) => cleanup.push(() => handle.remove()));

    App.addListener("pause", () => {
      document.documentElement.dataset.appState = "background";
    }).then((handle) => cleanup.push(() => handle.remove()));

    App.addListener("resume", () => {
      document.documentElement.dataset.appState = "active";
    }).then((handle) => cleanup.push(() => handle.remove()));

    App.addListener("appUrlOpen", (event) => {
      const url = new URL(event.url);
      if (url.hostname === "wa.me" || url.hostname === "api.whatsapp.com" || url.hostname === "web.whatsapp.com") {
        void hapticError();
      }
    }).then((handle) => cleanup.push(() => handle.remove()));

    return () => {
      void Promise.all(cleanup.map((fn) => Promise.resolve(fn())));
    };
  }, []);

  return null;
}
