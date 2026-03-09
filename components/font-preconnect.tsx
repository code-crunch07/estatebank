"use client";

import { useEffect } from "react";
import { safeAppendChild } from "@/lib/dom-utils";

export function FontPreconnect() {
  useEffect(() => {
    // Wait for DOM to be ready
    const timeoutId = setTimeout(() => {
      if (!document.head) {
        return;
      }

      // Check if links already exist to avoid duplicates
      const existingGoogle = document.querySelector('link[rel="preconnect"][href="https://fonts.googleapis.com"]');
      const existingGstatic = document.querySelector('link[rel="preconnect"][href="https://fonts.gstatic.com"]');

      // Add preconnect links for Google Fonts
      if (!existingGoogle) {
        const preconnectGoogle = document.createElement("link");
        preconnectGoogle.rel = "preconnect";
        preconnectGoogle.href = "https://fonts.googleapis.com";
        safeAppendChild(document.head, preconnectGoogle);
      }

      if (!existingGstatic) {
        const preconnectGstatic = document.createElement("link");
        preconnectGstatic.rel = "preconnect";
        preconnectGstatic.href = "https://fonts.gstatic.com";
        preconnectGstatic.crossOrigin = "anonymous";
        safeAppendChild(document.head, preconnectGstatic);
      }
    }, 50);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return null;
}

