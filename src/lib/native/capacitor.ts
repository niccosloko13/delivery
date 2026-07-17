import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { Device } from "@capacitor/device";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Share } from "@capacitor/share";

export function isNativePlatform() {
  return Capacitor.isNativePlatform();
}

export async function getNativeDeviceSummary() {
  if (!isNativePlatform()) return null;
  return Device.getInfo();
}

export async function openExternalUrl(url: string) {
  if (isNativePlatform()) {
    await Browser.open({ url });
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function shareText(title: string, text: string, url?: string) {
  if (isNativePlatform()) {
    try {
      await Share.share({ title, text, url });
      return true;
    } catch {
      return false;
    }
  }

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

export async function hapticTap() {
  if (!isNativePlatform()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // ignore
  }
}

export async function hapticSuccess() {
  if (!isNativePlatform()) return;
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    // ignore
  }
}

export async function hapticError() {
  if (!isNativePlatform()) return;
  try {
    await Haptics.notification({ type: NotificationType.Error });
  } catch {
    // ignore
  }
}
