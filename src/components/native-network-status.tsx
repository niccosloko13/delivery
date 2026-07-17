"use client";

import { useEffect, useState } from "react";
import { Network } from "@capacitor/network";
import { WifiOff, Wifi } from "lucide-react";

type NetworkState = {
  connected: boolean;
  connectionType: string;
};

export function NativeNetworkStatus() {
  const [state, setState] = useState<NetworkState | null>(null);

  useEffect(() => {
    let listenerCleanup: (() => void) | undefined;
    let mounted = true;

    const sync = async () => {
      try {
        const current = await Network.getStatus();
        if (mounted) {
          setState({ connected: current.connected, connectionType: current.connectionType });
        }
      } catch {
        if (mounted) setState({ connected: navigator.onLine, connectionType: "unknown" });
      }
    };

    void sync();

    Network.addListener("networkStatusChange", (status) => {
      setState({ connected: status.connected, connectionType: status.connectionType });
    })
      .then((handle) => {
        listenerCleanup = () => handle.remove().catch(() => undefined);
      })
      .catch(() => undefined);

    const onOnline = () => setState((prev) => ({ connected: true, connectionType: prev?.connectionType || "unknown" }));
    const onOffline = () => setState((prev) => ({ connected: false, connectionType: prev?.connectionType || "unknown" }));
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      mounted = false;
      listenerCleanup?.();
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (state?.connected ?? true) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 top-3 z-[60] mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-right text-sm font-semibold text-amber-950 shadow-elevated">
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span>أنت أوفلاين دلوقتي</span>
      </div>
      <div className="mt-1 text-amber-900/80">محتاج إنترنت علشان تكمل الطلب</div>
    </div>
  );
}

export function NativeOnlineToast({ connected }: { connected: boolean }) {
  if (connected) {
    return (
      <div className="fixed inset-x-3 top-3 z-[60] mx-auto max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-right text-sm font-semibold text-emerald-950 shadow-elevated">
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4" />
          <span>رجعنا أونلاين</span>
        </div>
      </div>
    );
  }

  return null;
}
