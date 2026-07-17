import type { MetadataRoute } from "next";

const screenshotBase = [
  {
    src: "/screenshots/home-wide.png",
    sizes: "1600x1200",
    type: "image/png",
    form_factor: "wide" as const,
    label: "لقطة للواجهة الرئيسية على الديسكتوب",
  },
  {
    src: "/screenshots/home-narrow.png",
    sizes: "750x1334",
    type: "image/png",
    form_factor: "narrow" as const,
    label: "لقطة للواجهة الرئيسية على الموبايل",
  },
];

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ألف سالاد | Alef Salad",
    short_name: "ألف سالاد",
    description: "تجربة دليفري صحية وسريعة بواجهة عربية RTL لمطعم ألف سالاد.",
    lang: "ar-EG",
    dir: "rtl",
    display: "standalone",
    orientation: "portrait-primary",
    theme_color: "#0f3d2e",
    background_color: "#f7f3e8",
    start_url: "/",
    scope: "/",
    categories: ["food", "lifestyle", "health"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    screenshots: screenshotBase,
    shortcuts: [
      {
        name: "المنيو",
        short_name: "المنيو",
        description: "افتح المنيو وشوف كل المنتجات",
        url: "/menu",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "السلة",
        short_name: "السلة",
        description: "راجع الطلب بسرعة",
        url: "/cart",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "طلباتي",
        short_name: "طلباتي",
        description: "تابع الطلبات السابقة",
        url: "/account/orders",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
  };
}
