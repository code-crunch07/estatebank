"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Users,
  FileText,
  MessageSquare,
  Settings,
  Globe,
  Home,
  PlusCircle,
  Wrench,
  Tag,
  Calendar,
  UserCheck,
  ClipboardList,
  Phone,
  Mail,
  Share2,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BrandingSettings, DataStore } from "@/lib/data-store";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Property Management",
    icon: <Building2 className="h-5 w-5" />,
    children: [
      { title: "All Properties", href: "/dashboard/properties", icon: <Building2 className="h-5 w-5" /> },
      { title: "Add Property", href: "/dashboard/properties/add", icon: <PlusCircle className="h-5 w-5" /> },
      { title: "Property Status", href: "/dashboard/properties/status", icon: <Tag className="h-5 w-5" /> },
      { title: "Under Construction", href: "/dashboard/properties/under-construction", icon: <Wrench className="h-5 w-5" /> },
      { title: "Property Types", href: "/dashboard/properties/types", icon: <Tag className="h-5 w-5" /> },
      { title: "Occupancy Types", href: "/dashboard/properties/occupancy", icon: <Home className="h-5 w-5" /> },
      { title: "Capacities", href: "/dashboard/properties/capacities", icon: <Users className="h-5 w-5" /> },
      { title: "Amenities", href: "/dashboard/properties/amenities", icon: <Tag className="h-5 w-5" /> },
      { title: "Share Property", href: "/dashboard/properties/share", icon: <Share2 className="h-5 w-5" /> },
    ],
  },
  {
    title: "Locations",
    icon: <MapPin className="h-5 w-5" />,
    children: [
      { title: "Manage Locations", href: "/dashboard/locations", icon: <MapPin className="h-5 w-5" /> },
      { title: "Manage Areas", href: "/dashboard/locations/areas", icon: <MapPin className="h-5 w-5" /> },
      { title: "Working Days", href: "/dashboard/locations/working-days", icon: <Calendar className="h-5 w-5" /> },
    ],
  },
  {
    title: "CRM",
    icon: <Users className="h-5 w-5" />,
    children: [
      { title: "Leads", href: "/dashboard/crm/leads", icon: <Users className="h-5 w-5" /> },
      { title: "Follow-ups", href: "/dashboard/crm/follow-ups", icon: <Calendar className="h-5 w-5" /> },
      { title: "Activity Logs", href: "/dashboard/crm/activities", icon: <ClipboardList className="h-5 w-5" /> },
      { title: "WhatsApp Integration", href: "/dashboard/crm/whatsapp", icon: <MessageSquare className="h-5 w-5" /> },
      { title: "Lead Sources", href: "/dashboard/crm/lead-sources", icon: <Tag className="h-5 w-5" /> },
      { title: "Assign Leads", href: "/dashboard/crm/assign", icon: <UserCheck className="h-5 w-5" /> },
    ],
  },
  {
    title: "People",
    icon: <Users className="h-5 w-5" />,
    children: [
      { title: "Clients", href: "/dashboard/people/clients", icon: <Users className="h-5 w-5" /> },
      { title: "Flat Owners", href: "/dashboard/people/owners", icon: <UserCheck className="h-5 w-5" /> },
      { title: "Brokers", href: "/dashboard/people/brokers", icon: <Users className="h-5 w-5" /> },
      { title: "Team Members", href: "/dashboard/people/team", icon: <Users className="h-5 w-5" /> },
    ],
  },
  {
    title: "Website Management",
    icon: <Globe className="h-5 w-5" />,
    children: [
      { title: "Slideshow / Banner", href: "/dashboard/website/banner", icon: <FileText className="h-5 w-5" /> },
      { title: "Branding", href: "/dashboard/website/branding", icon: <Settings className="h-5 w-5" /> },
      { title: "Homepage Areas", href: "/dashboard/website/areas", icon: <MapPin className="h-5 w-5" /> },
      { title: "Pages", href: "/dashboard/website/pages", icon: <FileText className="h-5 w-5" /> },
      { title: "Services", href: "/dashboard/website/services", icon: <Tag className="h-5 w-5" /> },
      { title: "SEO Settings", href: "/dashboard/website/seo", icon: <Settings className="h-5 w-5" /> },
      { title: "Media Library", href: "/dashboard/media", icon: <ImageIcon className="h-5 w-5" /> },
    ],
  },
  {
    title: "Content Management",
    icon: <FileText className="h-5 w-5" />,
    children: [
      { title: "Blogs", href: "/dashboard/content/blogs", icon: <FileText className="h-5 w-5" /> },
      { title: "Testimonials", href: "/dashboard/content/testimonials", icon: <MessageSquare className="h-5 w-5" /> },
      { title: "Happy Clients", href: "/dashboard/content/clients", icon: <Users className="h-5 w-5" /> },
    ],
  },
  {
    title: "Communication",
    icon: <MessageSquare className="h-5 w-5" />,
    children: [
      { title: "Enquiries", href: "/dashboard/communication/enquiries", icon: <Mail className="h-5 w-5" /> },
      { title: "Contacts", href: "/dashboard/communication/contacts", icon: <Phone className="h-5 w-5" /> },
      { title: "WhatsApp Broadcast", href: "/dashboard/communication/broadcast", icon: <MessageSquare className="h-5 w-5" /> },
    ],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

function NavItemComponent({ 
  item, 
  level = 0, 
  isOpen = false, 
  onToggle,
  openKey 
}: { 
  item: NavItem; 
  level?: number;
  isOpen?: boolean;
  onToggle?: () => void;
  openKey?: string;
}) {
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;
  
  // Check if any child is active (for opening parent)
  const isActiveChild = hasChildren && item.children?.some(child => {
    if (!child.href) return false;
    return pathname === child.href || pathname.startsWith(child.href + "/");
  });

  // Only mark parent as active if it has no children or if it's the exact match
  // Don't mark parent active if only a child is active
  const isActive = item.href && pathname === item.href && !hasChildren;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => {
            if (onToggle) {
              onToggle();
            }
          }}
          className={cn(
            "group relative flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
            "text-gray-700 dark:text-gray-300",
            "hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5",
            "hover:text-primary dark:hover:text-primary",
            "hover:shadow-md hover:shadow-primary/5",
            isActiveChild && "bg-gradient-to-r from-primary/10 to-primary/5 text-primary"
          )}
          style={{ paddingLeft: `${1 + level * 1.25}rem` }}
        >
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 flex-shrink-0",
            "bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/20",
            isActiveChild && "bg-primary/20"
          )}>
            <div className="scale-100 group-hover:scale-110 transition-transform duration-300">
              {item.icon}
            </div>
          </div>
          <span className="flex-1 text-left">{item.title}</span>
          <div className={cn(
            "ml-auto transition-all duration-300 ease-in-out",
            isOpen ? "rotate-90 text-primary" : "rotate-0"
          )}>
            <ChevronRight className="h-4 w-4" />
          </div>
          {isActiveChild && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-primary/60 rounded-r-full"></div>
          )}
        </button>
        <div
          className={cn(
            "overflow-hidden transition-all duration-500 ease-in-out",
            isOpen ? "max-h-[1000px] opacity-100 mt-2" : "max-h-0 opacity-0"
          )}
        >
          <div className="space-y-1 ml-4 border-l-2 border-primary/20 pl-4">
            {item.children?.map((child, index) => (
              <NavItemComponent key={index} item={child} level={level + 1} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Only mark as active if it's an exact match
  const isLinkActive = item.href && pathname === item.href;

  return (
    <Link
      href={item.href || "#"}
      className={cn(
        "group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
        "hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5",
        "hover:shadow-md hover:shadow-primary/5 hover:-translate-x-1",
        isLinkActive
          ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/30"
          : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
      )}
      style={{ paddingLeft: `${1 + level * 1.25}rem` }}
    >
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 flex-shrink-0",
        isLinkActive
          ? "bg-white/20 backdrop-blur-sm"
          : "bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/20"
      )}>
        <div className={cn(
          "transition-transform duration-300",
          isLinkActive ? "scale-110" : "scale-100 group-hover:scale-110"
        )}>
          {item.icon}
        </div>
      </div>
      <span className="flex-1 font-medium text-left">{item.title}</span>
      {isLinkActive && (
        <>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/50 rounded-r-full"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-xl opacity-50"></div>
        </>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [branding, setBranding] = useState<BrandingSettings | null>(null);

  useEffect(() => {
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

  const dashboardLogo = branding?.dashboardLogo || "/logo.png";
  const dashboardLogoRequiresOptimization = !dashboardLogo.startsWith("data:");

  // Find which parent item should be open based on current pathname
  useEffect(() => {
    const activeParent = navItems.find(item => {
      if (!item.children) return false;
      return item.children.some(child => {
        if (!child.href) return false;
        return pathname === child.href || pathname.startsWith(child.href + "/");
      });
    });
    
    if (activeParent) {
      setOpenItem(activeParent.title);
    }
  }, [pathname]);

  const handleToggle = (itemTitle: string) => {
    // If clicking the same item, toggle it. Otherwise, close all and open the clicked one
    if (openItem === itemTitle) {
      setOpenItem(null);
    } else {
      setOpenItem(itemTitle);
    }
  };

  return (
    <div className="flex h-screen w-72 flex-col border-r border-gray-200 dark:border-gray-800 bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-900/50 dark:to-gray-900 shadow-xl">
      {/* Modern Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative flex h-24 items-center justify-between px-6 border-b border-gray-200/50 dark:border-gray-800/50">
          <Link href="/dashboard" className="flex items-center group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Image
                src={dashboardLogo}
                alt="EstateBANK.in Admin"
                width={140}
                height={50}
                className="h-10 w-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
                priority
                unoptimized={!dashboardLogoRequiresOptimization}
              />
            </div>
          </Link>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all duration-300 text-primary hover:scale-110 hover:shadow-lg hover:shadow-primary/20 group"
            title="View Website"
          >
            <Globe className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/30">
        <div className="space-y-1">
          {navItems.map((item, index) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = hasChildren && openItem === item.title;
            
            return (
              <NavItemComponent 
                key={index} 
                item={item}
                isOpen={isOpen}
                onToggle={hasChildren ? () => handleToggle(item.title) : undefined}
                openKey={item.title}
              />
            );
          })}
        </div>
      </nav>

      {/* Bottom Decoration */}
      <div className="h-2 bg-gradient-to-r from-transparent via-primary/10 to-transparent"></div>
    </div>
  );
}
