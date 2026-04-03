"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy, Medal, Flame, Loader2 } from "lucide-react";

type Entry = { name: string; total: number; completed: number };

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Entry[]>([]);
  const [streak, setStreak] = useState<{ streak: number; totalCompleted: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/leaderboard").then((r) => r.json()),
      fetch("/api/streak").then((r) => r.json()),
    ]).then(([lb, st]) => {
      setData(lb);
      setStreak(st);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.push("/")} className="p-2 hover:bg-card-hover rounded-xl transition-all">
          <ArrowLeft size={20} />
        </button>
        <Trophy size={18} className="text-amber-400" />
        <h1 className="font-bold text-sm">Тэргүүлэгчдийн самбар</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Streak Card */}
        {streak && streak.streak > 0 && (
          <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-5 flex items-center gap-4">
            <div className="text-4xl">
              <Flame size={36} className="text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-orange-400">{streak.streak} өдөр</p>
              <p className="text-xs text-on-surface-muted">Таны дараалсан streak!</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-lg font-bold text-on-surface">{streak.totalCompleted}</p>
              <p className="text-[10px] text-on-surface-muted">Нийт биелсэн</p>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-on-surface-muted" size={24} />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-on-surface-muted text-sm">Хэрэглэгч олдсонгүй</div>
        ) : (
          <div className="space-y-2">
            {data.map((entry, i) => {
              const pct = entry.total > 0 ? Math.round((entry.completed / entry.total) * 100) : 0;
              const isTop3 = i < 3;
              return (
                <div
                  key={entry.name}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all
                    ${isTop3
                      ? "bg-amber-500/5 border-amber-500/20"
                      : "bg-surface-elevated border-border-subtle"
                    }`}
                >
                  <div className="w-8 text-center">
                    {isTop3 ? (
                      <span className="text-xl">{MEDALS[i]}</span>
                    ) : (
                      <span className="text-sm font-bold text-on-surface-muted">{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{entry.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-surface-alt rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-on-surface-muted w-8">{pct}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black">{entry.completed}</p>
                    <p className="text-[9px] text-on-surface-muted">/{entry.total}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
