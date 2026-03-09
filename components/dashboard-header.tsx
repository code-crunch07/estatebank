"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Settings, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

export function DashboardHeader() {
  const router = useRouter();
  const [userName, setUserName] = useState("Admin");
  const [userEmail, setUserEmail] = useState("admin@estatebank.in");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Fetch user info from API (verifies httpOnly cookie)
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include', // REQUIRED: Include cookies in request
        });
        const data = await response.json();
        
        if (data.success && data.data?.authenticated && data.data?.user) {
          const user = data.data.user;
          if (user.email) {
            setUserEmail(user.email);
          }
          if (user.name) {
            setUserName(user.name);
          }
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        // Keep default values on error
      }
    };

    fetchUserInfo();

    // Initialize dark mode - only apply in dashboard
    const pathname = window.location.pathname;
    const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/login");
    
    if (isDashboard) {
      const theme = localStorage.getItem("theme") || "light";
      const isDark = theme === "dark";
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // Force light mode if not in dashboard
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", newTheme);
    
    // Only apply dark mode if we're in dashboard
    const pathname = window.location.pathname;
    const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/login");
    
    if (isDashboard) {
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // Force light mode if not in dashboard
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear server-side cookie
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {
        // Continue even if API call fails
      });
      
      // Clear client-side storage
      localStorage.removeItem("dashboard_authenticated");
      localStorage.removeItem("dashboard_user");
      localStorage.removeItem("dashboard_user_email");
      localStorage.removeItem("dashboard_user_name");
      
      toast.success("Logged out successfully");
      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Clear storage anyway and redirect
      localStorage.clear();
      router.push("/login");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Dashboard</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="relative hover:bg-accent transition-colors"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
