"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function isValidPin(pin: string) {
  return /^\d{4}$/.test(pin) || /^\d{6}$/.test(pin);
}
function digitsOnly(v: string) {
  return v.replace(/\D/g, "").slice(0, 6);
}

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) {
      router.push(storedName.toLowerCase() === "admin" ? "/admin" : "/");
    } else {
      setChecking(false);
    }
  }, [router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const n = name.trim(),
      p = pin.trim();
    if (!n) return setError("Нэрээ оруулна уу.");
    if (!isValidPin(p)) return setError("PIN 4 эсвэл 6 оронтой байх ёстой.");
    setLoading(true);

    if (n.toLowerCase() === "admin" && p === "6200") {
      localStorage.setItem("name", "Admin");
      toast.success("Админ системд тавтай морил! 👑");
      router.push("/admin");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: n, number: p }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Нэвтрэхэд алдаа гарлаа.");
        toast.error(data?.error ?? "Алдаа гарлаа.");
        setLoading(false);
        return;
      }
      localStorage.setItem("name", data.name);
      toast.success(`Тавтай морил, ${data.name}! ✨`);
      router.push("/");
    } catch {
      toast.error("Сервертэй холбогдож чадсангүй.");
      setLoading(false);
    }
  }

  if (checking) return null;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 font-sans">
      {/* Orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-[160px] opacity-20 animate-pulse" />
        <div
          className="absolute bottom-0 -right-4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[160px] opacity-20 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-700 rounded-full mix-blend-multiply filter blur-[200px] opacity-10" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white/5 border border-white/10 mb-6 shadow-2xl">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase italic mb-2">
            Нэвтрэх
          </h1>
          <p className="text-gray-500 text-sm">
            Системд нэвтрэхийн тулд мэдээллээ оруулна уу
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Нэр
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                placeholder="Нэрээ оруулна уу"
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white
                  placeholder:text-gray-700 outline-none
                  focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/30
                  hover:bg-white/[0.07] hover:border-white/20
                  disabled:opacity-50 transition-all duration-200"
              />
            </div>

            {/* PIN */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                PIN Код
              </label>
              <input
                value={pin}
                type="password"
                inputMode="numeric"
                onChange={(e) => setPin(digitsOnly(e.target.value))}
                disabled={loading}
                placeholder="••••"
                maxLength={6}
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white
                  placeholder:text-gray-700 outline-none tracking-[0.4em]
                  focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/30
                  hover:bg-white/[0.07] hover:border-white/20
                  disabled:opacity-50 transition-all duration-200"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-xs font-bold text-red-400 text-center">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600
                py-4 font-black text-white uppercase tracking-widest
                hover:from-violet-500 hover:to-indigo-500
                hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-900/40
                active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-900/30"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Нэвтрэх"
              )}
            </button>
          </form>
        </div>

        {/* Signup link */}
        <button
          type="button"
          onClick={() => router.push("/auth/signup")}
          className="w-full mt-5 text-xs font-bold text-gray-600 hover:text-gray-300
            uppercase tracking-widest text-center transition-colors duration-200
            hover:underline underline-offset-4"
        >
          Шинэ бүртгэл үүсгэх үү?
        </button>
      </div>
    </div>
  );
}
