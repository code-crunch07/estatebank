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

interface OccupancyType {
  _id: string;
  name: string;
  description?: string;
}

export default function OccupancyTypesPage() {
  const [occupancyTypes, setOccupancyTypes] = useState<OccupancyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<OccupancyType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<OccupancyType | null>(null);

  // Fetch occupancy types
  const fetchOccupancyTypes = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/occupancy');
      const data = await response.json();
      if (data.success && data.data) {
        setOccupancyTypes(Array.isArray(data.data) ? data.data : []);
      } else {
        setOccupancyTypes([]);
      }
    } catch (error) {
      console.error('Error fetching occupancy types:', error);
      toast.error('Failed to load occupancy types');
      setOccupancyTypes([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOccupancyTypes();
  }, []);

  const handleEdit = (type: OccupancyType) => {
    setEditingType(type);
    setIsDialogOpen(true);
  };

  const handleDelete = (type: OccupancyType) => {
    setTypeToDelete(type);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!typeToDelete) return;

    try {
      const response = await fetch(`/api/occupancy/${typeToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Occupancy type deleted successfully");
        fetchOccupancyTypes();
      } else {
        toast.error(data.error || "Failed to delete occupancy type");
      }
      setDeleteDialogOpen(false);
      setTypeToDelete(null);
    } catch (error) {
      console.error('Error deleting occupancy type:', error);
      toast.error("Failed to delete occupancy type");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Occupancy Types</h1>
          <p className="text-xs text-muted-foreground">Manage occupancy types</p>
        </div>
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingType(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditingType(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Occupancy Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingType ? "Edit Occupancy Type" : "Add Occupancy Type"}</DialogTitle>
              <DialogDescription>
                {editingType ? "Update occupancy type details" : "Create a new occupancy type"}
              </DialogDescription>
            </DialogHeader>
            <OccupancyForm 
              type={editingType}
              onSuccess={async (data) => {
                try {
                  if (editingType) {
                    const response = await fetch(`/api/occupancy/${editingType._id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                    const result = await response.json();
                    if (result.success) {
                      toast.success("Occupancy type updated successfully");
                      fetchOccupancyTypes();
                    } else {
                      toast.error(result.error || "Failed to update occupancy type");
                    }
                  } else {
                    const response = await fetch('/api/occupancy', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                    const result = await response.json();
                    if (result.success) {
                      toast.success("Occupancy type added successfully");
                      fetchOccupancyTypes();
                    } else {
                      toast.error(result.error || "Failed to add occupancy type");
                    }
                  }
                  setIsDialogOpen(false);
                  setEditingType(null);
                } catch (error) {
                  console.error('Error saving occupancy type:', error);
                  toast.error("Failed to save occupancy type");
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
              <CardTitle>Occupancy Types</CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : `${occupancyTypes.length} types configured`}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOccupancyTypes}
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
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Loading occupancy types...
                  </TableCell>
                </TableRow>
              ) : occupancyTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No occupancy types found. Add a new type to get started.
                  </TableCell>
                </TableRow>
              ) : (
                occupancyTypes.map((type) => (
                  <TableRow key={type._id}>
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
            <AlertDialogTitle>Delete Occupancy Type</AlertDialogTitle>
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

function OccupancyForm({ 
  type, 
  onSuccess,
  onCancel
}: { 
  type?: OccupancyType | null;
  onSuccess: (data: { name: string; description: string }) => void;
  onCancel?: () => void;
}) {
  const [formData, setFormData] = useState({
    name: type?.name || "",
    description: type?.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter an occupancy type name");
      return;
    }
    onSuccess(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Occupancy Type Name *</Label>
        <Input 
          id="name" 
          placeholder="Enter occupancy type name" 
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input 
          id="description" 
          placeholder="Enter description" 
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
