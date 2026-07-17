"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { products as catalog } from "@/data/catalog";

export type CartItem = {
  productId: string;
  quantity: number;
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

export type OrderStatus =
  | "الطلب اتأكد"
  | "المطعم بيجهز الطلب"
  | "الطلب خرج للتوصيل"
  | "الطلب وصل";

export type Order = {
  id: string;
  number: string;
  createdAt: string;
  status: OrderStatus;
  items: CartItem[];
  total: number;
  addressLabel: string;
  phone: string;
  paymentMethod: string;
};

type State = {
  cart: CartItem[];
  coupon: string;
  user: { name: string; phone: string; email?: string } | null;
  savedOrders: Order[];
  favorites: string[];
  activeOrder: Order | null;
};

const STORAGE_KEY = "alef-salad-state-v1";

const defaultState: State = {
  cart: [],
  coupon: "",
  user: null,
  savedOrders: [],
  favorites: [],
  activeOrder: null,
};

type ContextValue = State & {
  products: Product[];
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

  const value = useMemo<ContextValue>(() => ({
    ...state,
    products: catalog,
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
  return catalog.find((item) => item.id === productId);
}
