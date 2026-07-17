import Link from "next/link";
import { Heart, Flame, Star, Plus, Tag } from "lucide-react";
import { Product } from "@/lib/types";
import { Badge } from "./badge";
import { SmartImage } from "./smart-image";
import { formatEGP } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  return (
    <article className="group overflow-hidden rounded-[30px] border border-white/80 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-elevated">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden">
          <SmartImage
            src={product.image}
            alt={product.nameAr}
            width={1200}
            height={900}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="h-56 w-full transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
            <div className="flex flex-wrap gap-2">
              {product.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} className="bg-white/95 text-[#123b2b] shadow-sm">
                  {tag}
                </Badge>
              ))}
            </div>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/95 text-rose-500 shadow-sm transition hover:scale-105"
              aria-label={`إضافة ${product.nameAr} للمفضلة`}
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-[17px] font-bold text-slate-900">{product.nameAr}</h3>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{product.descriptionAr}</p>
          </div>
          <div className="shrink-0 text-left">
            <div className="text-xl font-black tracking-tight text-[#123b2b]">{formatEGP(product.price)}</div>
            {product.oldPrice ? <div className="text-xs text-slate-400 line-through">{formatEGP(product.oldPrice)}</div> : null}
            {discount ? <div className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">-{discount}%</div> : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {product.rating}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            {product.calories} كالوري
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
            <Tag className="h-3.5 w-3.5 text-emerald-700" />
            {product.reviewCount} تقييم
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/product/${product.slug}`}
            className="flex-1 rounded-2xl bg-[#123b2b] px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-[#0e2e22]"
          >
            أضف للسلة
          </Link>
          <Link
            href={`/product/${product.slug}`}
            className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-[#123b2b] hover:text-[#123b2b]"
            aria-label={`افتح ${product.nameAr}`}
          >
            <Plus className="h-4 w-4" />
          </Link>
        </div>

        {!product.available ? (
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-500">
            غير متاح حاليًا
          </div>
        ) : null}
      </div>
    </article>
  );
}
