"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  ScanLine,
  Keyboard,
  User as UserIcon,
  Camera,
} from "lucide-react";

interface UserInfo {
  name: string;
  fullName: string | null;
  avatar: string | null;
  phone: string | null;
}

interface BookingInfo {
  seatId: string;
  userName: string;
  status: string;
  email?: string;
  boardedAt?: string | null;
  user: UserInfo;
}

type ResultState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "preview"; booking: BookingInfo }
  | { kind: "already"; booking: BookingInfo }
  | { kind: "confirmed"; booking: BookingInfo }
  | { kind: "pending"; booking: BookingInfo; message: string }
  | { kind: "error"; message: string };

export default function AdminVerifyPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [manualToken, setManualToken] = useState("");
  const [result, setResult] = useState<ResultState>({ kind: "idle" });
  const [scannerReady, setScannerReady] = useState(false);

  const scannerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrRef = useRef<any>(null);
  const lastScannedRef = useRef<{ token: string; at: number } | null>(null);

  const stopScanner = useCallback(async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
        await html5QrRef.current.clear();
      } catch {}
      html5QrRef.current = null;
    }
    setScannerReady(false);
  }, []);

  const handleToken = useCallback(async (token: string, confirmNow = false) => {
    setResult({ kind: "loading" });
    try {
      const res = await fetch("/api/bus/verify-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrToken: token, confirm: confirmNow }),
      });
      const data = await res.json();

      if (res.status === 404) {
        setResult({ kind: "error", message: data.message || "Хүчинтэй QR олдсонгүй" });
        return;
      }
      if (res.status === 409 && data.error === "PENDING") {
        setResult({
          kind: "pending",
          booking: data.booking,
          message: data.message || "VIP хүсэлт батлагдаагүй байна",
        });
        return;
      }
      if (!res.ok) {
        setResult({ kind: "error", message: data.error || "Алдаа гарлаа" });
        return;
      }

      if (data.alreadyBoarded) {
        setResult({ kind: "already", booking: data.booking });
      } else if (data.confirmed) {
        setResult({ kind: "confirmed", booking: data.booking });
      } else if (data.preview) {
        setResult({ kind: "preview", booking: data.booking });
      }
    } catch {
      setResult({ kind: "error", message: "Сүлжээний алдаа" });
    }
  }, []);

  const startScanner = useCallback(async () => {
    if (!scannerRef.current || html5QrRef.current) return;
    try {
      const mod = await import("html5-qrcode");
      const Scanner = mod.Html5Qrcode;
      const inst = new Scanner("qr-region");
      html5QrRef.current = inst;

      await inst.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded: string) => {
          const now = Date.now();
          const last = lastScannedRef.current;
          if (last && last.token === decoded && now - last.at < 2500) return;
          lastScannedRef.current = { token: decoded, at: now };
          handleToken(decoded.trim(), false);
        },
        () => {},
      );
      setScannerReady(true);
    } catch (e) {
      console.error(e);
      toast.error("Камер асаахад алдаа гарлаа. Гараар оруулна уу.");
      setMode("manual");
    }
  }, [handleToken]);

  useEffect(() => {
    if (mode === "scan") {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [mode, startScanner, stopScanner]);

  const submitManual = () => {
    const t = manualToken.trim();
    if (!t) {
      toast.error("Токен оруулна уу");
      return;
    }
    handleToken(t, false);
  };

  const confirmBoarding = () => {
    if (result.kind !== "preview") return;
    const token = manualToken.trim() || lastScannedRef.current?.token;
    if (!token) return;
    handleToken(token, true);
  };

  const resetResult = () => {
    setResult({ kind: "idle" });
    setManualToken("");
    lastScannedRef.current = null;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pb-24">
      <Toaster theme="dark" />

      <div className="max-w-md mx-auto px-6 pt-10">
        <button
          onClick={() => router.push("/admin")}
          className="text-zinc-500 hover:text-blue-400 flex items-center gap-1 text-sm font-bold mb-6"
        >
          <ChevronLeft size={16} /> Буцах
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tighter italic">QR VERIFY</h1>
          <p className="text-[10px] tracking-[0.3em] uppercase text-zinc-500 font-bold">
            Boarding checker
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1.5 rounded-2xl mb-6 border border-zinc-800">
          <button
            onClick={() => setMode("scan")}
            className={`py-2.5 rounded-xl text-[11px] font-black uppercase flex items-center justify-center gap-2 transition ${
              mode === "scan" ? "bg-blue-600 text-white" : "text-zinc-500"
            }`}
          >
            <Camera size={14} /> Сканнер
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`py-2.5 rounded-xl text-[11px] font-black uppercase flex items-center justify-center gap-2 transition ${
              mode === "manual" ? "bg-blue-600 text-white" : "text-zinc-500"
            }`}
          >
            <Keyboard size={14} /> Гараар
          </button>
        </div>

        {mode === "scan" ? (
          <div className="relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 aspect-square mb-4">
            <div id="qr-region" ref={scannerRef} className="w-full h-full" />
            {!scannerReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-500">
                <ScanLine size={40} className="animate-pulse" />
                <p className="text-xs uppercase tracking-widest font-bold">Камер асаж байна...</p>
              </div>
            )}
            <div className="absolute inset-8 border-2 border-blue-500/40 rounded-2xl pointer-events-none" />
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-5 mb-4 space-y-3">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              QR токен
            </label>
            <input
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="QR-ээс уншсан токен..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500/50"
              onKeyDown={(e) => e.key === "Enter" && submitManual()}
            />
            <button
              onClick={submitManual}
              className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition"
            >
              Шалгах
            </button>
          </div>
        )}

        {/* Result panel */}
        {result.kind !== "idle" && (
          <div className="mt-4">
            {result.kind === "loading" && (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-center text-zinc-500 text-sm">
                Шалгаж байна...
              </div>
            )}

            {result.kind === "error" && (
              <ResultCard
                tone="error"
                icon={<XCircle size={28} />}
                title="QR буруу"
                subtitle={result.message}
                onDone={resetResult}
              />
            )}

            {result.kind === "pending" && (
              <ResultCard
                tone="warn"
                icon={<XCircle size={28} />}
                title="VIP хүсэлт батлагдаагүй"
                subtitle={result.message}
                booking={result.booking}
                onDone={resetResult}
              />
            )}

            {result.kind === "already" && (
              <ResultCard
                tone="warn"
                icon={<XCircle size={28} />}
                title="Аль хэдийн шалгагдсан"
                subtitle={
                  result.booking.boardedAt
                    ? `${new Date(result.booking.boardedAt).toLocaleString("mn-MN")}`
                    : "Дахин шалгах шаардлагагүй"
                }
                booking={result.booking}
                onDone={resetResult}
              />
            )}

            {result.kind === "preview" && (
              <div className="rounded-3xl border border-blue-500/30 bg-blue-950/20 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <UserIcon size={20} className="text-blue-300" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-blue-300 font-bold">
                      Захиалгын мэдээлэл
                    </p>
                    <p className="text-2xl font-black">Суудал {result.booking.seatId}</p>
                  </div>
                </div>

                <BookingDetails booking={result.booking} />

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={resetResult}
                    className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:bg-zinc-700"
                  >
                    Болих
                  </button>
                  <button
                    onClick={confirmBoarding}
                    className="flex-[2] py-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={14} /> Суулгах
                  </button>
                </div>
              </div>
            )}

            {result.kind === "confirmed" && (
              <ResultCard
                tone="success"
                icon={<CheckCircle2 size={28} />}
                title="Суулгав ✓"
                subtitle={`Суудал ${result.booking.seatId} — ${result.booking.user.fullName || result.booking.user.name}`}
                booking={result.booking}
                onDone={resetResult}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingDetails({ booking }: { booking: BookingInfo }) {
  return (
    <div className="bg-zinc-950/50 rounded-2xl p-4 space-y-3 border border-white/5">
      <Row label="Хэрэглэгч" value={booking.userName} />
      {booking.user.fullName && <Row label="Бүтэн нэр" value={booking.user.fullName} />}
      {booking.user.phone && <Row label="Утас" value={booking.user.phone} />}
      {booking.email && <Row label="Email" value={booking.email} />}
      <Row label="Статус" value={booking.status} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-0.5">
        {label}
      </p>
      <p className="text-sm text-white font-medium">{value}</p>
    </div>
  );
}

function ResultCard({
  tone,
  icon,
  title,
  subtitle,
  booking,
  onDone,
}: {
  tone: "success" | "warn" | "error";
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  booking?: BookingInfo;
  onDone: () => void;
}) {
  const toneCls = {
    success: "border-emerald-500/30 bg-emerald-950/30 text-emerald-300",
    warn: "border-orange-500/30 bg-orange-950/30 text-orange-300",
    error: "border-red-500/30 bg-red-950/30 text-red-300",
  }[tone];

  return (
    <div className={`rounded-3xl border ${toneCls} p-5 space-y-4`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-lg font-black">{title}</p>
          <p className="text-xs opacity-80">{subtitle}</p>
        </div>
      </div>
      {booking && <BookingDetails booking={booking} />}
      <button
        onClick={onDone}
        className="w-full py-3 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-black uppercase tracking-widest hover:bg-zinc-700"
      >
        Дараагийн QR
      </button>
    </div>
  );
}
