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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { IconPicker } from "@/components/icon-picker";
import * as LucideIcons from "lucide-react";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as HiIcons from "react-icons/hi";
import * as IoIcons from "react-icons/io5";

interface AmenityApi {
  _id: string;
  name: string;
  icon: string;
  iconLibrary?: string;
  status: string;
  description?: string;
}

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState<AmenityApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<AmenityApi | null>(null);

  const fetchAmenities = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/amenities');
      const data = await response.json();
      if (data.success && data.data) {
        setAmenities(Array.isArray(data.data) ? data.data : []);
      } else {
        setAmenities([]);
      }
    } catch (error) {
      console.error('Error fetching amenities:', error);
      toast.error('Failed to load amenities');
      setAmenities([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  // Helper function to render amenity icon
  const renderAmenityIcon = (amenity: AmenityApi) => {
    if (amenity.iconLibrary === "lucide") {
      const IconComponent = (LucideIcons as any)[amenity.icon];
      if (!IconComponent) return null;
      return <IconComponent className="h-5 w-5" />;
    } else {
      const prefix = amenity.icon.substring(0, 2);
      let IconComponent: any = null;
      
      if (prefix === "Fa") {
        IconComponent = (FaIcons as any)[amenity.icon];
      } else if (prefix === "Md") {
        IconComponent = (MdIcons as any)[amenity.icon];
      } else if (prefix === "Hi") {
        IconComponent = (HiIcons as any)[amenity.icon];
      } else if (prefix === "Io") {
        IconComponent = (IoIcons as any)[amenity.icon];
      }
      
      if (!IconComponent) return null;
      return <IconComponent className="h-5 w-5" />;
    }
  };

  const handleSave = async (amenityData: Partial<AmenityApi>) => {
    try {
      if (editingAmenity) {
        // Update existing
        const response = await fetch(`/api/amenities/${editingAmenity._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(amenityData),
        });
        const result = await response.json();
        if (result.success) {
          toast.success("Amenity updated successfully");
          fetchAmenities();
        } else {
          toast.error(result.error || "Failed to update amenity");
        }
      } else {
        // Create new
        const response = await fetch('/api/amenities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: amenityData.name || "",
            icon: amenityData.icon || "Home",
            iconLibrary: amenityData.iconLibrary || "lucide",
            status: amenityData.status || "Active",
            description: amenityData.description || "",
          }),
        });
        const result = await response.json();
        if (result.success) {
          toast.success("Amenity added successfully");
          fetchAmenities();
        } else {
          toast.error(result.error || "Failed to add amenity");
        }
      }
      setIsDialogOpen(false);
      setEditingAmenity(null);
    } catch (error) {
      console.error('Error saving amenity:', error);
      toast.error("Failed to save amenity");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/amenities/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Amenity deleted successfully");
        fetchAmenities();
      } else {
        toast.error(data.error || "Failed to delete amenity");
      }
    } catch (error) {
      console.error('Error deleting amenity:', error);
      toast.error("Failed to delete amenity");
    }
  };

  const handleEdit = (amenity: AmenityApi) => {
    setEditingAmenity(amenity);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Amenities</h1>
          <p className="text-xs text-muted-foreground">Manage property amenities</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingAmenity(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Amenity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAmenity ? "Edit Amenity" : "Add Amenity"}</DialogTitle>
              <DialogDescription>
                {editingAmenity ? "Update amenity details" : "Create a new amenity"}
              </DialogDescription>
            </DialogHeader>
            <AmenityForm
              amenity={editingAmenity}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingAmenity(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
          <CardDescription>
            {amenities.length} amenities configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {amenities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No amenities found.
                  </TableCell>
                </TableRow>
              ) : (
                amenities.map((amenity) => (
                  <TableRow key={amenity._id}>
                    <TableCell>
                      <div className="flex items-center justify-center w-10 h-10">
                        {renderAmenityIcon(amenity)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{amenity.name}</TableCell>
                    <TableCell>
                      <Badge variant={amenity.status === "Active" ? "default" : "secondary"}>
                        {amenity.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(amenity)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(amenity._id)}>
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

function AmenityForm({
  amenity,
  onSave,
  onCancel,
}: {
  amenity: AmenityApi | null;
  onSave: (data: Partial<AmenityApi>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<{
    name: string;
    icon: string;
    iconLibrary: "lucide" | "react-icons";
    status: "Active" | "Inactive";
  }>({
    name: amenity?.name || "",
    icon: amenity?.icon || "",
    iconLibrary: (amenity?.iconLibrary || "lucide") as "lucide" | "react-icons",
    status: (amenity?.status || "Active") as "Active" | "Inactive",
  });

  useEffect(() => {
    if (amenity) {
      setFormData({
        name: amenity.name,
        icon: amenity.icon,
        iconLibrary: (amenity.iconLibrary || "lucide") as "lucide" | "react-icons",
        status: amenity.status as "Active" | "Inactive",
      });
    }
  }, [amenity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter an amenity name");
      return;
    }
    if (!formData.icon) {
      toast.error("Please select an icon");
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Amenity Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter amenity name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Select Icon *</Label>
        <IconPicker
          value={{ icon: formData.icon, iconLibrary: formData.iconLibrary }}
          onChange={(value) => setFormData({ ...formData, icon: value.icon, iconLibrary: value.iconLibrary })}
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
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
