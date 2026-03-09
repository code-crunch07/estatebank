'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { InactivityTimeout } from '@/components/inactivity-timeout';

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const prevPathnameRef = useRef<string>(pathname);

  // ✅ Auth check (NO redirects here - middleware handles access control)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include', // REQUIRED: Include cookies in request
        });
        const data = await response.json();
        
        // Check payload, not HTTP status (always 200)
        // Middleware handles redirects - we just track auth state for UI
        setIsAuthenticated(Boolean(data?.success && data?.data?.authenticated));
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []); // ✅ No pathname dependency - middleware handles routing

  // Apply dark mode only once on mount
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  // Handle route changes - ensure navigation works properly
  useEffect(() => {
    // Only process if pathname actually changed
    if (prevPathnameRef.current !== pathname) {
      // Force scroll to top on route change
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      
      // Update ref
      prevPathnameRef.current = pathname;
      
      // Note: Removed window.history.replaceState as it interferes with Next.js router navigation
      // Next.js App Router handles URL synchronization automatically
    }
  }, [pathname]);

  // ✅ Show loading state while checking authentication
  // Conditional rendering AFTER all hooks (Rules of Hooks compliance)
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ If not authenticated, render nothing (middleware already redirected)
  // Layout should never see unauthenticated users - middleware protects routes
  if (!isAuthenticated) {
    return null;
  }

  // ✅ Render dashboard layout for authenticated users
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      {/* Inactivity Timeout - Auto logout after 30 minutes of inactivity */}
      <InactivityTimeout timeoutMinutes={30} warningMinutes={2} />
    </div>
  );
}
