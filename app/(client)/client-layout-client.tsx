'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ScrollToTop } from '@/components/scroll-to-top';
// import { PropertyChatbot } from '@/components/property-chatbot';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function ClientLayoutClient({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const prevPathnameRef = useRef<string>(pathname);

  // Force light mode for client frontend - always remove dark class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");

    // Use MutationObserver to watch for dark class being added
    const observer = new MutationObserver(() => {
      const currentPathname = window.location.pathname;
      // Only remove dark mode if we're NOT in dashboard
      if (!currentPathname.startsWith("/dashboard") && !currentPathname.startsWith("/login")) {
        root.classList.remove("dark");
      }
    });

    // Observe changes to the html element's class attribute
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Handle route changes - ensure navigation works properly
  useEffect(() => {
    // Only scroll if pathname actually changed
    if (prevPathnameRef.current !== pathname) {
      // Force scroll to top immediately
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

      // Update ref
      prevPathnameRef.current = pathname;

      // Note: Removed window.history.replaceState as it interferes with Next.js router navigation
      // Next.js App Router handles URL synchronization automatically
    }
  }, [pathname]);

  return (
    <div className={className}>
      <Header />
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] md:min-h-[calc(100vh-theme(spacing.20))] flex-col overflow-x-hidden">
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </div>
      <ScrollToTop />
    </div>
  );
}

