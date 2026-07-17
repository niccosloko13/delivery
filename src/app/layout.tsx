import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { AppStoreProvider } from "@/store/app-store";
import { SettingsProvider } from "@/components/settings-provider";
import { PwaRegister } from "@/components/pwa-register";
import { NativeAppBridge } from "@/components/native-app-bridge";
import { NativeNetworkStatus } from "@/components/native-network-status";

const cairo = Cairo({
  variable: "--font-sans-ar",
  subsets: ["arabic", "latin"],
});

const tajawal = Tajawal({
  variable: "--font-display-ar",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "ألف سالاد | Alef Salad",
  description: "تجربة delivery premium لسلطات وبولات صحية في القاهرة الجديدة",
  manifest: "/manifest.webmanifest",
  icons: [
    { rel: "icon", url: "/icons/favicon.png" },
    { rel: "apple-touch-icon", url: "/icons/apple-touch-icon.png" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      data-scroll-behavior="smooth"
      className={`${cairo.variable} ${tajawal.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f5f1e8] text-slate-900">
        <PwaRegister />
        <NativeAppBridge />
        <NativeNetworkStatus />
        <AppStoreProvider>
          <SettingsProvider>{children}</SettingsProvider>
        </AppStoreProvider>
      </body>
    </html>
  );
}
