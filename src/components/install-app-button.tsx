"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isIosSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) && /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function InstallAppButton({ className }: { className?: string }) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isStandalone());
  const [showIosHint, setShowIosHint] = useState(() => isIosSafari() && !isStandalone());
  const [status, setStatus] = useState<"idle" | "installing" | "done">("idle");

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
      setStatus("done");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) {
    return (
      <div className={cn("fixed bottom-24 left-4 z-40 inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm lg:static lg:bottom-auto lg:left-auto lg:z-auto", className)}>
        <Sparkles className="h-4 w-4" />
        التطبيق متثبت
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={async () => {
          if (promptEvent) {
            setStatus("installing");
            await promptEvent.prompt();
            const choice = await promptEvent.userChoice;
            setStatus(choice.outcome === "accepted" ? "done" : "idle");
            setPromptEvent(null);
            return;
          }
          setShowIosHint(true);
        }}
        className={cn(
          "inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm font-bold text-[#123022] shadow-sm transition hover:-translate-y-0.5 hover:shadow-elevated",
          "fixed bottom-24 left-4 z-40 lg:static lg:bottom-auto lg:left-auto lg:z-auto",
        )}
      >
        {status === "installing" ? <Download className="h-4 w-4 animate-bounce" /> : <Smartphone className="h-4 w-4" />}
        ثبّت التطبيق
      </button>

      {showIosHint ? (
        <div className="fixed bottom-[5.75rem] left-4 z-40 max-w-xs rounded-2xl border border-white/80 bg-[#123022] p-4 text-right text-sm text-white shadow-elevated lg:bottom-auto lg:left-auto lg:top-full lg:mt-3 lg:w-80">
          <div className="font-bold">على الآيفون</div>
          <div className="mt-1 text-white/85">افتح المشاركة من Safari وبعدين اختار &quot;Add to Home Screen&quot;.</div>
        </div>
      ) : null}
    </div>
  );
}
