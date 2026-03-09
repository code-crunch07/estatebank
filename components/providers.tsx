"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { WhatsAppFloat } from "./whatsapp-float";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  // Dark mode implementation - only for dashboard
  useEffect(() => {
    const checkAndApplyTheme = () => {
      const pathname = window.location.pathname;
      const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/login");
      const root = document.documentElement;
      
      if (isDashboard) {
        // Only apply dark mode in dashboard
        const theme = localStorage.getItem("theme") || "light";
        if (theme === "dark") {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      } else {
        // Force light mode for client frontend
        root.classList.remove("dark");
      }
    };

    // Check on mount
    checkAndApplyTheme();

    // Listen for route changes
    const handleRouteChange = () => {
      checkAndApplyTheme();
    };

    // Check periodically to ensure theme is correct
    const interval = setInterval(checkAndApplyTheme, 500);

    // Listen for popstate (browser back/forward)
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
      <WhatsAppFloat />
    </QueryClientProvider>
  );
}

