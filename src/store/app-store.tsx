"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product, Order, Customer } from "@/lib/types";
import { defaultCatalogData } from "@/lib/catalog/defaults";
import type { CatalogProduct } from "@/types/catalog";

export type CartItem = {
  productId: string;
  nameAr?: string;
  quantity: number;
  unitPrice?: number;
  selectedModifiers?: {
    groupId: string;
    groupNameAr?: string;
    optionIds: string[];
    optionNamesAr?: string[];
    optionPrice?: number;
  }[];
  displaySnapshot?: {
    nameAr: string;
    image: string;
  };
  size?: "عادي" | "كبير";
  base?: string;
  protein?: string[];
  vegetables?: string[];
  sauces?: string[];
  extras?: string[];
  removals?: string[];
  notes?: string;
  customPrice?: number;
};

type State = {
  cart: CartItem[];
  coupon: string;
  user: Customer | null;
  savedOrders: Order[];
  favorites: string[];
  activeOrder: Order | null;
  products: Product[];
};

const STORAGE_KEY = "alef-salad-state-v1";

const defaultState: State = {
  cart: [],
  coupon: "",
  user: null,
  savedOrders: [],
  favorites: [],
  activeOrder: null,
  products: defaultCatalogData.products.map((product) => ({
    id: product.id,
    slug: product.slug,
    nameAr: product.nameAr,
    nameEn: product.nameEn,
    descriptionAr: product.shortDescriptionAr,
    category: product.categoryId as never,
    price: product.promotionalPrice ?? product.basePrice,
    oldPrice: product.oldPrice,
    image: product.images[0]?.path || "/images/products/product-fallback.jpg",
    calories: product.calories || 0,
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 0,
    ingredients: product.ingredients.map((ingredient) => ingredient.nameAr),
    tags: product.tags as never,
    modifiers: [],
    available: product.available && !product.soldOut && !product.deletedAt,
    featured: product.featured,
  })),
};

type ContextValue = State & {
  addToCart: (item: CartItem) => void;
  updateCartItem: (index: number, patch: Partial<CartItem>) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  setCoupon: (coupon: string) => void;
  setUser: (user: State["user"]) => void;
  toggleFavorite: (productId: string) => void;
  createOrder: (order: Order) => void;
  setActiveOrder: (order: Order | null) => void;
};

const AppStoreContext = createContext<ContextValue | null>(null);

function loadState(): State {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch {
    return defaultState;
  }
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(() => loadState());

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    let mounted = true;
    void fetch("/api/public/catalog", { cache: "no-store" })
      .then((response) => response.json())
      .then((catalog: { products?: CatalogProduct[] }) => {
        const nextProducts = Array.isArray(catalog.products) ? catalog.products : [];
        if (!mounted || nextProducts.length === 0) return;
        setState((prev) => ({
          ...prev,
          products: nextProducts.map((product) => ({
            id: product.id,
            slug: product.slug,
            nameAr: product.nameAr,
            nameEn: product.nameEn,
            descriptionAr: product.shortDescriptionAr,
            category: product.categoryId as never,
            price: product.promotionalPrice ?? product.basePrice,
            oldPrice: product.oldPrice,
            image: product.images[0]?.path || "/images/products/product-fallback.jpg",
            calories: product.calories || 0,
            rating: product.rating || 0,
            reviewCount: product.reviewCount || 0,
            ingredients: product.ingredients.map((ingredient) => ingredient.nameAr),
            tags: product.tags as never,
            modifiers: [],
            available: product.available && !product.soldOut && !product.deletedAt,
            featured: product.featured,
          })),
        }));
      })
      .catch(() => null);
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<ContextValue>(() => ({
    ...state,
    addToCart: (item) =>
      setState((prev) => {
        const existingIndex = prev.cart.findIndex((cartItem) => cartItem.productId === item.productId && JSON.stringify(cartItem) === JSON.stringify(item));
        if (existingIndex >= 0) {
          const cart = [...prev.cart];
          cart[existingIndex] = { ...cart[existingIndex], quantity: cart[existingIndex].quantity + item.quantity };
          return { ...prev, cart };
        }
        return { ...prev, cart: [...prev.cart, item] };
      }),
    updateCartItem: (index, patch) =>
      setState((prev) => ({
        ...prev,
        cart: prev.cart.map((item, i) => (i === index ? { ...item, ...patch } : item)),
      })),
    removeFromCart: (index) =>
      setState((prev) => ({ ...prev, cart: prev.cart.filter((_, i) => i !== index) })),
    clearCart: () => setState((prev) => ({ ...prev, cart: [], coupon: "" })),
    setCoupon: (coupon) => setState((prev) => ({ ...prev, coupon })),
    setUser: (user) => setState((prev) => ({ ...prev, user })),
    toggleFavorite: (productId) =>
      setState((prev) => ({
        ...prev,
        favorites: prev.favorites.includes(productId)
          ? prev.favorites.filter((id) => id !== productId)
          : [...prev.favorites, productId],
      })),
    createOrder: (order) =>
      setState((prev) => ({
        ...prev,
        activeOrder: order,
        savedOrders: [order, ...prev.savedOrders].slice(0, 20),
      })),
    setActiveOrder: (order) => setState((prev) => ({ ...prev, activeOrder: order })),
  }), [state]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) throw new Error("useAppStore must be used within AppStoreProvider");
  return context;
}

export function getProductById(productId: string) {
  return defaultCatalogData.products.find((item) => item.id === productId);
}
