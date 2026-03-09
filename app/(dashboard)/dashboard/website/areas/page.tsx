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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, X, Image as ImageIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HomepageArea } from "@/lib/data-store";
import { toast } from "sonner";
import Image from "next/image";

interface HomepageAreaApi {
  _id: string;
  name: string;
  description?: string;
  image: string;
  link?: string;
  order: number;
  status: string;
}

export default function HomepageAreasPage() {
  const [areas, setAreas] = useState<HomepageAreaApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<HomepageAreaApi | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<HomepageAreaApi | null>(null);

  const loadAreas = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/homepage-areas');
      const data = await response.json();
      if (data.success && data.data) {
        setAreas(Array.isArray(data.data) ? data.data : []);
      } else {
        setAreas([]);
      }
    } catch (error) {
      console.error('Error loading areas:', error);
      toast.error('Failed to load areas');
      setAreas([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  const filteredAreas = areas.filter(
    (area) =>
      area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (area: HomepageAreaApi) => {
    setEditingArea(area);
    setIsDialogOpen(true);
  };

  const handleDelete = (area: HomepageAreaApi) => {
    setAreaToDelete(area);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!areaToDelete) return;
    
    try {
      const response = await fetch(`/api/homepage-areas/${areaToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Area deleted successfully");
        loadAreas();
        setDeleteDialogOpen(false);
        setAreaToDelete(null);
      } else {
        toast.error(data.error || "Failed to delete area");
      }
    } catch (error) {
      console.error('Error deleting area:', error);
      toast.error("Failed to delete area");
    }
  };

  const handleSuccess = () => {
    loadAreas();
    setIsDialogOpen(false);
    setEditingArea(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Homepage Areas</h1>
          <p className="text-sm text-muted-foreground">
            Manage areas displayed on the homepage after the hero banner
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingArea(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Area
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArea ? "Edit Area" : "Add Area"}
              </DialogTitle>
              <DialogDescription>
                {editingArea
                  ? "Update area information"
                  : "Create a new area to display on the homepage"}
              </DialogDescription>
            </DialogHeader>
            <AreaForm
              area={editingArea}
              onSuccess={handleSuccess}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingArea(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search areas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Areas</CardTitle>
          <CardDescription>
            {filteredAreas.length} area(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAreas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No areas found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAreas.map((area) => (
                  <TableRow key={area._id}>
                    <TableCell>
                      <div className="relative h-16 w-16 rounded-md overflow-hidden">
                        <Image
                          src={area.image}
                          alt={area.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{area.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {area.description || "-"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {area.link || "-"}
                    </TableCell>
                    <TableCell>{area.order}</TableCell>
                    <TableCell>
                      <Badge
                        variant={area.status === "Active" ? "default" : "secondary"}
                      >
                        {area.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(area)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(area)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Area</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{areaToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setAreaToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AreaForm({
  area,
  onSuccess,
  onCancel,
}: {
  area: HomepageAreaApi | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    link: "",
    order: 1,
    status: "Active" as "Active" | "Inactive",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

  useEffect(() => {
    if (area) {
      setFormData({
        name: area.name,
        description: area.description || "",
        image: area.image,
        link: area.link || "",
        order: area.order,
        status: (area.status || "Active") as "Active" | "Inactive",
      });
      setPreview(area.image);
    }
  }, [area]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreview("");
    setFormData({ ...formData, image: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Please enter area name");
      return;
    }

    let imageUrl = formData.image;

    // If a new file is selected, convert to base64
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        imageUrl = reader.result as string;
        saveArea(imageUrl);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      saveArea(imageUrl);
    }
  };

  const saveArea = async (imageUrl: string) => {
    try {
      if (area) {
        // Update existing area
        const response = await fetch(`/api/homepage-areas/${area._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            image: imageUrl,
            link: formData.link,
            order: formData.order,
            status: formData.status,
          }),
        });
        const result = await response.json();
        if (result.success) {
          toast.success("Area updated successfully");
          onSuccess();
        } else {
          toast.error(result.error || "Failed to update area");
        }
      } else {
        // Create new area
        const response = await fetch('/api/homepage-areas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description || undefined,
            image: imageUrl,
            link: formData.link || undefined,
            order: formData.order,
            status: formData.status,
          }),
        });
        const result = await response.json();
        if (result.success) {
          toast.success("Area added successfully");
          onSuccess();
        } else {
          toast.error(result.error || "Failed to add area");
        }
      }
    } catch (error) {
      console.error('Error saving area:', error);
      toast.error("Failed to save area");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Area Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter area name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Enter area description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image *</Label>
        {preview ? (
          <div className="space-y-2">
            <div className="relative mt-2 w-32 h-32 rounded-md overflow-hidden border">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer flex-1"
              />
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
                id="image-url"
                type="url"
                value={formData.image}
                onChange={(e) => {
                  const newImage = e.target.value;
                  setFormData({ ...formData, image: newImage });
                  setPreview(newImage);
                  setSelectedFile(null);
                }}
                placeholder="Enter image URL"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Upload an image (max 5MB), select from media library, or enter an image URL
            </p>
          </div>
        )}
        <MediaSelector
          open={isMediaSelectorOpen}
          onOpenChange={setIsMediaSelectorOpen}
          onSelect={(url: string) => {
            setFormData({ ...formData, image: url });
            setPreview(url);
            setSelectedFile(null);
          }}
          type="image"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="link">Link URL</Label>
        <Input
          id="link"
          type="url"
          value={formData.link}
          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          placeholder="e.g., /properties?location=Mumbai"
        />
        <p className="text-xs text-muted-foreground">
          Optional link when area is clicked (e.g., /properties?location=Mumbai)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="order">Display Order</Label>
          <Input
            id="order"
            type="number"
            min="1"
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: parseInt(e.target.value) || 1 })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: "Active" | "Inactive") =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}

