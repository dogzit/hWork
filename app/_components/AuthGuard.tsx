"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedName = localStorage.getItem("name");

    // Хэрэв нэвтрээгүй бол login руу шиднэ (гэхдээ login хуудсан дээр байвал шидэхгүй)
    if (!storedName && pathname !== "/auth/login") {
      router.replace("/auth/login");
    }
  }, [router, pathname]);

  return <>{children}</>;
}
