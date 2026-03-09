"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Search,
  Trash2,
  Image as ImageIcon,
  File,
  Download,
  Eye,
  Grid3x3,
  List,
  Filter,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

export default function MediaLibraryPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "file">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);

  // Collect all media from various sources
  useEffect(() => {
    const collectMedia = async () => {
      setIsLoading(true);
      try {
        const allMedia: MediaItem[] = [];

        // Collect from Properties
        try {
          const propertiesResponse = await fetch("/api/properties").catch(() => null);
          if (propertiesResponse && propertiesResponse.ok) {
            const propertiesData = await propertiesResponse.json();
            const properties = Array.isArray(propertiesData.data) ? propertiesData.data : [];
            
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
                      size: 0, // Size not available from API
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
            const banners = Array.isArray(bannersData.data) ? bannersData.data : [];
            
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
            const members = Array.isArray(teamData.data) ? teamData.data : [];
            
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
          const branding = localStorage.getItem("brandingSettings");
          if (branding) {
            const brandingData = JSON.parse(branding);
            if (brandingData.headerLogo && typeof brandingData.headerLogo === "string" && 
                (brandingData.headerLogo.startsWith("data:") || brandingData.headerLogo.startsWith("/") || brandingData.headerLogo.startsWith("http"))) {
              allMedia.push({
                id: "branding-header-logo",
                url: brandingData.headerLogo,
                name: "Header Logo",
                type: "image",
                size: 0,
                usedIn: ["Website Header"],
                uploadedAt: new Date().toISOString(),
                source: "branding",
              });
            }
            if (brandingData.dashboardLogo && typeof brandingData.dashboardLogo === "string" && 
                (brandingData.dashboardLogo.startsWith("data:") || brandingData.dashboardLogo.startsWith("/") || brandingData.dashboardLogo.startsWith("http"))) {
              allMedia.push({
                id: "branding-dashboard-logo",
                url: brandingData.dashboardLogo,
                name: "Dashboard Logo",
                type: "image",
                size: 0,
                usedIn: ["Dashboard"],
                uploadedAt: new Date().toISOString(),
                source: "branding",
              });
            }
            if (brandingData.favicon && typeof brandingData.favicon === "string" && 
                (brandingData.favicon.startsWith("data:") || brandingData.favicon.startsWith("/") || brandingData.favicon.startsWith("http"))) {
              allMedia.push({
                id: "branding-favicon",
                url: brandingData.favicon,
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
        toast.error("Failed to load media library");
      } finally {
        setIsLoading(false);
      }
    };

    collectMedia();
  }, []);

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

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newMedia: MediaItem[] = [];

    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          const mediaItem: MediaItem = {
            id: `upload-${Date.now()}-${Math.random()}`,
            url: base64,
            name: file.name,
            type: "image",
            size: file.size,
            usedIn: [],
            uploadedAt: new Date().toISOString(),
            source: "upload",
          };
          setMediaItems((prev) => [...prev, mediaItem]);
          toast.success(`${file.name} uploaded successfully`);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error(`${file.name} is not an image file`);
      }
    }
  };

  const handleDelete = (media: MediaItem) => {
    setMediaToDelete(media);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!mediaToDelete) return;

    setMediaItems((prev) => prev.filter((item) => item.id !== mediaToDelete.id));
    toast.success("Media deleted successfully");
    setDeleteDialogOpen(false);
    setMediaToDelete(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "Unknown";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all media files used across your website
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="upload-media" className="cursor-pointer">
            <Button asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Upload Media
              </span>
            </Button>
            <Input
              id="upload-media"
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
          </Label>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>

      {/* Media Display */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading media library...</p>
          </CardContent>
        </Card>
      ) : filteredMedia.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No media files found</p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                {item.type === "image" ? (
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    unoptimized={item.url.startsWith("data:")}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <File className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedMedia(item);
                      setIsPreviewOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-xs font-medium truncate" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                  {item.size > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(item.size)}
                    </span>
                  )}
                </div>
                {item.usedIn.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1 truncate" title={item.usedIn.join(", ")}>
                    Used in: {item.usedIn[0]}
                    {item.usedIn.length > 1 && ` +${item.usedIn.length - 1}`}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Used In</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedia.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.type === "image" ? (
                      <div className="relative w-16 h-16 rounded overflow-hidden">
                        <Image
                          src={item.url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized={item.url.startsWith("data:")}
                        />
                      </div>
                    ) : (
                      <File className="h-8 w-8 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell>{formatFileSize(item.size)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {item.usedIn.slice(0, 2).map((use, idx) => (
                        <span key={idx} className="text-xs text-muted-foreground">
                          {use}
                        </span>
                      ))}
                      {item.usedIn.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{item.usedIn.length - 2} more
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(item.uploadedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedMedia(item);
                          setIsPreviewOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedMedia?.name}</DialogTitle>
          </DialogHeader>
          {selectedMedia && (
            <div className="space-y-4">
              {selectedMedia.type === "image" && (
                <div className="relative w-full h-[500px] rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={selectedMedia.url}
                    alt={selectedMedia.name}
                    fill
                    className="object-contain"
                    unoptimized={selectedMedia.url.startsWith("data:")}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Type</p>
                  <p className="text-muted-foreground">{selectedMedia.type}</p>
                </div>
                <div>
                  <p className="font-medium">Size</p>
                  <p className="text-muted-foreground">{formatFileSize(selectedMedia.size)}</p>
                </div>
                <div>
                  <p className="font-medium">Source</p>
                  <p className="text-muted-foreground capitalize">{selectedMedia.source}</p>
                </div>
                <div>
                  <p className="font-medium">Uploaded</p>
                  <p className="text-muted-foreground">{formatDate(selectedMedia.uploadedAt)}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-medium">Used In</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedMedia.usedIn.map((use, idx) => (
                      <Badge key={idx} variant="secondary">
                        {use}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{mediaToDelete?.name}&quot;? This action cannot be undone.
              Note: This will only remove it from the media library view, not from where it&apos;s being used.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
