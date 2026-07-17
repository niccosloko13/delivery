import Link from "next/link";
import { ArrowLeft, ChevronLeft, Clock3, ShieldCheck, Sparkles, Truck, Star } from "lucide-react";
import { categories, promos, products, restaurant, reviews } from "@/data/catalog";
import { SiteShell } from "@/components/site-shell";
import { SectionTitle } from "@/components/section-title";
import { ProductCard } from "@/components/product-card";
import { SmartImage } from "@/components/smart-image";
import { Badge } from "@/components/badge";

export default function HomePage() {
  const featured = products.filter((p) => p.featured).slice(0, 8);

  return (
    <SiteShell>
      <section className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="relative overflow-hidden rounded-[38px] bg-[linear-gradient(145deg,#123b2b_0%,#0f2f23_50%,#1f4a35_100%)] p-6 text-white shadow-elevated lg:p-10">
          <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(243,216,107,0.18),transparent_22%)]" />

          <div className="relative flex flex-wrap items-center gap-2 text-sm text-white/80">
            <Badge className="bg-white/12 text-white">Delivery only</Badge>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
              <Clock3 className="h-4 w-4" />
              {restaurant.etaAr}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
              <Truck className="h-4 w-4" />
              {restaurant.deliveryFeeAr}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
              <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
              ٤٫٩
            </span>
          </div>

          <div className="relative mt-6 max-w-2xl">
            <h1 className="font-display text-4xl font-black leading-[1.15] lg:text-6xl">
              سلطتك المفضلة معمولة فريش مخصوص ليك
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-white/86">
              اختار، عدّل، واطلب أكلك الصحي لحد باب البيت من غير وجع دماغ
            </p>
          </div>

          <div className="relative mt-8 flex flex-wrap gap-3">
            <Link href="/menu" className="inline-flex items-center gap-2 rounded-2xl bg-[#f3d86b] px-5 py-3 font-bold text-[#123022] transition hover:brightness-95">
              اطلب دلوقتي <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link href="/product/build-your-salad" className="inline-flex items-center gap-2 rounded-2xl border border-white/22 bg-white/8 px-5 py-3 font-bold text-white transition hover:bg-white/14">
              اعمل سلطتك <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { label: "التوصيل", value: "من ٢٥ لـ ٤٠ دقيقة" },
              { label: "الجودة", value: "مكونات فريش يوميًا" },
              { label: "العرض", value: "خصم ٢٠٪ على أول طلب" },
            ].map((item) => (
              <div key={item.label} className="rounded-[28px] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-sm text-white/68">{item.label}</div>
                <div className="mt-2 font-bold">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[38px] bg-white p-4 shadow-soft">
          <SmartImage
            src="/images/products/unsplash-salad-1.jpg"
            alt="طبق سلطة فريش"
            width={1200}
            height={900}
            priority
            loading="eager"
            sizes="(max-width: 768px) 100vw, 42vw"
            className="h-[440px] w-full rounded-[30px]"
          />

          <div className="absolute inset-x-4 bottom-4 rounded-[28px] bg-white/92 p-4 shadow-elevated">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-slate-500">عرض اليوم</div>
                <div className="font-bold text-[#123022]">خصم {restaurant.couponTextAr}</div>
              </div>
              <div className="rounded-2xl bg-[#123b2b] px-4 py-3 text-white">
                {restaurant.couponCode}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-soft">
        <SectionTitle title="حدد عنوان التوصيل" subtitle="اكتب مكانك عشان نجهز أسرع delivery" />
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="rounded-2xl border border-slate-200 bg-[#fbfaf6] px-4 py-4 text-slate-700">
            <div className="text-sm text-slate-500">العنوان الحالي</div>
            <div className="mt-1 font-semibold">{restaurant.addressAr}</div>
          </div>
          <Link href="/checkout" className="rounded-2xl bg-[#123b2b] px-5 py-4 text-center font-bold text-white shadow-soft">
            ابدأ الطلب
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle title="التصنيفات" subtitle="اختصار سريع يوصلّك للمنيو الصح" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/menu?category=${category.id}`}
              className="rounded-[28px] border border-white/70 bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-elevated"
            >
              <div className="text-3xl">{category.emoji}</div>
              <div className="mt-3 font-bold text-slate-900">{category.nameAr}</div>
              <div className="mt-1 text-sm leading-6 text-slate-600">{category.descriptionAr}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionTitle title="الأكثر طلبًا" subtitle="أكتر الطلبات اللي الناس بترجع لها" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        {promos.slice(0, 2).map((promo, index) => (
          <div
            key={promo.titleAr}
            className={`rounded-[32px] p-6 shadow-soft ${index === 0 ? "bg-[linear-gradient(135deg,#fff9df_0%,#edf4e4_100%)]" : "bg-[linear-gradient(135deg,#eef7ef_0%,#f9f4e8_100%)]"}`}
          >
            <Badge className="bg-[#f3d86b] text-[#123022]">{promo.badgeAr}</Badge>
            <h3 className="mt-4 font-display text-3xl font-bold text-slate-900">{promo.titleAr}</h3>
            <p className="mt-2 max-w-lg leading-7 text-slate-700">{promo.subtitleAr}</p>
            <Link href="/promotions" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#123b2b] px-5 py-3 font-bold text-white">
              {promo.ctaAr}
            </Link>
          </div>
        ))}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[32px] bg-[#123b2b] p-6 text-white shadow-elevated">
          <SectionTitle title="اعمل سلطتك على مزاجك" subtitle="اختيار كامل للحجم والقاعدة والبروتين والصوص" />
          <Link href="/product/build-your-salad" className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-[#123b2b]">
            ابدأ التخصيص <Sparkles className="h-4 w-4" />
          </Link>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {["تتبع السعر فورًا", "معاينة قبل الإضافة", "منع الأخطاء في الاختيارات", "متوافق مع الموبايل"].map((item) => (
              <div key={item} className="rounded-2xl bg-white/10 p-4 text-white/92">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-[32px] bg-white shadow-soft">
          <SmartImage
            src="/images/banners/build-your-salad.svg"
            alt="اعمل سلطتك على مزاجك"
            width={1100}
            height={750}
            sizes="(max-width: 768px) 100vw, 52vw"
            className="h-full w-full"
          />
        </div>
      </section>

      <section className="mt-10">
        <SectionTitle title="آراء العملاء" subtitle="صياغة واقعية لعرض تجاري" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reviews.map((review) => (
            <div key={review.nameAr} className="rounded-[28px] bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900">{review.nameAr}</div>
                <div className="text-sm text-slate-500">{review.date}</div>
              </div>
              <div className="mt-2 text-amber-500">★★★★★</div>
              <p className="mt-3 leading-7 text-slate-700">{review.textAr}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-[32px] bg-white p-6 shadow-soft">
        <SectionTitle title="معلومات التوصيل" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-[#fbfaf6] p-5">
            <div className="text-sm text-slate-500">العنوان</div>
            <div className="mt-2 font-bold">{restaurant.addressAr}</div>
          </div>
          <div className="rounded-3xl bg-[#fbfaf6] p-5">
            <div className="text-sm text-slate-500">التليفون</div>
            <div className="mt-2 font-bold">{restaurant.phone}</div>
          </div>
          <div className="rounded-3xl bg-[#fbfaf6] p-5">
            <div className="text-sm text-slate-500">المواعيد</div>
            <div className="mt-2 font-bold">{restaurant.hoursAr}</div>
          </div>
        </div>
      </section>

      <footer className="mt-10 rounded-[32px] bg-[#123022] p-8 text-white">
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <div className="font-display text-3xl font-bold">ألف سالاد</div>
            <p className="mt-3 leading-7 text-white/80">
              تجربة delivery premium لسلطات صحية، بولز، إضافات، ومشروبات halal في القاهرة الجديدة.
            </p>
          </div>
          <div className="text-white/80">
            <div className="font-bold text-white">اتصل بينا</div>
            <div className="mt-2">{restaurant.phone}</div>
            <div className="mt-1">{restaurant.addressAr}</div>
          </div>
          <div className="text-white/80">
            <div className="font-bold text-white">روابط سريعة</div>
            <div className="mt-2 flex flex-col gap-2">
              <Link href="/menu">المنيو</Link>
              <Link href="/checkout">الـ checkout</Link>
              <Link href="/track">تتبع الطلب</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-sm text-white/60">
          <span>© {new Date().getFullYear()} Alef Salad</span>
          <span>{restaurant.etaAr} • {restaurant.deliveryFeeAr} • الحد الأدنى {restaurant.minOrderAr}</span>
        </div>
      </footer>
    </SiteShell>
  );
}
