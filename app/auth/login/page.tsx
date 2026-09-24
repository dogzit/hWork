"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2, Lock, X, KeyRound } from "lucide-react";

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

  // Forgot PIN state
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotName, setForgotName] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNew, setForgotNew] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotEmailHint, setForgotEmailHint] = useState<string | null>(null);
  const [forgotResendCooldown, setForgotResendCooldown] = useState(0);

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) {
      router.push(storedName.toLowerCase() === "admin" ? "/admin" : "/");
    } else {
      setChecking(false);
    }
  }, [router]);

  useEffect(() => {
    if (forgotResendCooldown <= 0) return;
    const t = setTimeout(() => setForgotResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [forgotResendCooldown]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const n = name.trim(),
      p = pin.trim();
    if (!n) return setError("Нэрээ оруулна уу.");
    if (!isValidPin(p)) return setError("PIN 4 эсвэл 6 оронтой байх ёстой.");
    setLoading(true);

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
      localStorage.setItem("name", data.name.toLowerCase());
      toast.success(`Тавтай морил, ${data.name}! ✨`);
      router.push(data.name.toLowerCase() === "admin" ? "/admin" : "/");
    } catch {
      toast.error("Сервертэй холбогдож чадсангүй.");
      setLoading(false);
    }
  }

  // Forgot PIN functions — email OTP based
  const forgotStep1 = async () => {
    if (!forgotName.trim()) {
      toast.error("Нэрээ оруулна уу");
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-pin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ step: 1, name: forgotName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        if (!data.emailHint) {
          toast.error(
            "Энэ нэртэй хэрэглэгч байхгүй эсвэл email бүртгэлгүй байна",
          );
        } else {
          setForgotEmailHint(data.emailHint);
          setForgotResendCooldown(45);
          setForgotStep(2);
          if (data.dev) {
            toast.info("Dev режим: OTP кодыг console-с харна уу");
          } else {
            toast.success(`Код ${data.emailHint} рүү илгээгдэв`);
          }
        }
      } else {
        toast.error(data.error || "Алдаа");
      }
    } catch {
      toast.error("Сервертэй холбогдож чадсангүй");
    }
    setForgotLoading(false);
  };

  const forgotStep2 = async () => {
    if (!/^\d{6}$/.test(forgotCode.trim())) {
      toast.error("Код 6 оронтой байх ёстой");
      return;
    }
    if (!forgotNew || !forgotConfirm) {
      toast.error("Шинэ PIN болон давталтыг оруулна уу");
      return;
    }
    if (forgotNew !== forgotConfirm) {
      toast.error("PIN таарахгүй байна");
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-pin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          step: 2,
          name: forgotName.trim(),
          code: forgotCode.trim(),
          newPin: forgotNew,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("PIN амжилттай сэргээгдлээ! Нэвтэрнэ үү ✨");
        closeForgotPin();
        setName(forgotName.trim());
      } else {
        toast.error(data.error || "Алдаа");
      }
    } catch {
      toast.error("Сервертэй холбогдож чадсангүй");
    }
    setForgotLoading(false);
  };

  const forgotResend = async () => {
    if (forgotResendCooldown > 0) return;
    await forgotStep1();
  };

  const closeForgotPin = () => {
    setShowForgotPin(false);
    setForgotStep(1);
    setForgotName("");
    setForgotCode("");
    setForgotNew("");
    setForgotConfirm("");
    setForgotEmailHint(null);
    setForgotResendCooldown(0);
  };

  if (checking) return null;

  return (
    <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center p-6 font-sans">
      {/* Orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10 dark:opacity-100 opacity-50">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-[160px] opacity-20 animate-pulse" />
        <div
          className="absolute bottom-0 -right-4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[160px] opacity-20 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-700 rounded-full mix-blend-multiply filter blur-[200px] opacity-10" />
      </div>

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-surface-elevated border border-border mb-6 shadow-2xl">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight uppercase italic mb-2">
            Нэвтрэх
          </h1>
          <p className="text-on-surface-muted text-sm">
            Системд нэвтрэхийн тулд мэдээллээ оруулна уу
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-elevated border border-border backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-muted uppercase tracking-widest ml-1">
                Нэр
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                placeholder="Нэрээ оруулна уу"
                className="w-full rounded-2xl bg-surface-elevated border border-border px-5 py-4 text-on-surface
                  placeholder:text-on-surface-muted/50 outline-none
                  focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/30
                  hover:border-border
                  disabled:opacity-50 transition-all duration-200"
              />
            </div>

            {/* PIN */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-muted uppercase tracking-widest ml-1">
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
                className="w-full rounded-2xl bg-surface-elevated border border-border px-5 py-4 text-on-surface
                  placeholder:text-on-surface-muted/50 outline-none tracking-[0.4em]
                  focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/30
                  hover:border-border
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

        {/* Bottom links */}
        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={() => setShowForgotPin(true)}
            className="w-full text-xs font-bold text-violet-400 hover:text-violet-300
              uppercase tracking-widest text-center transition-colors duration-200
              flex items-center justify-center gap-1.5"
          >
            <Lock size={12} />
            PIN мартсан?
          </button>
          <button
            type="button"
            onClick={() => router.push("/auth/signup")}
            className="w-full text-xs font-bold text-gray-600 hover:text-gray-300
              uppercase tracking-widest text-center transition-colors duration-200
              hover:underline underline-offset-4"
          >
            Шинэ бүртгэл үүсгэх үү?
          </button>
        </div>
      </div>

      {/* ── Forgot PIN Modal ── */}
      {showForgotPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-elevated border border-border rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <KeyRound size={16} className="text-accent" /> PIN сэргээх
              </h3>
              <button onClick={closeForgotPin} className="p-1 hover:bg-card-hover rounded-lg transition-all">
                <X size={16} />
              </button>
            </div>

            {forgotStep === 1 ? (
              <div className="space-y-3">
                <p className="text-xs text-on-surface-muted text-center">
                  Нэрээ оруулж шалгана уу
                </p>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-muted uppercase tracking-wider">
                    Таны нэр
                  </label>
                  <input
                    value={forgotName}
                    placeholder="Нэрээ оруулна уу"
                    onChange={(e) => setForgotName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && forgotStep1()}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-on-surface
                      outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                  />
                </div>
                <button
                  onClick={forgotStep1}
                  disabled={forgotLoading || !forgotName.trim()}
                  className="w-full py-3 rounded-2xl bg-accent/20 border border-accent/30 text-accent text-sm font-bold
                    hover:bg-accent/30 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  {forgotLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                  Үргэлжлүүлэх
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {forgotEmailHint && (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-3 py-2 text-[11px] text-emerald-300/80">
                    Код <b className="text-emerald-200">{forgotEmailHint}</b> хаяг руу
                    илгээгдэв
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-muted uppercase tracking-wider">
                    Баталгаажуулах код
                  </label>
                  <input
                    value={forgotCode}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="••••••"
                    onChange={(e) =>
                      setForgotCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-base text-on-surface tracking-[0.4em] text-center font-mono outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                  />
                  <button
                    onClick={forgotResend}
                    disabled={forgotLoading || forgotResendCooldown > 0}
                    className="w-full text-[10px] text-on-surface-muted hover:text-on-surface disabled:opacity-40 pt-1"
                  >
                    {forgotResendCooldown > 0
                      ? `Дахин илгээх (${forgotResendCooldown}с)`
                      : "Дахин илгээх"}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-muted uppercase tracking-wider">
                    Шинэ PIN
                  </label>
                  <input
                    value={forgotNew}
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="••••"
                    onChange={(e) => setForgotNew(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-on-surface tracking-[0.3em]
                      outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-muted uppercase tracking-wider">
                    PIN Давтах
                  </label>
                  <input
                    value={forgotConfirm}
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="••••"
                    onChange={(e) => setForgotConfirm(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={(e) => e.key === "Enter" && forgotStep2()}
                    className={`w-full bg-surface border rounded-xl px-3 py-2.5 text-sm text-on-surface tracking-[0.3em]
                      outline-none transition-all
                      ${forgotConfirm && forgotNew && forgotConfirm !== forgotNew ? "border-red-500/40" : forgotConfirm && forgotNew && forgotConfirm === forgotNew ? "border-emerald-500/40" : "border-border focus:ring-2 focus:ring-accent/30"}`}
                  />
                </div>
                <button
                  onClick={forgotStep2}
                  disabled={forgotLoading || !forgotCode || !forgotNew || !forgotConfirm}
                  className="w-full py-3 rounded-2xl bg-accent/20 border border-accent/30 text-accent text-sm font-bold
                    hover:bg-accent/30 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  {forgotLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                  PIN сэргээх
                </button>
              </div>
            )}

            <button
              onClick={closeForgotPin}
              className="w-full text-xs text-on-surface-muted hover:text-on-surface text-center transition-colors"
            >
              Цуцлах
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
