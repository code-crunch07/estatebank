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
import { Plus, Edit, Trash2, RefreshCw, Image as ImageIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { X } from "lucide-react";
import { MediaSelector } from "@/components/media-selector";
import { toast } from "sonner";
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

interface PropertyType {
  _id: string;
  name: string;
  description?: string;
  image?: string;
}

export default function PropertyTypesPage() {
  const [types, setTypes] = useState<PropertyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<PropertyType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<PropertyType | null>(null);
  const [key, setKey] = useState(0); // Key to force form reset

  // Fetch types
  const fetchTypes = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/property-types');
      const data = await response.json();
      if (data.success && data.data) {
        // API returns { types: [...], count, total, hasMore }
        const typesArray = data.data.types || (Array.isArray(data.data) ? data.data : []);
        setTypes(typesArray);
      } else {
        setTypes([]);
      }
    } catch (error) {
      console.error('Error fetching property types:', error);
      toast.error('Failed to load property types');
      setTypes([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleEdit = (type: PropertyType) => {
    setEditingType(type);
    setIsDialogOpen(true);
  };

  const handleDelete = (type: PropertyType) => {
    setTypeToDelete(type);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!typeToDelete) return;

    try {
      const response = await fetch(`/api/property-types/${typeToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Property type deleted successfully");
        fetchTypes();
      } else {
        toast.error(data.error || "Failed to delete property type");
      }
      setDeleteDialogOpen(false);
      setTypeToDelete(null);
    } catch (error) {
      console.error('Error deleting property type:', error);
      toast.error("Failed to delete property type");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Property Types</h1>
          <p className="text-xs text-muted-foreground">Manage property types</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingType(null);
              // Reset form when dialog closes
              setKey((prev) => prev + 1);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditingType(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingType ? "Edit Property Type" : "Add Property Type"}</DialogTitle>
              <DialogDescription>
                {editingType ? "Update property type details" : "Create a new property type"}
              </DialogDescription>
            </DialogHeader>
            <TypeForm 
              key={key} 
              type={editingType}
              onSuccess={async (data) => {
                try {
                  if (editingType) {
                    const response = await fetch(`/api/property-types/${editingType._id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                    const result = await response.json();
                    if (result.success) {
                      toast.success("Property type updated successfully");
                      fetchTypes();
                    } else {
                      toast.error(result.error || "Failed to update property type");
                    }
                  } else {
                    const response = await fetch('/api/property-types', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                    const result = await response.json();
                    if (result.success) {
                      toast.success("Property type added successfully");
                      fetchTypes();
                    } else {
                      toast.error(result.error || "Failed to add property type");
                    }
                  }
                  setIsDialogOpen(false);
                  setEditingType(null);
                } catch (error) {
                  console.error('Error saving property type:', error);
                  toast.error("Failed to save property type");
                }
              }}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingType(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Property Types</CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : `${types.length} types configured`}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTypes}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Loading property types...
                  </TableCell>
                </TableRow>
              ) : types.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No property types found. Add a new type to get started.
                  </TableCell>
                </TableRow>
              ) : (
                types.map((type) => (
                  <TableRow key={type._id}>
                  <TableCell>
                    {type.image ? (
                      <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                        <Image
                          src={type.image}
                          alt={type.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>{type.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(type)} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(type)} title="Delete">
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
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{typeToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setTypeToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TypeForm({ 
  type, 
  onSuccess,
  onCancel
}: { 
  type?: PropertyType | null;
  onSuccess: (data: { name: string; description: string; image: string }) => void;
  onCancel?: () => void;
}) {
  const [formData, setFormData] = useState({
    name: type?.name || "",
    description: type?.description || "",
    image: type?.image || "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(type?.image || "");
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

  // Reset form when component mounts or type changes
  useEffect(() => {
    setFormData({
      name: type?.name || "",
      description: type?.description || "",
      image: type?.image || "",
    });
    setSelectedFile(null);
    setPreview(type?.image || "");
  }, [type]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
        const result = reader.result as string;
        setPreview(result);
        setFormData({ ...formData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreview("");
    setFormData({ ...formData, image: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a type name");
      return;
    }
    onSuccess(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Type Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter type name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter description"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        {preview ? (
          <div className="space-y-2">
            <div className="relative w-full h-48 rounded-md overflow-hidden border">
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
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.getElementById("image-input") as HTMLInputElement;
                input?.click();
              }}
            >
              Replace Image
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap items-center">
              <Input
                id="image-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer flex-1 min-w-[140px]"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMediaSelectorOpen(true)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Media Library</span>
              </Button>
              <span className="text-xs text-muted-foreground whitespace-nowrap">OR</span>
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
                className="flex-1 min-w-[200px]"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Upload an image (Max 5MB), select from media library, or enter an image URL
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
          }}
          type="image"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel || (() => {})}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
