"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const storedName = localStorage.getItem("name");

    // 1. Зөвшөөрөгдөх замуудыг тодорхойлно (Эдгээр хуудсан дээр шалгахгүй)
    const publicPaths = ["/auth/login", "/auth/signup"];
    const isPublicPath = publicPaths.includes(pathname);

    if (!storedName) {
      // Хэрэв нэвтрээгүй БӨГӨӨД орох гэж байгаа хуудас нь Public биш бол:
      if (!isPublicPath) {
        router.replace("/auth/login");
        return;
      }
      setChecking(false);
      return;
    }

    if (!isPublicPath) {
      // localStorage-д нэр байгаа ч, энэ нь хуучирсан байж болно
      // (cookie устсан/хугацаа дууссан). Public биш хуудсан дээр
      // server аль хэдийн middleware-ээр шалгасан тул энд зүгээр
      // UI-г харуулна — давхар шалгалт хийх шаардлагагүй.
      setChecking(false);
      return;
    }

    // Хэрэв нэвтэрчихсэн мэт санагдаад login/signup руу орох гэж байвал
    // бодит session-г /api/auth/me-ээр баталгаажуулна. Үгүй бол зөвхөн
    // localStorage-д итгэж router.replace хийснээр login <-> redirect
    // хооронд хязгааргүй давталт (black screen) үүсэж байсан.
    let cancelled = false;
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.authenticated) {
          router.replace(
            data.role === "ADMIN" || data.name?.toLowerCase() === "admin"
              ? "/admin"
              : "/",
          );
        } else {
          localStorage.removeItem("name");
          localStorage.removeItem("role");
          setChecking(false);
        }
      })
      .catch(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  // Шалгаж дуустал (redirect хийгдэх хооронд) хоосон дэлгэц харуулна
  // Энэ нь нэвтрээгүй хэрэглэгчид админ хуудас "гялс" харагдаад алга болохоос сэргийлнэ.
  if (checking) {
    return <div className="min-h-screen bg-surface" />;
  }

  return <>{children}</>;
}
