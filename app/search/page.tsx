"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Instagram, Loader2 } from "lucide-react";

type UserResult = { name: string; avatar: string | null; bio: string | null; instagram: string | null };
type PostResult = { id: string; userName: string; text: string; images: string[]; createdAt: string; likeCount: number; commentCount: number };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Сая";
  if (mins < 60) return `${mins}м`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}ц`;
  return `${Math.floor(hrs / 24)}ө`;
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [posts, setPosts] = useState<PostResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setPosts(data.posts);
      }
    } catch { /* */ }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans">
      <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.push("/")} className="p-2 hover:bg-card-hover rounded-xl transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-sm">Хайлт</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Search input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Нэр, мэдээ хайх..."
              className="w-full bg-surface-elevated border border-border rounded-2xl pl-10 pr-4 py-3 text-sm
                text-on-surface placeholder:text-on-surface-muted/50 outline-none focus:ring-2 focus:ring-accent/30 transition-all"
            />
          </div>
          <button onClick={search} disabled={loading || !query.trim()}
            className="px-5 py-3 rounded-2xl bg-accent/20 border border-accent/30 text-accent text-sm font-bold
              hover:bg-accent/30 disabled:opacity-40 transition-all">
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Хайх"}
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-on-surface-muted" size={24} /></div>
        ) : searched && users.length === 0 && posts.length === 0 ? (
          <div className="text-center py-12 text-on-surface-muted text-sm">Олдсонгүй</div>
        ) : (
          <>
            {/* Users */}
            {users.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-muted mb-3">Хэрэглэгчид ({users.length})</p>
                <div className="space-y-2">
                  {users.map((u) => (
                    <button key={u.name} onClick={() => router.push(`/user/${encodeURIComponent(u.name)}`)}
                      className="w-full flex items-center gap-3 p-3 bg-surface-elevated border border-border-subtle rounded-2xl
                        hover:border-border hover:scale-[1.01] active:scale-[0.99] transition-all text-left">
                      <div className="w-11 h-11 rounded-full bg-accent/10 border border-border overflow-hidden shrink-0">
                        {u.avatar ? (
                          <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-accent/50">
                            {u.name[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{u.name}</p>
                        {u.bio && <p className="text-[10px] text-on-surface-muted truncate">{u.bio}</p>}
                        {u.instagram && (
                          <p className="text-[10px] text-pink-400 flex items-center gap-0.5 mt-0.5">
                            <Instagram size={10} /> @{u.instagram}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Posts */}
            {posts.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-muted mb-3">Мэдээ ({posts.length})</p>
                <div className="space-y-3">
                  {posts.map((p) => (
                    <button key={p.id} onClick={() => router.push(`/user/${encodeURIComponent(p.userName)}`)}
                      className="w-full bg-surface-elevated border border-border-subtle rounded-2xl p-3 text-left
                        hover:border-border transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold">{p.userName}</p>
                        <p className="text-[10px] text-on-surface-muted">{timeAgo(p.createdAt)}</p>
                      </div>
                      {p.text && <p className="text-sm text-on-surface-muted line-clamp-2">{p.text}</p>}
                      {p.images.length > 0 && (
                        <div className="flex gap-1">
                          {p.images.slice(0, 3).map((url, i) => (
                            <img key={i} src={url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                          ))}
                        </div>
                      )}
                      <div className="flex gap-3 text-[10px] text-on-surface-muted">
                        <span>❤️ {p.likeCount}</span>
                        <span>💬 {p.commentCount}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
