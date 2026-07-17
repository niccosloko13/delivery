"use client";

import { useMemo, useState } from "react";
import { Plus, Minus, ShoppingCart, Check, Share2 } from "lucide-react";
import type { CatalogData, CatalogProduct } from "@/types/catalog";
import { useAppStore } from "@/store/app-store";
import { formatEGP } from "@/lib/utils";
import { hapticSuccess, shareText } from "@/lib/native/capacitor";

export function ProductPurchase({ product, catalog }: { product: CatalogProduct; catalog: CatalogData }) {
  const { addToCart } = useAppStore();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});

  const modifierGroups = useMemo(() => catalog.modifiers.filter((group) => product.modifierGroupIds.includes(group.id) && group.enabled), [catalog.modifiers, product.modifierGroupIds]);
  const modifierTotal = useMemo(() => {
    return modifierGroups.reduce((sum, group) => {
      const selectedIds = selectedModifiers[group.id] || [];
      return sum + group.options.filter((option) => selectedIds.includes(option.id) && option.available !== false).reduce((acc, option) => acc + (option.price ?? 0), 0);
    }, 0);
  }, [modifierGroups, selectedModifiers]);
  const unitPrice = (product.promotionalPrice ?? product.basePrice) + modifierTotal;

  function toggleOption(groupId: string, optionId: string, single = false) {
    setSelectedModifiers((prev) => {
      const current = prev[groupId] || [];
      if (single) {
        return { ...prev, [groupId]: [optionId] };
      }
      return {
        ...prev,
        [groupId]: current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId],
      };
    });
  }

  return (
    <div className="rounded-[32px] bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">{product.nameAr}</h1>
        <div className="text-2xl font-black text-[#0f3d2e]">{formatEGP(unitPrice)}</div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-slate-600">{product.shortDescriptionAr}</p>
        <button
          type="button"
          onClick={async () => {
            const url = typeof window !== "undefined" ? window.location.href : `/product/${product.slug}`;
            await shareText(product.nameAr, product.shortDescriptionAr, url);
          }}
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#0f3d2e] hover:text-[#0f3d2e]"
        >
          <Share2 className="h-4 w-4" />
          شارك المنتج
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {modifierGroups.map((group) => (
          <div key={group.id} className="rounded-3xl bg-slate-50 p-4">
            <div className="font-bold">{group.nameAr}</div>
            <div className="mt-3 grid gap-2">
              {group.options.map((option) => {
                const selected = (selectedModifiers[group.id] || []).includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleOption(group.id, option.id, group.type === "single")}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-right ${selected ? "border-[#0f3d2e] bg-emerald-50" : "border-slate-200 bg-white"}`}
                  >
                    <span>{option.nameAr}</span>
                    <span className="text-sm font-semibold text-slate-500">{option.price ? `+${formatEGP(option.price)}` : "0"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-3xl bg-slate-50 p-4">
        <div className="font-bold">عندك ملاحظة على الطلب؟</div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-3 min-h-28 w-full rounded-2xl border bg-white p-4 outline-none" placeholder="مثلاً: من غير بصل، الصوص على الجنب" />
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid h-12 w-12 place-items-center rounded-2xl border bg-white"><Minus className="h-4 w-4" /></button>
        <div className="min-w-12 text-center text-lg font-bold">{quantity}</div>
        <button type="button" onClick={() => setQuantity((value) => value + 1)} className="grid h-12 w-12 place-items-center rounded-2xl border bg-white"><Plus className="h-4 w-4" /></button>
        <button
          type="button"
          onClick={() => {
            const selected: { groupId: string; groupNameAr?: string; optionIds: string[]; optionNamesAr?: string[]; optionPrice?: number }[] = modifierGroups.map((group) => {
              const optionIds = selectedModifiers[group.id] || [];
              const options = group.options.filter((option) => optionIds.includes(option.id));
              return {
                groupId: group.id,
                groupNameAr: group.nameAr,
                optionIds,
                optionNamesAr: options.map((option) => option.nameAr),
                optionPrice: options.reduce((sum, option) => sum + (option.price ?? 0), 0),
              };
            });
            addToCart({
              productId: product.id,
              quantity,
              notes,
              unitPrice,
              selectedModifiers: selected,
              displaySnapshot: { nameAr: product.nameAr, image: product.images[0]?.path || "/images/products/product-fallback.jpg" },
            });
            void hapticSuccess();
            setAdded(true);
            setTimeout(() => setAdded(false), 1800);
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0f3d2e] px-5 py-3 font-bold text-white"
        >
          {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
          {added ? "اتضافت" : "أضف للسلة"} {formatEGP(unitPrice * quantity)}
        </button>
      </div>
    </div>
  );
}
