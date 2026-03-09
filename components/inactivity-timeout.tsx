"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface InactivityTimeoutProps {
  timeoutMinutes?: number; // Default 30 minutes
  warningMinutes?: number; // Show warning X minutes before logout (default 2 minutes)
}

export function InactivityTimeout({ 
  timeoutMinutes = 30, 
  warningMinutes = 2 
}: InactivityTimeoutProps) {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const timeoutMs = timeoutMinutes * 60 * 1000; // Convert to milliseconds
  const warningMs = warningMinutes * 60 * 1000; // Convert to milliseconds

  const handleLogout = useCallback(async () => {
    try {
      // Call logout API to clear server-side cookie
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {
        // Continue even if API call fails
      });
      
      // Clean up any legacy localStorage items (if they exist)
      // Note: Auth is now cookie-based, but cleanup is harmless
      localStorage.removeItem("dashboard_authenticated");
      localStorage.removeItem("dashboard_user");
      localStorage.removeItem("dashboard_user_email");
      localStorage.removeItem("dashboard_user_name");
      
      toast.info("You have been logged out due to inactivity");
      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Clear storage anyway and redirect
      // Note: Only clears UI preferences (theme, etc.) - auth is cookie-based
      localStorage.clear();
      router.push("/login");
    }
  }, [router]);

  const resetTimer = useCallback(() => {
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }

    // Update last activity time
    lastActivityRef.current = Date.now();
    
    // Hide warning if it was showing
    setShowWarning(false);
    setTimeRemaining(0);

    // Set warning timeout (show warning X minutes before logout)
    const warningTime = timeoutMs - warningMs;
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setTimeRemaining(warningMs);
      
      // Start countdown interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - (lastActivityRef.current + warningTime);
        const remaining = Math.max(0, warningMs - elapsed);
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          clearInterval(intervalRef.current!);
        }
      }, 1000);
    }, warningTime);

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, timeoutMs);
  }, [timeoutMs, warningMs, handleLogout]);

  const handleActivity = useCallback(() => {
    // Only reset if there's been actual activity (not just timer updates)
    const timeSinceLastActivity = Date.now() - lastActivityRef.current;
    if (timeSinceLastActivity > 1000) { // At least 1 second since last activity
      resetTimer();
    }
  }, [resetTimer]);

  const handleStayLoggedIn = useCallback(() => {
    resetTimer();
    toast.success("Session extended");
  }, [resetTimer]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Initialize timer
    resetTimer();

    // Track user activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Throttle activity handler to avoid too many resets
    let activityTimeout: NodeJS.Timeout | null = null;
    const throttledActivity = () => {
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
      activityTimeout = setTimeout(() => {
        handleActivity();
      }, 1000); // Throttle to once per second
    };

    events.forEach((event) => {
      window.addEventListener(event, throttledActivity, { passive: true });
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, throttledActivity);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
    };
  }, [resetTimer, handleActivity]);

  return (
    <Dialog open={showWarning} onOpenChange={(open) => {
      // Prevent closing by clicking outside - user must choose an action
      if (!open) {
        handleStayLoggedIn();
      }
    }}>
      <DialogContent 
        className="sm:max-w-md" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Session Timeout Warning</DialogTitle>
          <DialogDescription>
            You have been inactive for a while. You will be automatically logged out soon.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-primary mb-2">
              {formatTime(timeRemaining)}
            </div>
            <p className="text-sm text-muted-foreground">
              Time remaining before automatic logout
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleStayLoggedIn}
              className="flex-1"
              variant="default"
            >
              Stay Logged In
            </Button>
            <Button
              onClick={handleLogout}
              className="flex-1"
              variant="outline"
            >
              Logout Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

