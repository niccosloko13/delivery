"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const result = (await response.json().catch(() => null)) as { message?: string } | null;
    setLoading(false);
    if (!response.ok) {
      setError(result?.message || "اسم المستخدم أو كلمة السر غلط");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_right,_rgba(16,61,46,0.18),_transparent_35%),linear-gradient(180deg,_#f5f1e8_0%,_#ede7d9_100%)] px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-[36px] bg-white p-8 shadow-elevated">
        <div className="text-sm font-semibold text-emerald-700">ألف سالاد</div>
        <h1 className="mt-2 text-3xl font-black text-slate-900">تسجيل دخول الإدارة</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">استخدم بيانات التجربة المحلية علشان تدخل لوحة التحكم.</p>
        <div className="mt-6 space-y-4">
          <Field label="اسم المستخدم">
            <input value={username} onChange={(e) => setUsername(e.target.value)} className={inputStyle} autoComplete="username" />
          </Field>
          <Field label="كلمة السر">
            <input value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyle} type="password" autoComplete="current-password" />
          </Field>
        </div>
        {error ? <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f3d2e] px-5 py-4 font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "جاري الدخول..." : "ادخل لوحة التحكم"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-semibold text-slate-700">{label}</div>
      {children}
    </label>
  );
}

const inputStyle = "w-full rounded-2xl border border-slate-200 bg-[#fbfaf6] px-4 py-3 outline-none transition focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10";
