"use client";

import { useEffect, useState } from "react";

/**
 * Smooth page transition wrapper.
 * Fades + slides content in on mount.
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Плагин үүсгэхийнхаа өмнө жижиг хугацаа өгнө
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2"
      }`}
    >
      {children}
    </div>
  );
}
