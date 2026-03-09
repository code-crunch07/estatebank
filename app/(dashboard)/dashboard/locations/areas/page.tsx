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
import { Plus, Edit, Trash2, Search, RefreshCw } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Area {
  _id: string;
  name: string;
  location?: any;
  locationName?: string;
  properties?: number;
}

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);

  // Fetch areas from API
  const fetchAreas = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/areas');
      const data = await response.json();
      
      if (data.success && data.data) {
        setAreas(Array.isArray(data.data) ? data.data : []);
      } else {
        setAreas([]);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
      toast.error('Failed to load areas');
      setAreas([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch locations for dropdown
  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      const data = await response.json();
      
      if (data.success && data.data) {
        setLocations(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  useEffect(() => {
    fetchAreas();
    fetchLocations();
  }, []);

  const handleEdit = (area: Area) => {
    setEditingArea(area);
    setIsDialogOpen(true);
  };

  const handleDelete = (area: Area) => {
    setAreaToDelete(area);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!areaToDelete) return;

    try {
      const response = await fetch(`/api/areas/${areaToDelete._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Area deleted successfully");
        setDeleteDialogOpen(false);
        setAreaToDelete(null);
        fetchAreas();
      } else {
        toast.error(data.message || "Failed to delete area");
      }
    } catch (error) {
      console.error('Error deleting area:', error);
      toast.error("Failed to delete area");
    }
  };

  const filteredAreas = areas.filter(
    (area) =>
      area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (area.locationName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (area.location && typeof area.location === 'object' ? area.location.name : "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Manage Areas</h1>
          <p className="text-xs text-muted-foreground">Manage property areas</p>
        </div>
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingArea(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditingArea(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Area
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingArea ? "Edit Area" : "Add Area"}</DialogTitle>
              <DialogDescription>
                {editingArea ? "Update area details" : "Create a new area"}
              </DialogDescription>
            </DialogHeader>
            <AreaForm 
              area={editingArea}
              locations={locations}
              onSuccess={async (data) => {
                try {
                  if (editingArea) {
                    // Update existing area
                    const response = await fetch(`/api/areas/${editingArea._id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });

                    const result = await response.json();
                    if (result.success) {
                      toast.success("Area updated successfully");
                      fetchAreas();
                    } else {
                      toast.error(result.message || "Failed to update area");
                      return;
                    }
                  } else {
                    // Create new area
                    const response = await fetch('/api/areas', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });

                    const result = await response.json();
                    if (result.success) {
                      toast.success("Area added successfully");
                      fetchAreas();
                    } else {
                      toast.error(result.message || "Failed to add area");
                      return;
                    }
                  }
                  setIsDialogOpen(false);
                  setEditingArea(null);
                } catch (error) {
                  console.error('Error saving area:', error);
                  toast.error("Failed to save area");
                }
              }}
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Areas</CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : `${areas.length} areas found`}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAreas}
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
                <TableHead>Area Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Loading areas...
                  </TableCell>
                </TableRow>
              ) : areas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No areas match your search." : "No areas found. Add a new area to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAreas.map((area) => (
                  <TableRow key={area._id}>
                    <TableCell className="font-medium">{area.name}</TableCell>
                    <TableCell>{area.locationName || (area.location && typeof area.location === 'object' ? area.location.name : area.location) || "N/A"}</TableCell>
                    <TableCell>{area.properties}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(area)} title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(area)} title="Delete">
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
            <AlertDialogTitle>Delete Area</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{areaToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setAreaToDelete(null);
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

function AreaForm({ 
  area, 
  locations,
  onSuccess,
  onCancel
}: { 
  area?: Area | null;
  locations: any[];
  onSuccess: (data: { name: string; location: string }) => void;
  onCancel?: () => void;
}) {
  const [formData, setFormData] = useState({
    name: area?.name || "",
    location: area?.location?._id || area?.location || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }
    onSuccess(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Area Name *</Label>
        <Input 
          id="name" 
          placeholder="Enter area name" 
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })} required>
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location._id} value={location._id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
