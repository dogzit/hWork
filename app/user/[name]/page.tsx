"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Instagram, Loader2, ImageOff, MessageSquare, Heart } from "lucide-react";

type UserProfile = { name: string; avatar: string | null; bio: string | null; instagram: string | null };
type Post = { id: string; userName: string; text: string; images: string[]; createdAt: string; likeCount: number; commentCount: number };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Дөнгөж сая";
  if (mins < 60) return `${mins} мин`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} цаг`;
  return `${Math.floor(hrs / 24)} өдөр`;
}

// Consistent color from name
function nameGradient(name: string) {
  const gradients = [
    "from-violet-500 to-purple-600",
    "from-pink-500 to-rose-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-indigo-500 to-blue-600",
    "from-rose-500 to-pink-600",
    "from-cyan-500 to-blue-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

export default function UserPage() {
  const router = useRouter();
  const params = useParams();
  const name = decodeURIComponent(params.name as string);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(name)}`);
        if (res.ok) {
          const data = await res.json();
          const u = data.users.find((u: UserProfile) => u.name.toLowerCase() === name.toLowerCase());
          if (u) setUser(u);
          setPosts(data.posts.filter((p: Post) => p.userName.toLowerCase() === name.toLowerCase()));
        }
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, [name]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="animate-spin text-on-surface-muted" size={24} />
      </div>
    );
  }

  const gradient = nameGradient(name);

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans">
      {/* Header with gradient banner */}
      <div className="relative">
        <div className={`h-32 bg-gradient-to-br ${gradient} opacity-80`} />
        <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()}
            className="p-2 bg-black/20 backdrop-blur-sm rounded-xl hover:bg-black/30 transition-all">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="font-bold text-sm text-white">{name}</h1>
        </div>

        {/* Avatar overlapping banner */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 rounded-full bg-surface border-4 border-surface overflow-hidden shadow-2xl">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <span className="text-3xl font-black text-white/90">
                  {name[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-16 pb-8 space-y-6">
        {/* Name + info */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black">{name}</h2>
          {user?.bio ? (
            <p className="text-sm text-on-surface-muted max-w-xs mx-auto">{user.bio}</p>
          ) : (
            <p className="text-sm text-on-surface-muted/40 italic">Bio оруулаагүй байна</p>
          )}
          {user?.instagram && (
            <a href={`https://instagram.com/${user.instagram}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold hover:bg-pink-500/20 transition-all">
              <Instagram size={13} />
              @{user.instagram}
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6">
          <div className="text-center">
            <p className="text-lg font-black">{posts.length}</p>
            <p className="text-[10px] text-on-surface-muted">Нийтлэл</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black">{posts.reduce((a, p) => a + p.likeCount, 0)}</p>
            <p className="text-[10px] text-on-surface-muted">Нийт like</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-surface-elevated border border-border-subtle flex items-center justify-center">
              <ImageOff size={24} className="text-on-surface-muted/30" />
            </div>
            <p className="text-sm text-on-surface-muted">Нийтлэл байхгүй байна</p>
            <p className="text-xs text-on-surface-muted/50">Мэдээний самбарт юм нийтлэхэд энд харагдана</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-surface-elevated border border-border-subtle rounded-2xl overflow-hidden">
                {/* Images */}
                {post.images.length > 0 && (
                  <div className={`grid gap-0.5 ${post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                    {post.images.map((url, i) => (
                      <img key={i} src={url} alt="" className="w-full object-cover max-h-64" />
                    ))}
                  </div>
                )}
                {/* Content */}
                <div className="p-4 space-y-2">
                  {post.text && <p className="text-sm leading-relaxed">{post.text}</p>}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-xs text-on-surface-muted">
                      <span className="flex items-center gap-1"><Heart size={12} /> {post.likeCount}</span>
                      <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.commentCount}</span>
                    </div>
                    <p className="text-[10px] text-on-surface-muted">{timeAgo(post.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Not found */}
        {!user && (
          <div className="text-center py-8 space-y-3">
            <div className="text-4xl">🔍</div>
            <p className="text-sm text-on-surface-muted">Энэ хэрэглэгч бүртгэлгүй байна</p>
          </div>
        )}
      </div>
    </div>
  );
}
