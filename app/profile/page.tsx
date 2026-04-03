"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Camera, Save, Loader2, Instagram } from "lucide-react";

type Profile = {
  name: string;
  avatar: string | null;
  bio: string | null;
  instagram: string | null;
  createdAt: string;
  totalTodos: number;
  completedTodos: number;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState("");
  const [ig, setIg] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setBio(data.bio ?? "");
        setIg(data.instagram ?? "");
      })
      .catch(() => toast.error("Профайл ачаалахад алдаа"))
      .finally(() => setLoading(false));
  }, []);

  const uploadAvatar = async (file: File) => {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowed.has(file.type)) { toast.error("Зөвхөн JPG/PNG/WEBP"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("2MB-аас бага байх ёстой"); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!upRes.ok) throw new Error();
      const { url } = await upRes.json();

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ avatar: url }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile((p) => p ? { ...p, avatar: updated.avatar } : p);
        toast.success("Зураг шинэчлэгдлээ!");
      }
    } catch { toast.error("Алдаа гарлаа"); }
    setUploading(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bio: bio.trim(), instagram: ig.trim() }),
      });
      if (res.ok) {
        toast.success("Хадгалагдлаа!");
        const updated = await res.json();
        setProfile((p) => p ? { ...p, bio: updated.bio, instagram: updated.instagram } : p);
      }
    } catch { toast.error("Алдаа"); }
    setSaving(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center"><Loader2 className="animate-spin" size={24} /></div>;
  }

  if (!profile) return null;

  const pct = profile.totalTodos > 0 ? Math.round((profile.completedTodos / profile.totalTodos) * 100) : 0;

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans">
      <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.push("/")} className="p-2 hover:bg-card-hover rounded-xl transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-sm">Профайл</h1>
      </div>

      <div className="max-w-sm mx-auto px-4 py-8 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-surface-elevated border-2 border-border overflow-hidden shadow-2xl">
              {profile.avatar ? (
                <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-black text-accent/40">
                  {profile.name[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            </button>
            <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black">{profile.name}</h2>
            {profile.instagram && (
              <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1 text-xs text-pink-400 hover:text-pink-300 transition-colors">
                <Instagram size={12} /> @{profile.instagram}
              </a>
            )}
            <p className="text-[10px] text-on-surface-muted mt-1">
              {new Date(profile.createdAt).toLocaleDateString("mn-MN")}-с бүртгэлтэй
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-on-surface-muted uppercase tracking-wider">Тухай</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={200} rows={3}
            placeholder="Өөрийнхөө тухай бичээрэй..."
            className="w-full bg-surface-elevated border border-border rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted/50 outline-none focus:ring-2 focus:ring-accent/30 transition-all resize-none" />
          <span className="text-[10px] text-on-surface-muted">{bio.length}/200</span>
        </div>

        {/* Instagram */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-on-surface-muted uppercase tracking-wider flex items-center gap-1">
            <Instagram size={10} /> Instagram
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-on-surface-muted">@</span>
            <input value={ig} onChange={(e) => setIg(e.target.value.replace(/[^a-zA-Z0-9._]/g, ""))} maxLength={30}
              placeholder="username"
              className="flex-1 bg-surface-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-muted/50 outline-none focus:ring-2 focus:ring-accent/30 transition-all" />
          </div>
        </div>

        {/* Save button */}
        <button onClick={saveProfile} disabled={saving}
          className="w-full py-3 rounded-2xl bg-accent/20 border border-accent/30 text-accent text-sm font-bold
            hover:bg-accent/30 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Хадгалах
        </button>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-elevated border border-border-subtle rounded-2xl p-4 text-center">
            <p className="text-2xl font-black">{profile.completedTodos}</p>
            <p className="text-[10px] text-on-surface-muted mt-1">Биелсэн todo</p>
          </div>
          <div className="bg-surface-elevated border border-border-subtle rounded-2xl p-4 text-center">
            <p className="text-2xl font-black">{pct}%</p>
            <p className="text-[10px] text-on-surface-muted mt-1">Гүйцэтгэл</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-on-surface-muted mb-1">
            <span>Todo progress</span>
            <span>{profile.completedTodos}/{profile.totalTodos}</span>
          </div>
          <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
