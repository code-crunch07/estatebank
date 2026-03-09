"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Upload, X, RefreshCw, Image as ImageIcon } from "lucide-react";
import { MediaSelector } from "@/components/media-selector";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DataStore, HeroImage, Property } from "@/lib/data-store";
import { toast } from "sonner";
import Image from "next/image";

interface HeroImageApi {
  _id: string;
  type: "property" | "banner";
  propertyId?: string;
  image?: string;
  linkUrl?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  order: number;
  status: "Active" | "Inactive";
}

export default function BannerPage() {
  const [heroImages, setHeroImages] = useState<HeroImageApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<HeroImageApi | null>(null);

  const fetchHeroImages = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/hero-images');
      const data = await response.json();
      if (data.success && data.data) {
        setHeroImages(Array.isArray(data.data) ? data.data : []);
      } else {
        setHeroImages([]);
      }
    } catch (error) {
      console.error('Error fetching hero images:', error);
      toast.error('Failed to load hero images');
      setHeroImages([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHeroImages();
  }, []);

  const handleSave = async (imageData: Partial<HeroImageApi>) => {
    try {
      if (editingImage) {
        // Update existing
        const response = await fetch(`/api/hero-images/${editingImage._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: imageData.type,
            propertyId: imageData.propertyId,
            image: imageData.image,
            linkUrl: imageData.linkUrl,
            title: imageData.title,
            description: imageData.description,
            buttonText: imageData.buttonText,
            order: imageData.order,
            status: imageData.status,
          }),
        });
        const result = await response.json();
        if (result.success) {
          toast.success("Image updated successfully");
          fetchHeroImages();
        } else {
          const errorMessage = typeof result.error === 'string' ? result.error : result.error?.message || "Failed to update image";
          toast.error(errorMessage);
        }
      } else {
        // Create new
        const response = await fetch('/api/hero-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: imageData.type || "property",
            propertyId: imageData.propertyId,
            image: imageData.image,
            linkUrl: imageData.linkUrl,
            title: imageData.title,
            description: imageData.description,
            buttonText: imageData.buttonText,
            order: imageData.order || heroImages.length + 1,
            status: imageData.status || "Active",
          }),
        });
        const result = await response.json();
        if (result.success) {
          toast.success("Image added successfully");
          fetchHeroImages();
        } else {
          const errorMessage = typeof result.error === 'string' ? result.error : result.error?.message || "Failed to add image";
          toast.error(errorMessage);
        }
      }
      setIsDialogOpen(false);
      setEditingImage(null);
    } catch (error) {
      console.error('Error saving hero image:', error);
      toast.error("Failed to save image");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/hero-images/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Image deleted successfully");
        fetchHeroImages();
      } else {
        const errorMessage = typeof data.error === 'string' ? data.error : data.error?.message || "Failed to delete image";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting hero image:', error);
      toast.error("Failed to delete image");
    }
  };

  const handleEdit = (image: HeroImageApi) => {
    setEditingImage(image);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Hero Background Images</h1>
          <p className="text-xs text-muted-foreground">
            Manage background images for the homepage hero slider
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingImage(null);
          }}
        >
          <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchHeroImages}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingImage(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add to Slideshow
            </Button>
          </DialogTrigger>
        </div>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingImage ? "Edit Slideshow Item" : "Add to Slideshow"}</DialogTitle>
              <DialogDescription>
                {editingImage
                  ? "Update slideshow item"
                  : "Add a property or promotion banner to the homepage slideshow"}
              </DialogDescription>
            </DialogHeader>
            <HeroImageForm
              image={editingImage}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingImage(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hero Background Images</CardTitle>
          <CardDescription>
            {heroImages.filter((img) => img.status === "Active").length} active images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : heroImages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No items added to slideshow.
                  </TableCell>
                </TableRow>
              ) : (
                heroImages
                  .sort((a, b) => a.order - b.order)
                  .map((heroImage) => {
                    if (heroImage.type === "property" && heroImage.propertyId) {
                      // For property type, we'd need to fetch property details
                      // For now, show basic info
                      return (
                        <TableRow key={heroImage._id}>
                          <TableCell>
                            <Badge variant="default">Property</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <span className="text-sm font-medium">
                                Property ID: {typeof heroImage.propertyId === 'object' 
                                  ? (heroImage.propertyId as any)?._id?.toString() || (heroImage.propertyId as any)?.id?.toString() || 'N/A'
                                  : heroImage.propertyId?.toString() || 'N/A'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="relative h-16 w-32 bg-muted rounded overflow-hidden">
                              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                                Property Image
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">Property</span>
                          </TableCell>
                          <TableCell>{heroImage.order}</TableCell>
                          <TableCell>
                            <Badge variant={heroImage.status === "Active" ? "default" : "secondary"}>
                              {heroImage.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(heroImage)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(heroImage._id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    } else {
                      // Banner type
                      return (
                        <TableRow key={heroImage._id}>
                          <TableCell>
                            <Badge variant="outline">Promotion Banner</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <span className="text-sm font-medium">Promotion Banner</span>
                              {heroImage.linkUrl && (
                                <p className="text-xs text-muted-foreground truncate max-w-xs">{heroImage.linkUrl}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="relative h-16 w-32 bg-muted rounded overflow-hidden">
                              {heroImage.image ? (
                                <Image
                                  src={heroImage.image}
                                  alt="Promotion Banner"
                                  fill
                                  className="object-cover"
                                  unoptimized={heroImage.image?.startsWith("data:")}
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                                  No image
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{heroImage.linkUrl ? "Has link" : "No link"}</span>
                          </TableCell>
                          <TableCell>{heroImage.order}</TableCell>
                          <TableCell>
                            <Badge variant={heroImage.status === "Active" ? "default" : "secondary"}>
                              {heroImage.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(heroImage)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(heroImage._id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function HeroImageForm({
  image,
  onSave,
  onCancel,
}: {
  image: HeroImageApi | null;
  onSave: (data: Partial<HeroImageApi>) => void;
  onCancel: () => void;
}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [formData, setFormData] = useState({
    type: image?.type || ("property" as "property" | "banner"),
    propertyId: image?.propertyId || undefined,
    image: image?.image || "",
    linkUrl: image?.linkUrl || "",
    title: image?.title || "",
    description: image?.description || "",
    buttonText: image?.buttonText || "",
    order: image?.order || 1,
    status: image?.status || ("Active" as "Active" | "Inactive"),
  });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(image?.image || null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

  useEffect(() => {
    // Fetch properties from API
    const fetchProperties = async () => {
      setIsLoadingProperties(true);
      try {
        const response = await fetch('/api/properties?lightweight=true');
        const data = await response.json();
        
        console.log('[Banner] Properties API response:', data);
        
        // Handle different response formats
        let allProperties: any[] = [];
        if (data.success) {
          if (Array.isArray(data.data)) {
            allProperties = data.data;
          } else if (data.data && Array.isArray(data.data.properties)) {
            allProperties = data.data.properties;
          } else if (data.data && typeof data.data === 'object') {
            // If data.data is an object with properties array
            allProperties = (data.data as any).properties || [];
          }
        }
        
        console.log('[Banner] Parsed properties:', allProperties.length);
        
        if (allProperties.length > 0) {
          setProperties(allProperties as Property[]);
          
          if (image?.propertyId) {
            // propertyId might be an object (populated) or string
            const propertyIdStr = typeof image.propertyId === 'object' 
              ? (image.propertyId as any)?._id?.toString() || (image.propertyId as any)?.id?.toString()
              : image.propertyId?.toString();
            if (propertyIdStr) {
              const property = allProperties.find((p: any) => {
                const pId = p._id?.toString() || p.id?.toString();
                return pId === propertyIdStr;
              });
              setSelectedProperty(property || null);
            }
          }
        } else {
          console.warn('[Banner] No properties found in API response');
          setProperties([]);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error('Failed to load properties');
        setProperties([]);
      } finally {
        setIsLoadingProperties(false);
      }
    };
    
    fetchProperties();
    
    if (image?.image) {
      setPreview(image.image);
    }
  }, [image]);

  // Reset form when editing image changes
  useEffect(() => {
    if (image) {
      setFormData({
        type: image.type || "property",
        propertyId: image.propertyId,
        image: image.image || "",
        linkUrl: image.linkUrl || "",
        title: image.title || "",
        description: image.description || "",
        buttonText: image.buttonText || "",
        order: image.order || 1,
        status: image.status || "Active",
      });
      setPreview(image.image || null);
      setSelectedFile(null);
      setIsUploaded(false);
      if (image.propertyId && properties.length > 0) {
        // propertyId might be an object (populated) or string
        const propertyIdStr = typeof image.propertyId === 'object' 
          ? (image.propertyId as any)._id?.toString() || (image.propertyId as any).id?.toString()
          : image.propertyId?.toString();
        const property = properties.find((p: any) => {
          const pId = p._id?.toString() || p.id?.toString();
          return pId === propertyIdStr;
        });
        setSelectedProperty(property || null);
      } else {
        setSelectedProperty(null);
      }
    } else {
      setFormData({
        type: "property",
        propertyId: undefined,
        image: "",
        linkUrl: "",
        title: "",
        description: "",
        buttonText: "",
        order: 1,
        status: "Active",
      });
      setPreview(null);
      setSelectedFile(null);
      setIsUploaded(false);
      setSelectedProperty(null);
    }
  }, [image, properties]);

  const handleTypeChange = (type: "property" | "banner") => {
    setFormData({ ...formData, type, propertyId: undefined, image: "", linkUrl: "" });
    setSelectedProperty(null);
    setPreview(null);
    setSelectedFile(null);
    setIsUploaded(false);
  };

  const handlePropertyChange = (propertyId: string) => {
    // Keep as string for MongoDB ObjectId
    setFormData({ ...formData, propertyId: propertyId || undefined });
    // Find property by _id (MongoDB) or id (legacy)
    const property = properties.find((p: any) => {
      const pId = p._id?.toString() || p.id?.toString();
      return pId === propertyId;
    });
    setSelectedProperty(property || null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setIsUploaded(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        setFormData((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreview(null);
    setIsUploaded(false);
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.type === "property" && !formData.propertyId) {
      toast.error("Please select a property");
      return;
    }
    if (formData.type === "banner" && !formData.image) {
      toast.error("Please upload a banner image");
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Type *</Label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => handleTypeChange(e.target.value as "property" | "banner")}
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
        >
          <option value="property">Property</option>
          <option value="banner">Promotion Banner</option>
        </select>
      </div>

      {formData.type === "property" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="property">Select Property *</Label>
            <select
              id="property"
              value={formData.propertyId || ""}
              onChange={(e) => handlePropertyChange(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              required
              disabled={isLoadingProperties}
            >
              <option value="">
                {isLoadingProperties ? "Loading properties..." : "Select a property"}
              </option>
              {properties.length > 0 ? (
                properties.map((property, index) => {
                  const propertyId = (property as any)._id?.toString() || property.id?.toString() || `property-${index}`;
                  const propertyName = property.name || 'Unnamed Property';
                  const propertyLocation = property.location || 'Location not specified';
                  return (
                    <option key={propertyId} value={propertyId}>
                      {propertyName} - {propertyLocation}
                    </option>
                  );
                })
              ) : !isLoadingProperties ? (
                <option value="" disabled>No properties available</option>
              ) : null}
            </select>
            <p className="text-xs text-muted-foreground">
              The selected property&apos;s images will be used in the homepage slideshow
            </p>
          </div>

          {selectedProperty && (
            <div className="space-y-2 p-4 border rounded-md bg-muted/50">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-semibold">{selectedProperty.name}</span>
                  <p className="text-xs text-muted-foreground">{selectedProperty.location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    This property has {selectedProperty.images?.length || 0} image(s) that will be displayed in the slideshow
                  </p>
                </div>
                {selectedProperty.images && selectedProperty.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selectedProperty.images.slice(0, 3).map((img, idx) => (
                      <div key={idx} className="relative h-20 bg-muted rounded overflow-hidden">
                        <Image
                          src={img}
                          alt={`${selectedProperty.name} ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {selectedProperty.images.length > 3 && (
                      <div className="relative h-20 bg-muted rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">+{selectedProperty.images.length - 3} more</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="banner-image">Upload Banner Image *</Label>
            {preview ? (
      <div className="space-y-2">
                <div className="relative">
                  <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden border border-input">
                    <Image
                      src={preview}
                      alt="Banner Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {!isUploaded && (
                  <div className="flex items-center gap-4">
                    <Input
                      id="banner-image-replace"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="banner-image-replace"
                      className="flex items-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent transition-colors w-full text-sm"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Replace image</span>
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="banner-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="banner-image"
                    className="flex items-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent transition-colors flex-1"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{selectedFile ? selectedFile.name : "Choose banner image"}</span>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsMediaSelectorOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Media Library</span>
                  </Button>
                  <span className="text-xs text-muted-foreground self-center">OR</span>
                  <Input
                    id="banner-image-url"
                    type="url"
                    value={formData.image}
                    onChange={(e) => {
                      const newImage = e.target.value;
                      setFormData({ ...formData, image: newImage });
                      setPreview(newImage);
                      setSelectedFile(null);
                      setIsUploaded(false);
                    }}
                    placeholder="Enter image URL"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload an image (Max 5MB), select from media library, or enter an image URL. Supported formats: JPG, PNG, GIF, WebP
                </p>
              </div>
            )}
            <MediaSelector
              open={isMediaSelectorOpen}
              onOpenChange={setIsMediaSelectorOpen}
              onSelect={(url) => {
                setFormData({ ...formData, image: url });
                setPreview(url);
                setSelectedFile(null);
                setIsUploaded(false);
              }}
              type="image"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter banner title"
            />
            <p className="text-xs text-muted-foreground">
              Main heading text displayed on the banner
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter banner description"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Subtitle or description text displayed on the banner
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonText">Button Text (Optional)</Label>
            <Input
              id="buttonText"
              type="text"
              value={formData.buttonText}
              onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
              placeholder="e.g., Learn More, Shop Now, Get Started"
            />
            <p className="text-xs text-muted-foreground">
              Text displayed on the call-to-action button
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkUrl">Link URL (Optional)</Label>
            <Input
              id="linkUrl"
              type="url"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              placeholder="https://example.com/promotion"
            />
            <p className="text-xs text-muted-foreground">
              When users click on this banner or button, they will be redirected to this URL
            </p>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="order">Display Order</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
            min="1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })
            }
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Image</Button>
      </div>
    </form>
  );
}
