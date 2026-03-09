"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  X,
  Grid3x3,
  List,
  Filter,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import Image from "next/image";

interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: "image" | "file";
  size: number;
  usedIn: string[];
  uploadedAt: string;
  source: string;
}

interface MediaSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  type?: "image" | "file" | "all";
  multiple?: boolean;
}

export function MediaSelector({
  open,
  onOpenChange,
  onSelect,
  type = "image",
  multiple = false,
}: MediaSelectorProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "file">(type === "all" ? "all" : type);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Collect all media from various sources
  useEffect(() => {
    if (!open) return;

    const collectMedia = async () => {
      setIsLoading(true);
      try {
        const allMedia: MediaItem[] = [];

        // Collect from Properties
        try {
          const propertiesResponse = await fetch("/api/properties").catch(() => null);
          if (propertiesResponse && propertiesResponse.ok) {
            const propertiesData = await propertiesResponse.json();
            // Handle different response formats
            let properties: any[] = [];
            if (propertiesData.success && propertiesData.data) {
              properties = Array.isArray(propertiesData.data) ? propertiesData.data : [];
            } else if (Array.isArray(propertiesData.data)) {
              properties = propertiesData.data;
            } else if (Array.isArray(propertiesData)) {
              properties = propertiesData;
            }
            
            if (Array.isArray(properties)) {
              properties.forEach((property: any) => {
              // Property images
              if (property.images && Array.isArray(property.images)) {
                property.images.forEach((img: string, index: number) => {
                  if (img && typeof img === "string") {
                    allMedia.push({
                      id: `property-${property._id || property.id}-img-${index}`,
                      url: img,
                      name: `${property.name || "Property"} - Image ${index + 1}`,
                      type: "image",
                      size: 0,
                      usedIn: [`Property: ${property.name || "Unknown"}`],
                      uploadedAt: property.createdAt || new Date().toISOString(),
                      source: "properties",
                    });
                  }
                });
              }

              // Floor plans
              if (property.floorPlans && Array.isArray(property.floorPlans)) {
                property.floorPlans.forEach((plan: string, index: number) => {
                  if (plan && typeof plan === "string") {
                    allMedia.push({
                      id: `property-${property._id || property.id}-floor-${index}`,
                      url: plan,
                      name: `${property.name || "Property"} - Floor Plan ${index + 1}`,
                      type: "image",
                      size: 0,
                      usedIn: [`Property: ${property.name || "Unknown"}`],
                      uploadedAt: property.createdAt || new Date().toISOString(),
                      source: "properties",
                    });
                  }
                });
              }
            });
            }
          }
        } catch (error) {
          console.error("Error fetching properties:", error);
        }

        // Collect from Hero Images/Banners
        try {
          const bannersResponse = await fetch("/api/hero-images").catch(() => null);
          if (bannersResponse && bannersResponse.ok) {
            const bannersData = await bannersResponse.json();
            // Handle different response formats
            let banners: any[] = [];
            if (bannersData.success && bannersData.data) {
              banners = Array.isArray(bannersData.data) ? bannersData.data : [];
            } else if (Array.isArray(bannersData.data)) {
              banners = bannersData.data;
            } else if (Array.isArray(bannersData)) {
              banners = bannersData;
            }
            
            if (Array.isArray(banners)) {
              banners.forEach((banner: any) => {
              if (banner.image && typeof banner.image === "string") {
                allMedia.push({
                  id: `banner-${banner._id || banner.id}`,
                  url: banner.image,
                  name: `Banner - ${banner.type || "Unknown"}`,
                  type: "image",
                  size: 0,
                  usedIn: ["Homepage Banner"],
                  uploadedAt: banner.createdAt || new Date().toISOString(),
                  source: "banners",
                });
              }
            });
            }
          }
        } catch (error) {
          console.error("Error fetching banners:", error);
        }

        // Collect from Team Members
        try {
          const teamResponse = await fetch("/api/people/team").catch(() => null);
          if (teamResponse && teamResponse.ok) {
            const teamData = await teamResponse.json();
            // Handle different response formats
            let members: any[] = [];
            if (teamData.success && teamData.data) {
              members = Array.isArray(teamData.data) ? teamData.data : [];
            } else if (Array.isArray(teamData.data)) {
              members = teamData.data;
            } else if (Array.isArray(teamData)) {
              members = teamData;
            }
            
            if (Array.isArray(members)) {
              members.forEach((member: any) => {
              if (member.image && typeof member.image === "string") {
                allMedia.push({
                  id: `team-${member._id || member.id}`,
                  url: member.image,
                  name: `${member.name || "Team Member"} - Photo`,
                  type: "image",
                  size: 0,
                  usedIn: [`Team: ${member.name || "Unknown"}`],
                  uploadedAt: member.createdAt || new Date().toISOString(),
                  source: "team",
                });
              }
            });
            }
          }
        } catch (error) {
          console.error("Error fetching team:", error);
        }

        // Collect from Branding (logos)
        try {
          const brandingResponse = await fetch("/api/branding").catch(() => null);
          if (brandingResponse && brandingResponse.ok) {
            const brandingData = await brandingResponse.json();
            const branding = brandingData.data || {};
            
            if (branding.headerLogo && typeof branding.headerLogo === "string" && 
                (branding.headerLogo.startsWith("data:") || branding.headerLogo.startsWith("/") || branding.headerLogo.startsWith("http"))) {
              allMedia.push({
                id: "branding-header-logo",
                url: branding.headerLogo,
                name: "Header Logo",
                type: "image",
                size: 0,
                usedIn: ["Website Header"],
                uploadedAt: new Date().toISOString(),
                source: "branding",
              });
            }
            if (branding.dashboardLogo && typeof branding.dashboardLogo === "string" && 
                (branding.dashboardLogo.startsWith("data:") || branding.dashboardLogo.startsWith("/") || branding.dashboardLogo.startsWith("http"))) {
              allMedia.push({
                id: "branding-dashboard-logo",
                url: branding.dashboardLogo,
                name: "Dashboard Logo",
                type: "image",
                size: 0,
                usedIn: ["Dashboard"],
                uploadedAt: new Date().toISOString(),
                source: "branding",
              });
            }
            if (branding.favicon && typeof branding.favicon === "string" && 
                (branding.favicon.startsWith("data:") || branding.favicon.startsWith("/") || branding.favicon.startsWith("http"))) {
              allMedia.push({
                id: "branding-favicon",
                url: branding.favicon,
                name: "Favicon",
                type: "image",
                size: 0,
                usedIn: ["Website Favicon"],
                uploadedAt: new Date().toISOString(),
                source: "branding",
              });
            }
          }
        } catch (error) {
          console.error("Error fetching branding:", error);
        }

        // Collect from Homepage Areas
        try {
          const areasResponse = await fetch("/api/homepage-areas").catch(() => null);
          if (areasResponse && areasResponse.ok) {
            const areasData = await areasResponse.json();
            // Handle different response formats
            let areas: any[] = [];
            if (areasData.success && areasData.data) {
              areas = Array.isArray(areasData.data) ? areasData.data : [];
            } else if (Array.isArray(areasData.data)) {
              areas = areasData.data;
            } else if (Array.isArray(areasData)) {
              areas = areasData;
            }
            
            if (Array.isArray(areas)) {
              areas.forEach((area: any) => {
              if (area.image && typeof area.image === "string") {
                allMedia.push({
                  id: `area-${area._id || area.id}`,
                  url: area.image,
                  name: `${area.name || "Area"} - Image`,
                  type: "image",
                  size: 0,
                  usedIn: [`Homepage Area: ${area.name || "Unknown"}`],
                  uploadedAt: area.createdAt || new Date().toISOString(),
                  source: "areas",
                });
              }
            });
            }
          }
        } catch (error) {
          console.error("Error fetching areas:", error);
        }

        // Collect from Property Types
        try {
          const typesResponse = await fetch("/api/property-types").catch(() => null);
          if (typesResponse && typesResponse.ok) {
            const typesData = await typesResponse.json();
            // Handle different response formats
            let types: any[] = [];
            if (typesData.success && typesData.data) {
              // API returns { types: [...], count, total, hasMore }
              types = typesData.data.types || (Array.isArray(typesData.data) ? typesData.data : []);
            } else if (Array.isArray(typesData.data)) {
              types = typesData.data;
            } else if (Array.isArray(typesData)) {
              types = typesData;
            }
            
            if (Array.isArray(types)) {
              types.forEach((type: any) => {
              if (type.image && typeof type.image === "string") {
                allMedia.push({
                  id: `type-${type._id || type.id}`,
                  url: type.image,
                  name: `${type.name || "Property Type"} - Image`,
                  type: "image",
                  size: 0,
                  usedIn: [`Property Type: ${type.name || "Unknown"}`],
                  uploadedAt: type.createdAt || new Date().toISOString(),
                  source: "property-types",
                });
              }
            });
            }
          }
        } catch (error) {
          console.error("Error fetching property types:", error);
        }

        // Merge duplicates (same URL)
        const uniqueMedia = new Map<string, MediaItem>();
        allMedia.forEach((item) => {
          const existing = uniqueMedia.get(item.url);
          if (existing) {
            existing.usedIn = [...new Set([...existing.usedIn, ...item.usedIn])];
          } else {
            uniqueMedia.set(item.url, item);
          }
        });

        setMediaItems(Array.from(uniqueMedia.values()));
      } catch (error) {
        console.error("Error collecting media:", error);
      } finally {
        setIsLoading(false);
      }
    };

    collectMedia();
  }, [open]);

  // Filter media
  const filteredMedia = useMemo(() => {
    return mediaItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.usedIn.some((use) => use.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [mediaItems, searchTerm, typeFilter]);

  const handleSelect = (item: MediaItem) => {
    if (multiple) {
      if (selectedItems.includes(item.url)) {
        setSelectedItems(selectedItems.filter((url) => url !== item.url));
      } else {
        setSelectedItems([...selectedItems, item.url]);
      }
    } else {
      onSelect(item.url);
      onOpenChange(false);
    }
  };

  const handleConfirmMultiple = () => {
    selectedItems.forEach((url) => onSelect(url));
    setSelectedItems([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select from Media Library</DialogTitle>
          <DialogDescription>
            Browse and select images from your media library. You can search, filter by type, and view in grid or list mode.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images Only</SelectItem>
                <SelectItem value="file">Files Only</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Media Display */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Loading media library...</p>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="py-12 text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No media files found</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredMedia.map((item) => {
                  const isSelected = selectedItems.includes(item.url);
                  return (
                    <div
                      key={item.id}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                        isSelected ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleSelect(item)}
                    >
                      {item.type === "image" ? (
                        <Image
                          src={item.url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized={item.url.startsWith("data:")}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-muted">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary rounded-full p-2">
                            <Check className="h-6 w-6 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                        <p className="text-xs text-white truncate" title={item.name}>
                          {item.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMedia.map((item) => {
                  const isSelected = selectedItems.includes(item.url);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleSelect(item)}
                    >
                      <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                        {item.type === "image" ? (
                          <Image
                            src={item.url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized={item.url.startsWith("data:")}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-muted">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" title={item.name}>
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.usedIn[0]}
                            {item.usedIn.length > 1 && ` +${item.usedIn.length - 1}`}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {multiple && selectedItems.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""} selected
              </p>
              <Button onClick={handleConfirmMultiple}>
                Select {selectedItems.length} Item{selectedItems.length > 1 ? "s" : ""}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

