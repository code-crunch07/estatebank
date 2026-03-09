"use client";

import { useEffect, useRef } from "react";

export function FaviconUpdater() {
  const currentRef = useRef<string | null>(null);

  const updateFavicon = async () => {
    try {
      const res = await fetch("/api/branding", { cache: "no-store" });
      const json = await res.json();

      if (!json?.success) return;

      const favicon =
        json.data?.favicon || "/images/fav-icon/icon.png";

      if (currentRef.current === favicon) return;
      currentRef.current = favicon;

      // ---- ICON ----
      let icon = document.querySelector(
        'link[rel="icon"]'
      ) as HTMLLinkElement | null;

      if (!icon) {
        icon = document.createElement("link");
        icon.rel = "icon";
        document.head.appendChild(icon);
      }

      icon.href = favicon;
      icon.type = favicon.endsWith(".svg")
        ? "image/svg+xml"
        : favicon.endsWith(".ico")
        ? "image/x-icon"
        : "image/png";

      // ---- APPLE TOUCH ICON ----
      let apple = document.querySelector(
        'link[rel="apple-touch-icon"]'
      ) as HTMLLinkElement | null;

      if (!apple) {
        apple = document.createElement("link");
        apple.rel = "apple-touch-icon";
        document.head.appendChild(apple);
      }

      apple.href = favicon;
    } catch (err) {
      console.error("Favicon update failed:", err);
    }
  };

  useEffect(() => {
    updateFavicon();

    const handler = () => updateFavicon();
    window.addEventListener("branding:update", handler);

    return () => {
      window.removeEventListener("branding:update", handler);
    };
  }, []);

  return null;
}
