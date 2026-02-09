// app/duty/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function DutyPage() {
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => (p >= 92 ? 92 : p + 1));
    }, 120);
    return () => clearInterval(t);
  }, []);

  const statusText = useMemo(() => {
    if (progress < 30) return "Төлөвлөлт & UI дизайн";
    if (progress < 60) return "Өгөгдлийн бүтэц & логик";
    if (progress < 85) return "Тестлэлт & засвар";
    return "Сүүлчийн өнгөлгөө";
  }, [progress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 -left-28 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-28 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-2 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/10"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
            ←
          </span>
          <span className="font-semibold hover:cursor-pointer">Буцах</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 ring-1 ring-white/10 backdrop-blur">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
            🧹
          </span>
          <span className="font-semibold">ЖИЖҮҮР</span>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pb-16 pt-6">
        {/* Hero card */}
        <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
          <div className="relative p-8 sm:p-10">
            {/* Gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/10" />

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-white/10 ring-1 ring-white/15 shadow-lg">
                  🧹
                </div>

                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  ЖИЖҮҮР-ийн хуваарь
                </h1>
                <p className="mt-3 max-w-xl text-white/80">
                  Энэ хуудас одоогоор{" "}
                  <span className="font-semibold">хөгжүүлэлт шатандаа</span> явж
                  байна. Удахгүй ангийн жижүүрийн ээлж, нэрс, огноо зэрэг
                  функцууд нэмэгдэнэ.
                </p>

                {/* Progress */}
                <div className="mt-8 w-full">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-white/90">Явц</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">
                      {progress}%
                    </span>
                  </div>

                  <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-white/70">
                    <span>Статус: {statusText}</span>
                    <span>Coming soon</span>
                  </div>
                </div>

                {/* Feature cards */}
                <div className="mt-9 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
                  <FeatureCard
                    title="Ээлжийн хүснэгт"
                    desc="Өдөр/7 хоногоор автоматаар гарна"
                    icon="📅"
                  />

                  <FeatureCard
                    title="Хариуцлага"
                    desc="Хийсэн/хийгээгүй тэмдэглэл"
                    icon="✅"
                  />
                </div>

                {/* Actions */}
                <div className="mt-10 flex flex-col sm:flex-row gap-3 w-full justify-center">
                  <Link
                    href="/"
                    className="hover:cursor-pointer inline-flex justify-center rounded-2xl bg-white/10 px-5 py-3 font-semibold ring-1 ring-white/15 transition hover:bg-white/15"
                  >
                    Нүүр хуудас руу буцах
                  </Link>

                  <Link
                    href="/timeTable"
                    className="inline-flex justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 font-semibold shadow-lg transition hover:brightness-110"
                  >
                    ⏰ Хичээлийн хуваарь
                  </Link>

                  <Link
                    href="/homeWork"
                    className="inline-flex justify-center rounded-2xl bg-gradient-to-r from-pink-600 to-orange-600 px-5 py-3 font-semibold shadow-lg transition hover:brightness-110"
                  >
                    📚 Даалгавар
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-sm text-white/55">
          ✨ Энэ нь түр page. Хөгжүүлэлт дуусмагц жижүүрийн хүснэгт + edit +
          автоматаар эргэх логик нэмэгдэнэ.
        </p>
      </main>
    </div>
  );
}

function FeatureCard({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 ring-1 ring-white/5 backdrop-blur transition hover:bg-white/10">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="font-extrabold">{title}</div>
          <div className="mt-1 text-sm text-white/70">{desc}</div>
        </div>
      </div>
    </div>
  );
}
