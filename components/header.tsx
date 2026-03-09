"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Mail, MapPin, User, Plus, ChevronDown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { BrandingSettings } from "@/lib/data-store";

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [headerState, setHeaderState] = useState({ hidden: false, scrolled: false });
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState<number | null>(null);
  const [expandedMobileMenus, setExpandedMobileMenus] = useState<Set<number>>(new Set());
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const handleGoogleLogin = () => {
    // Implement Google OAuth here
    console.log("Google login clicked");
  };

  // Only load branding after client-side hydration
  useEffect(() => {
    setIsMounted(true);
    // Fetch branding from API
    const fetchBranding = async () => {
      try {
        const response = await fetch('/api/branding');
        const data = await response.json();
        if (data.success && data.data) {
          setBranding(data.data as BrandingSettings);
        }
      } catch (error) {
        console.error('Error fetching branding:', error);
      }
    };
    
    fetchBranding();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    lastScrollY.current = window.scrollY;
    
    const handleScroll = () => {
      if (ticking.current) return;
      
      ticking.current = true;
      requestAnimationFrame(() => {
        const currentScroll = window.scrollY;
        const scrollDelta = currentScroll - lastScrollY.current;
        
        // Only update if meaningful scroll (more than 5px)
        if (Math.abs(scrollDelta) < 5) {
          ticking.current = false;
          return;
        }
        
        const isScrolled = currentScroll > 20;
        let isHidden = headerState.hidden;
        
        if (currentScroll <= 100) {
          isHidden = false;
        } else if (scrollDelta > 5) {
          isHidden = true;
        } else if (scrollDelta < -5) {
          isHidden = false;
        }
        
        // Single state update
        setHeaderState({ hidden: isHidden, scrolled: isScrolled });
        lastScrollY.current = currentScroll;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headerState.hidden]);

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const fallbackNavLinks = useMemo(
    () => [
      { id: 1, label: "Home", href: "/", children: [], visible: true, order: 1 },
      {
        id: 2,
        label: "Properties",
        href: "/properties",
        children: [
          { id: 21, label: "Residential", href: "/properties?segment=residential", visible: true, order: 1 },
          { id: 22, label: "Commercial", href: "/properties?segment=commercial", visible: true, order: 2 },
        ],
        visible: true,
        order: 2,
      },
      { id: 3, label: "New Projects", href: "/properties/under-construction", children: [], visible: true, order: 3 },
      { id: 4, label: "Services", href: "/services", children: [], visible: true, order: 4 },
      { id: 5, label: "About Us", href: "/about", children: [], visible: true, order: 5 },
      { id: 6, label: "Testimonials", href: "/testimonials", children: [], visible: true, order: 6 },
      { id: 7, label: "Contact Us", href: "/contact", children: [], visible: true, order: 7 },
    ],
    []
  );

  const navLinks = useMemo(() => {
    // Always use fallbackNavLinks if branding is not loaded or has no navLinks
    if (!isMounted) {
      return fallbackNavLinks;
    }
    
    if (!branding || !branding.navLinks || !Array.isArray(branding.navLinks) || branding.navLinks.length === 0) {
      return fallbackNavLinks;
    }
    
    const brandingLinks = [...branding.navLinks]
      .filter((link) => link.visible !== false) // Default to visible if not specified
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((link) => ({
        ...link,
        children: (link.children ?? [])
          .filter((child) => child.visible !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0)),
      }));
    
    // If branding links are empty, use fallback
    return brandingLinks.length > 0 ? brandingLinks : fallbackNavLinks;
  }, [branding, isMounted, fallbackNavLinks]);

  const resolvedNavLinks = navLinks;

  const headerLogo = (isMounted && branding?.headerLogo) || "/logo.png";
  const headerLogoRequiresOptimization = !headerLogo.startsWith("data:");

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        headerState.hidden ? "-translate-y-full" : "translate-y-0"
      } ${
        headerState.scrolled 
          ? "shadow-xl bg-white/95 backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md border-gray-200/50" 
          : "shadow-md bg-white border-gray-200/50"
      }`}
    >
      <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12">
        {/* Main Navigation */}
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link 
            href="/" 
            className="flex items-center space-x-2"
          >
            <div className="relative w-auto h-12">
              <Image
                src={headerLogo}
                alt="EstateBANK.in Logo"
                width={200}
                height={80}
                className="w-auto object-contain h-12"
                priority
                quality={100}
                unoptimized={true}
              />
              <span className="sr-only">EstateBANK.in</span>
            </div>
          </Link>

          {/* Desktop Navigation - Right Aligned */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4 ml-auto">
            <nav className="flex items-center gap-1 lg:gap-1.5 mr-3 lg:mr-4">
              {resolvedNavLinks && resolvedNavLinks.length > 0 ? (
                resolvedNavLinks.map((link, linkIndex) => {
                  const hasChildren = (link.children ?? []).length > 0;
                  const isActive = isActiveLink(link.href);
                  const linkKey = link.id ? `link-${link.id}` : `link-${linkIndex}-${link.href}`;
                  
                  if (!hasChildren) {
                    return (
                      <Link
                        key={linkKey}
                        href={link.href}
                        className={`relative px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 whitespace-nowrap ${
                          isActive
                            ? "text-primary"
                            : "text-gray-700 hover:text-primary"
                        }`}
                      >
                        <span className="relative z-10">{link.label}</span>
                      </Link>
                    );
                  }
                  const dropdownId = link.id || linkIndex;
                  return (
                    <div 
                      key={linkKey} 
                      className="relative"
                      onMouseEnter={() => setHoveredDropdown(dropdownId)}
                      onMouseLeave={() => setHoveredDropdown(null)}
                    >
                      <Link
                        href={link.href}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 whitespace-nowrap ${
                          isActive
                            ? "text-primary"
                            : "text-gray-700 hover:text-primary"
                        }`}
                      >
                        <span className="relative z-10">{link.label}</span>
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ease-out ${hoveredDropdown === dropdownId ? "rotate-180" : ""}`} />
                      </Link>
                      {/* Dropdown menu - reduced gap and padding-top creates hover-safe bridge */}
                      <div className={`absolute left-0 top-full mt-0.5 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden transition-[opacity,transform] duration-200 ease-out ${
                        hoveredDropdown === dropdownId 
                          ? "opacity-100 translate-y-0 pointer-events-auto visible" 
                          : "opacity-0 -translate-y-2 pointer-events-none invisible"
                      } min-w-[220px] backdrop-blur-sm z-50`}
                      style={{ paddingTop: '0.75rem' }}
                      >
                        <div className="py-2">
                          {(link.children ?? []).map((child, childIndex) => {
                            const childKey = child.id ? `child-${link.id || linkIndex}-${child.id}` : `child-${link.id || linkIndex}-${childIndex}-${child.href}`;
                            return (
                            <Link
                              key={childKey}
                              href={child.href}
                              className="block px-5 py-3 text-xs uppercase tracking-wider text-gray-700 hover:text-primary transition-colors duration-150 font-semibold hover:bg-gray-50 rounded-md mx-1"
                            >
                              {child.label}
                            </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500">No menu items available</div>
              )}
            </nav>

            <Button 
              size="default"
              variant="default"
              asChild
              className="relative overflow-hidden group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-shadow duration-200 px-6"
            >
              <Link href="/properties/add" className="flex items-center gap-2">
                <Plus className="h-4 w-4 transition-transform duration-150 ease-out group-hover:rotate-90" />
                <span className="font-semibold uppercase tracking-wider">Post Property</span>
                <span className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out origin-left"></span>
              </Link>
            </Button>

            {isMounted && (
            <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-11 w-11 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary transition-[background-color,color,transform,box-shadow] duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[70vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Welcome to EstateBANK.in</DialogTitle>
                  <DialogDescription>
                    {authMode === "login" ? "Sign in to your account" : "Create a new account"}
                  </DialogDescription>
                </DialogHeader>
                <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as "login" | "signup")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input id="login-email" type="email" placeholder="Enter your email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input id="login-password" type="password" placeholder="Enter your password" />
                    </div>
                    <Button className="w-full" onClick={() => setIsAuthDialogOpen(false)}>
                      Login
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-sm uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleLogin}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </TabsContent>
                  <TabsContent value="signup" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input id="signup-name" type="text" placeholder="Enter your full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" type="email" placeholder="Enter your email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input id="signup-password" type="password" placeholder="Create a password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <Input id="signup-confirm" type="password" placeholder="Confirm your password" />
                    </div>
                    <Button className="w-full" onClick={() => setIsAuthDialogOpen(false)}>
                      Sign Up
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-sm uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleLogin}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            {isMounted && (
            <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-11 w-11 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[70vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Welcome to EstateBANK.in</DialogTitle>
                  <DialogDescription>
                    {authMode === "login" ? "Sign in to your account" : "Create a new account"}
                  </DialogDescription>
                </DialogHeader>
                <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as "login" | "signup")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="mobile-login-email">Email</Label>
                      <Input id="mobile-login-email" type="email" placeholder="Enter your email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile-login-password">Password</Label>
                      <Input id="mobile-login-password" type="password" placeholder="Enter your password" />
                    </div>
                    <Button className="w-full" onClick={() => setIsAuthDialogOpen(false)}>
                      Login
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-sm uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleLogin}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </TabsContent>
                  <TabsContent value="signup" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="mobile-signup-name">Full Name</Label>
                      <Input id="mobile-signup-name" type="text" placeholder="Enter your full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile-signup-email">Email</Label>
                      <Input id="mobile-signup-email" type="email" placeholder="Enter your email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile-signup-password">Password</Label>
                      <Input id="mobile-signup-password" type="password" placeholder="Create a password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile-signup-confirm">Confirm Password</Label>
                      <Input id="mobile-signup-confirm" type="password" placeholder="Confirm your password" />
                    </div>
                    <Button className="w-full" onClick={() => setIsAuthDialogOpen(false)}>
                      Sign Up
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-sm uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleLogin}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="h-11 w-11 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-[max-height,opacity,padding] duration-200 ease-out border-t border-primary/10 ${
            isMenuOpen ? "max-h-[600px] opacity-100 pb-6 pt-4" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-2 pt-4 px-2">
            {resolvedNavLinks.map((link, index) => {
              const isActive = isActiveLink(link.href);
              const hasChildren = (link.children ?? []).length > 0;
              const linkId = link.id || index;
              const linkKey = link.id ? `mobile-link-${link.id}` : `mobile-link-${index}-${link.href}`;
              const isExpanded = expandedMobileMenus.has(linkId);
              
              const toggleExpanded = () => {
                const newSet = new Set(expandedMobileMenus);
                if (isExpanded) {
                  newSet.delete(linkId);
                } else {
                  newSet.add(linkId);
                }
                setExpandedMobileMenus(newSet);
              };
              
              return (
                <div key={linkKey} className="overflow-hidden">
                  <div className="flex items-center justify-between">
                    <Link
                      href={link.href}
                      className={`flex-1 text-xs font-semibold uppercase tracking-wider py-3 px-2 transition-colors duration-150 ${
                        isActive
                          ? "text-primary"
                          : "text-gray-700 hover:text-primary"
                      }`}
                      onClick={() => {
                        if (!hasChildren) {
                          setIsMenuOpen(false);
                        } else {
                          toggleExpanded();
                        }
                      }}
                    >
                      {link.label}
                    </Link>
                    {hasChildren && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleExpanded();
                        }}
                        className="p-2.5 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 rounded-xl transition-[background-color,transform] duration-200 hover:scale-110"
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ease-out ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>
                  {hasChildren && (
                    <div className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                      <div className="pl-4 space-y-1">
                        {(link.children ?? []).map((child, childIndex) => {
                          const childKey = child.id ? `mobile-child-${linkId}-${child.id}` : `mobile-child-${linkId}-${childIndex}-${child.href}`;
                          return (
                          <Link
                            key={childKey}
                            href={child.href}
                            className="block text-xs font-semibold uppercase tracking-wider py-2.5 px-4 text-gray-700 hover:text-primary transition-colors duration-150"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <Button 
              size="lg" 
              variant="default" 
              className="mt-4 mx-2 relative overflow-hidden group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-shadow duration-200" 
              asChild
            >
              <Link href="/properties/add" onClick={() => setIsMenuOpen(false)}>
                <Plus className="mr-2 h-4 w-4 transition-transform duration-150 ease-out group-hover:rotate-90" />
                Post Property
                <span className="absolute inset-0 bg-primary/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out origin-left"></span>
              </Link>
            </Button>
            <div className="mt-4 pt-4 border-t flex gap-2 px-2">
              <a 
                href="tel:+919820590353" 
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200"
              >
                <Phone className="h-4 w-4" />
                <span className="text-sm font-medium">Call</span>
              </a>
              <a 
                href="https://wa.me/919820590353" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm font-medium">WhatsApp</span>
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
