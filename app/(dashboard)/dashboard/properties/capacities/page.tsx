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
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react";
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

interface Capacity {
  _id: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
}

export default function CapacitiesPage() {
  const [capacities, setCapacities] = useState<Capacity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCapacity, setEditingCapacity] = useState<Capacity | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [capacityToDelete, setCapacityToDelete] = useState<Capacity | null>(null);

  // Fetch capacities
  const fetchCapacities = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/capacities');
      const data = await response.json();
      if (data.success && data.data) {
        setCapacities(Array.isArray(data.data) ? data.data : []);
      } else {
        setCapacities([]);
      }
    } catch (error) {
      console.error('Error fetching capacities:', error);
      toast.error('Failed to load capacities');
      setCapacities([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCapacities();
  }, []);

  const handleEdit = (capacity: Capacity) => {
    setEditingCapacity(capacity);
    setIsDialogOpen(true);
  };

  const handleDelete = (capacity: Capacity) => {
    setCapacityToDelete(capacity);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!capacityToDelete) return;

    try {
      const response = await fetch(`/api/capacities/${capacityToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Capacity deleted successfully");
        fetchCapacities();
      } else {
        toast.error(data.error || "Failed to delete capacity");
      }
      setDeleteDialogOpen(false);
      setCapacityToDelete(null);
    } catch (error) {
      console.error('Error deleting capacity:', error);
      toast.error("Failed to delete capacity");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Capacities</h1>
          <p className="text-xs text-muted-foreground">Manage property capacities</p>
        </div>
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingCapacity(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCapacity(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Capacity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCapacity ? "Edit Capacity" : "Add Capacity"}</DialogTitle>
              <DialogDescription>
                {editingCapacity ? "Update capacity configuration" : "Create a new capacity configuration"}
              </DialogDescription>
            </DialogHeader>
            <CapacityForm 
              capacity={editingCapacity}
              onSuccess={async (data) => {
                try {
                  if (editingCapacity) {
                    const response = await fetch(`/api/capacities/${editingCapacity._id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                    const result = await response.json();
                    if (result.success) {
                      toast.success("Capacity updated successfully");
                      fetchCapacities();
                    } else {
                      toast.error(result.error || "Failed to update capacity");
                    }
                  } else {
                    const response = await fetch('/api/capacities', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                    const result = await response.json();
                    if (result.success) {
                      toast.success("Capacity added successfully");
                      fetchCapacities();
                    } else {
                      toast.error(result.error || "Failed to add capacity");
                    }
                  }
                  setIsDialogOpen(false);
                  setEditingCapacity(null);
                } catch (error) {
                  console.error('Error saving capacity:', error);
                  toast.error("Failed to save capacity");
                }
              }}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingCapacity(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Capacities</CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : `${capacities.length} capacities configured`}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCapacities}
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
                <TableHead>Name</TableHead>
                <TableHead>Bedrooms</TableHead>
                <TableHead>Bathrooms</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Loading capacities...
                  </TableCell>
                </TableRow>
              ) : capacities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No capacities found. Add a new capacity to get started.
                  </TableCell>
                </TableRow>
              ) : (
                capacities.map((capacity) => (
                  <TableRow key={capacity._id}>
                  <TableCell className="font-medium">{capacity.name}</TableCell>
                  <TableCell>{capacity.bedrooms}</TableCell>
                  <TableCell>{capacity.bathrooms}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(capacity)} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(capacity)} title="Delete">
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
            <AlertDialogTitle>Delete Capacity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{capacityToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setCapacityToDelete(null);
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

function CapacityForm({ 
  capacity, 
  onSuccess,
  onCancel
}: { 
  capacity?: Capacity | null;
  onSuccess: (data: { name: string; bedrooms: number; bathrooms: number }) => void;
  onCancel?: () => void;
}) {
  const [formData, setFormData] = useState({
    name: capacity?.name || "",
    bedrooms: capacity?.bedrooms || 0,
    bathrooms: capacity?.bathrooms || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a capacity name");
      return;
    }
    onSuccess({
      name: formData.name,
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Capacity Name *</Label>
        <Input 
          id="name" 
          placeholder="e.g., 2 BHK" 
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required 
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms *</Label>
          <Input 
            id="bedrooms" 
            type="number" 
            placeholder="0" 
            value={formData.bedrooms}
            onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms *</Label>
          <Input 
            id="bathrooms" 
            type="number" 
            placeholder="0" 
            value={formData.bathrooms}
            onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
            required 
          />
        </div>
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
