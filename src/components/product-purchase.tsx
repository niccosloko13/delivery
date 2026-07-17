"use client";

import { useMemo, useState } from "react";
import { Plus, Minus, ShoppingCart, Check } from "lucide-react";
import { Product } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { formatEGP } from "@/lib/utils";

export function ProductPurchase({ product }: { product: Product }) {
  const { addToCart } = useAppStore();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);
  const customPrice = useMemo(() => product.price * quantity, [product.price, quantity]);
  return (
    <div className="rounded-[32px] bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">{product.nameAr}</h1>
        <div className="text-2xl font-black text-[#0f3d2e]">{formatEGP(product.price)}</div>
      </div>
      <p className="mt-3 text-slate-600">{product.descriptionAr}</p>
      <div className="mt-5">
        <div className="font-bold">المكونات</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.ingredients.map((x) => <span key={x} className="rounded-full bg-slate-100 px-3 py-1 text-sm">{x}</span>)}
        </div>
      </div>
      <div className="mt-5">
        <div className="font-bold">السعرات</div>
        <div className="mt-1 text-slate-600">{product.calories} كالوري تقريبًا</div>
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
            addToCart({ productId: product.id, quantity, notes, customPrice: product.price });
            setAdded(true);
            setTimeout(() => setAdded(false), 1800);
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0f3d2e] px-5 py-3 font-bold text-white"
        >
          {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
          {added ? "اتضافت" : "أضف للسلة"} {formatEGP(customPrice)}
        </button>
      </div>
    </div>
  );
}

