import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.alefsalad.delivery",
  appName: "Alef Salad",
  webDir: "dist-capacitor",
  server: {
    url: "https://delivery-theta-pink.vercel.app",
    cleartext: false,
    allowNavigation: ["delivery-theta-pink.vercel.app", "wa.me", "api.whatsapp.com", "web.whatsapp.com"],
  },
  android: {
    path: "android",
    resolveServiceWorkerRequests: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#f7f3e8",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      androidScaleType: "CENTER_CROP",
    },
    StatusBar: {
      backgroundColor: "#0f3d2e",
      style: "DARK",
    },
  },
};

export default config;
