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
import { Plus, Edit, Trash2 } from "lucide-react";
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
import { toast } from "sonner";
import Image from "next/image";
import { Image as ImageIcon, X } from "lucide-react";
import { MediaSelector } from "@/components/media-selector";

interface TestimonialApi {
  _id: string;
  name: string;
  role: string;
  company: string;
  image: string;
  rating: number;
  text: string;
  status: string;
  createdAt: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialApi | null>(null);

  const fetchTestimonials = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/testimonials');
      const data = await response.json();
      if (data.success && data.data) {
        setTestimonials(Array.isArray(data.data) ? data.data : []);
      } else {
        setTestimonials([]);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
      setTestimonials([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSave = async (testimonialData: Partial<TestimonialApi>) => {
    try {
      if (editingTestimonial) {
        // Update existing
        const response = await fetch(`/api/testimonials/${editingTestimonial._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testimonialData),
        });
        const result = await response.json();
        if (result.success) {
          toast.success("Testimonial updated successfully");
          fetchTestimonials();
        } else {
          toast.error(result.error || "Failed to update testimonial");
        }
      } else {
        // Create new
        const response = await fetch('/api/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: testimonialData.name || "",
            role: testimonialData.role || "",
            company: testimonialData.company || "",
            image: testimonialData.image || "/logo.png",
            rating: testimonialData.rating || 5,
            text: testimonialData.text || "",
            status: testimonialData.status || "Published",
          }),
        });
        const result = await response.json();
        if (result.success) {
          toast.success("Testimonial added successfully");
          fetchTestimonials();
        } else {
          toast.error(result.error || "Failed to add testimonial");
        }
      }
      setIsDialogOpen(false);
      setEditingTestimonial(null);
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error("Failed to save testimonial");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Testimonial deleted successfully");
        fetchTestimonials();
      } else {
        toast.error(data.error || "Failed to delete testimonial");
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error("Failed to delete testimonial");
    }
  };

  const handleEdit = (testimonial: TestimonialApi) => {
    setEditingTestimonial(testimonial);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Testimonials</h1>
          <p className="text-xs text-muted-foreground">Manage customer testimonials</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingTestimonial(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
              </DialogTitle>
              <DialogDescription>
                {editingTestimonial
                  ? "Update testimonial information"
                  : "Add a new customer testimonial"}
              </DialogDescription>
            </DialogHeader>
            <TestimonialForm
              testimonial={editingTestimonial}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingTestimonial(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Testimonials</CardTitle>
          <CardDescription>{testimonials.length} testimonials found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Testimonial</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No testimonials found.
                  </TableCell>
                </TableRow>
              ) : (
                testimonials.map((testimonial) => (
                  <TableRow key={testimonial._id}>
                    <TableCell>
                      {testimonial.image ? (
                        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted">
                          <Image
                            src={testimonial.image}
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No image</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{testimonial.name}</TableCell>
                    <TableCell>{testimonial.role || "-"}</TableCell>
                    <TableCell>{testimonial.company || "-"}</TableCell>
                    <TableCell>
                      <span className="text-xs font-medium">{testimonial.rating}/5</span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{testimonial.text}</TableCell>
                    <TableCell>
                      <Badge
                        variant={testimonial.status === "Published" ? "default" : "secondary"}
                      >
                        {testimonial.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(testimonial)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(testimonial._id)}>
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
    </div>
  );
}

function TestimonialForm({
  testimonial,
  onSave,
  onCancel,
}: {
  testimonial: TestimonialApi | null;
  onSave: (data: Partial<TestimonialApi>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: testimonial?.name || "",
    role: testimonial?.role || "",
    company: testimonial?.company || "",
    image: testimonial?.image || "",
    rating: testimonial?.rating || 5,
    text: testimonial?.text || "",
    status: testimonial?.status || ("Published" as "Published" | "Draft"),
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(testimonial?.image || null);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

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
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        setFormData((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToStorage = async (base64: string): Promise<string> => {
    const res = await fetch('/api/upload/cloudinary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64, folder: 'testimonials' }),
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.data.url;
  };

  const handleImageUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
    setPreview(url);
    setSelectedFile(null);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreview(null);
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = formData.image;
    if (formData.image?.startsWith('data:image')) {
      try {
        imageUrl = await uploadImageToStorage(formData.image);
      } catch {
        toast.error("Failed to upload image, saving with base64");
      }
    }
    onSave({ ...formData, image: imageUrl || formData.image });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="Enter role (optional)"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Enter company (optional)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image">Image</Label>
          {preview ? (
            <div className="space-y-2">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveImage}
              >
                Remove Image
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
                  onChange={(e) => handleImageUrlChange(e.target.value)}
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
              handleImageUrlChange(url);
            }}
            type="image"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rating">Rating (1-5) *</Label>
          <Input
            id="rating"
            type="number"
            min="1"
            max="5"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as "Published" | "Draft" })
            }
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="text">Testimonial Text *</Label>
        <Textarea
          id="text"
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          placeholder="Enter testimonial text"
          rows={4}
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Testimonial</Button>
      </div>
    </form>
  );
}
