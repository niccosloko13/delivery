"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatEGP } from "@/lib/utils";

const sizes = [{ nameAr: "عادي", price: 0 }, { nameAr: "كبير", price: 35 }];
const bases = ["خس آيسبرج", "خس روماني", "جرجير", "سبانخ", "رز بني", "كينوا", "مكرونة"];
const proteins = ["فراخ مشوية", "فراخ كرسبي", "تونة", "جمبري", "سالمون", "روست بيف", "بيض", "فلافل", "جبنة حلومي"];
const vegetables = ["خيار", "طماطم", "طماطم شيري", "ذرة", "جزر", "بنجر", "فلفل ألوان", "بروكلي", "بصل أحمر", "مشروم", "زيتون", "أفوكادو"];
const sauces = ["سيزر", "رانش", "هاني مسترد", "طحينة بالليمون", "دبس رمان", "زيت زيتون وليمون", "بالساميك", "سويت تشيلي", "زبادي بالأعشاب"];
const extras = ["جبنة فيتا", "بارميزان", "مكسرات", "كروتون", "بذور", "بروتين زيادة", "أفوكادو زيادة"];

export function SaladBuilder() {
  const { addToCart } = useAppStore();
  const [size, setSize] = useState(sizes[0]);
  const [base, setBase] = useState<string | null>(null);
  const [selectedProteins, setSelectedProteins] = useState<string[]>([]);
  const [selectedVeg, setSelectedVeg] = useState<string[]>([]);
  const [selectedSauces, setSelectedSauces] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const price = useMemo(() => 120 + size.price + selectedProteins.length * 25 + selectedExtras.length * 12, [size, selectedProteins, selectedExtras]);

  const toggle = (value: string, list: string[], setList: (items: string[]) => void, max?: number) => {
    if (list.includes(value)) return setList(list.filter((item) => item !== value));
    if (max && list.length >= max) return;
    setList([...list, value]);
  };

  return (
    <div className="rounded-[32px] bg-white p-6 shadow-soft">
      <h2 className="font-display text-3xl font-bold">اعمل سلطتك على مزاجك</h2>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <Block title="1. الحجم">
            <div className="grid grid-cols-2 gap-3">
              {sizes.map((item) => (
                <button key={item.nameAr} type="button" onClick={() => setSize(item)} className={`rounded-2xl border px-4 py-3 ${size.nameAr === item.nameAr ? "border-[#0f3d2e] bg-emerald-50" : ""}`}>{item.nameAr}</button>
              ))}
            </div>
          </Block>
          <Block title="2. القاعدة" required>
            <ChoiceGrid items={bases} selected={base ? [base] : []} onToggle={(value) => setBase(value)} single />
          </Block>
          <Block title="3. البروتين" required>
            <ChoiceGrid items={proteins} selected={selectedProteins} onToggle={(value) => toggle(value, selectedProteins, setSelectedProteins, 3)} />
          </Block>
          <Block title="4. الخضار">
            <ChoiceGrid items={vegetables} selected={selectedVeg} onToggle={(value) => toggle(value, selectedVeg, setSelectedVeg, 6)} />
          </Block>
          <Block title="5. الصوص" required>
            <ChoiceGrid items={sauces} selected={selectedSauces} onToggle={(value) => toggle(value, selectedSauces, setSelectedSauces, 2)} />
          </Block>
          <Block title="6. الإضافات">
            <ChoiceGrid items={extras} selected={selectedExtras} onToggle={(value) => toggle(value, selectedExtras, setSelectedExtras, 4)} />
          </Block>
        </div>
        <div className="space-y-4">
          <div className="rounded-[28px] bg-slate-50 p-5">
            <div className="font-bold">معاينة الطلب</div>
            <div className="mt-4 rounded-[26px] bg-white p-4">
              <div className="text-sm text-slate-500">الحجم</div>
              <div className="font-bold">{size.nameAr}</div>
              <div className="mt-3 text-sm text-slate-500">القاعدة</div>
              <div className="font-bold">{base || "اختار القاعدة"}</div>
              <div className="mt-3 text-sm text-slate-500">البروتين</div>
              <div className="font-bold">{selectedProteins.join("، ") || "اختار بروتين"}</div>
              <div className="mt-3 text-sm text-slate-500">الخضار</div>
              <div className="font-bold">{selectedVeg.join("، ") || "مفيش"}</div>
              <div className="mt-3 text-sm text-slate-500">الصوص</div>
              <div className="font-bold">{selectedSauces.join("، ") || "اختار صوص"}</div>
              <div className="mt-3 text-sm text-slate-500">الإضافات</div>
              <div className="font-bold">{selectedExtras.join("، ") || "مفيش"}</div>
            </div>
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-24 w-full rounded-3xl border p-4" placeholder="ملاحظات إضافية..." />
          <div className="rounded-[28px] bg-[#0f3d2e] p-5 text-white">
            <div className="text-sm text-white/75">السعر الحالي</div>
            <div className="mt-1 text-3xl font-black">{formatEGP(price)}</div>
            <button
              type="button"
              disabled={!base || !selectedProteins.length || !selectedSauces.length}
              onClick={() => addToCart({ productId: "build-salad", quantity: 1, size: size.nameAr as "عادي" | "كبير", base: base || undefined, protein: selectedProteins, vegetables: selectedVeg, sauces: selectedSauces, extras: selectedExtras, notes, customPrice: price })}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-[#0f3d2e] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> أضف للسلة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Block({ title, children, required }: { title: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="rounded-[28px] bg-slate-50 p-4">
      <div className="mb-3 font-bold">
        {title} {required ? <span className="text-rose-500">*</span> : null}
      </div>
      {children}
    </div>
  );
}

function ChoiceGrid({ items, selected, onToggle, single = false }: { items: string[]; selected: string[]; onToggle: (value: string) => void; single?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
      {items.map((item) => (
        <button key={item} type="button" onClick={() => onToggle(item)} className={`rounded-2xl border px-3 py-3 text-right text-sm ${selected.includes(item) ? "border-[#0f3d2e] bg-emerald-50" : "bg-white"}`}>
          {single ? item : item}
        </button>
      ))}
    </div>
  );
}
