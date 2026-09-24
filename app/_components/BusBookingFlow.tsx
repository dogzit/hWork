"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail, Shield, CheckCircle2 } from "lucide-react";

interface Seat {
  seatId: string;
  isPremium: boolean;
}

interface Props {
  seat: Seat;
  onClose: () => void;
  onDone: () => void;
}

type Step = "email" | "otp" | "success";

export default function BusBookingFlow({ seat, onClose, onDone }: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/profile");
        if (!r.ok) return;
        const d = await r.json();
        if (cancelled) return;
        if (typeof d.email === "string" && d.email) {
          setSavedEmail(d.email);
          setEmail(d.email);
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const tryBook = async (targetEmail: string) => {
    const res = await fetch("/api/bus/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seatId: seat.seatId, email: targetEmail }),
    });
    const data = await res.json();
    return { res, data };
  };

  const sendOtp = async (targetEmail: string) => {
    const res = await fetch("/api/bus/email/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail }),
    });
    return { res, data: await res.json() };
  };

  const handleEmailSubmit = async () => {
    const target = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
      toast.error("Хүчинтэй email оруулна уу");
      return;
    }
    setLoading(true);
    try {
      const { res, data } = await tryBook(target);
      if (res.ok) {
        setStep("success");
        onDone();
        return;
      }
      if (res.status === 403 && data.error === "EMAIL_NOT_VERIFIED") {
        const send = await sendOtp(target);
        if (send.res.ok) {
          setOtpSent(true);
          setResendCooldown(45);
          setStep("otp");
          if (send.data.dev) {
            toast.info("Dev режим: OTP кодыг server console-с харна уу");
          } else {
            toast.success("OTP кодыг email рүү илгээв");
          }
        } else {
          toast.error(send.data.error || "OTP илгээхэд алдаа");
        }
        return;
      }
      if (res.status === 409) {
        toast.error(data.error || "Энэ суудал захиалагдсан");
        if (data.code !== "ALREADY_BOOKED") onClose();
        return;
      }
      toast.error(data.error || data.message || "Алдаа гарлаа");
    } catch {
      toast.error("Сүлжээний алдаа");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    const target = email.trim().toLowerCase();
    if (!/^\d{6}$/.test(code.trim())) {
      toast.error("Код 6 оронтой байх ёстой");
      return;
    }
    setLoading(true);
    try {
      const verifyRes = await fetch("/api/bus/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: target, code: code.trim() }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        toast.error(verifyData.error || "Код буруу");
        return;
      }
      toast.success("Email баталгаажлаа ✨");
      const { res, data } = await tryBook(target);
      if (res.ok) {
        setStep("success");
        onDone();
      } else {
        toast.error(data.error || data.message || "Захиалга үүсгэхэд алдаа");
      }
    } catch {
      toast.error("Сүлжээний алдаа");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const target = email.trim().toLowerCase();
    setLoading(true);
    try {
      const { res, data } = await sendOtp(target);
      if (res.ok) {
        setResendCooldown(45);
        if (data.dev) {
          toast.info("Dev режим: OTP кодыг server console-с харна уу");
        } else {
          toast.success("Шинэ код илгээв");
        }
      } else {
        toast.error(data.error || "Дахин илгээхэд алдаа");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center pb-4 px-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "sheetUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
      >
        <div className="px-6 pt-7 pb-5 bg-zinc-800/40 border-b border-zinc-800">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-1">
            Суудал {seat.seatId}
          </p>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {step === "email" && "Email оруулна уу"}
            {step === "otp" && "Код баталгаажуулах"}
            {step === "success" && "Амжилттай ✓"}
          </h2>
        </div>

        <div className="px-6 py-6">
          {step === "email" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl p-3">
                <Mail size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-200/80 leading-relaxed">
                  Захиалга батлагдмагц QR код таны email рүү илгээгдэнэ. Автобусанд суух үед
                  админд үзүүлээрэй.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  inputMode="email"
                  autoComplete="email"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                  onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                />
                {savedEmail && savedEmail === email && (
                  <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 ml-1">
                    <CheckCircle2 size={11} /> Баталгаажсан email
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-4 rounded-2xl bg-zinc-800 text-zinc-400 text-xs font-black uppercase tracking-widest disabled:opacity-40"
                >
                  Болих
                </button>
                <button
                  onClick={handleEmailSubmit}
                  disabled={loading || !email}
                  className={`flex-[1.5] py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                    ${loading ? "bg-zinc-700 text-zinc-500" : seat.isPremium ? "bg-yellow-500 text-black" : "bg-blue-600 text-white"}
                    disabled:opacity-40 flex items-center justify-center gap-2`}
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {seat.isPremium ? "Хүсэлт илгээх" : "Захиалах"}
                </button>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-violet-500/5 border border-violet-500/10 rounded-2xl p-3">
                <Shield size={18} className="text-violet-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-violet-200/80 leading-relaxed">
                  <p>
                    <b className="text-white">{email}</b> хаяг руу 6 оронтой код илгээв.
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Ирээгүй бол spam хавтсаа шалгаарай.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Баталгаажуулах код
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  autoFocus
                  autoComplete="one-time-code"
                  placeholder="••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xl text-white outline-none focus:border-violet-500/50 tracking-[0.5em] text-center font-mono"
                  onKeyDown={(e) => e.key === "Enter" && handleOtpSubmit()}
                />
              </div>

              <button
                onClick={handleResend}
                disabled={loading || resendCooldown > 0 || !otpSent}
                className="w-full text-[11px] text-zinc-400 hover:text-white transition disabled:opacity-40 py-1"
              >
                {resendCooldown > 0
                  ? `Дахин илгээх (${resendCooldown}с)`
                  : "Дахин илгээх"}
              </button>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setStep("email")}
                  disabled={loading}
                  className="flex-1 py-4 rounded-2xl bg-zinc-800 text-zinc-400 text-xs font-black uppercase tracking-widest disabled:opacity-40"
                >
                  Буцах
                </button>
                <button
                  onClick={handleOtpSubmit}
                  disabled={loading || code.length !== 6}
                  className="flex-[1.5] py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-violet-600 text-white disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Баталгаажуулах
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 mx-auto flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">Захиалга үүслээ</p>
                <p className="text-zinc-500 text-xs mt-1">
                  QR код <b className="text-white">{email}</b> хаяг руу илгээгдлээ. Автобусанд
                  суух үед админд үзүүлээрэй.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest"
              >
                Хаах
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes sheetUp { from { opacity:0; transform:translateY(100px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
