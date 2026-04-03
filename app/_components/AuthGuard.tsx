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
    } else {
      // Хэрэв нэвтэрчихсэн байхад login эсвэл signup руу орох гэж үзвэл:
      if (isPublicPath) {
        const target = storedName.toLowerCase() === "admin" ? "/admin" : "/";
        router.replace(target);
        return;
      }
    }

    // Шалгаж дууссан бол агуулгыг харуулна
    setChecking(false);
  }, [router, pathname]);

  // Шалгаж дуустал (redirect хийгдэх хооронд) хоосон дэлгэц харуулна
  // Энэ нь нэвтрээгүй хэрэглэгчид админ хуудас "гялс" харагдаад алга болохоос сэргийлнэ.
  if (checking) {
    return <div className="min-h-screen bg-surface" />;
  }

  return <>{children}</>;
}
