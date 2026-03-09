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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Edit, Trash2, Save, Search, X, Tag } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PropertyStatus {
  id: string;
  name: string;
  description: string;
  color: string;
  order: number;
  createdAt: string;
}

const defaultStatuses: PropertyStatus[] = [
  {
    id: "1",
    name: "Available",
    description: "Property is available for sale/rent",
    color: "default",
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Sold",
    description: "Property has been sold",
    color: "destructive",
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Under Construction",
    description: "Property is currently under construction",
    color: "secondary",
    order: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Completed",
    description: "Property construction is completed",
    color: "default",
    order: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Reserved",
    description: "Property is reserved by a client",
    color: "secondary",
    order: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Coming Soon",
    description: "Property will be available soon",
    color: "secondary",
    order: 6,
    createdAt: new Date().toISOString(),
  },
];

const statusColors = [
  { value: "default", label: "Default (Blue)" },
  { value: "destructive", label: "Destructive (Red)" },
  { value: "secondary", label: "Secondary (Gray)" },
  { value: "outline", label: "Outline" },
];

export default function PropertyStatusPage() {
  const [statuses, setStatuses] = useState<PropertyStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<PropertyStatus | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<PropertyStatus | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "default",
    order: 1,
  });

  useEffect(() => {
    const loadStatuses = () => {
      const stored = localStorage.getItem("propertyStatuses");
      if (stored) {
        setStatuses(JSON.parse(stored));
      } else {
        setStatuses(defaultStatuses);
        localStorage.setItem("propertyStatuses", JSON.stringify(defaultStatuses));
      }
    };
    loadStatuses();
  }, []);

  const filteredStatuses = useMemo(() => {
    return statuses.filter((status) =>
      status.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      status.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [statuses, searchTerm]);

  const handleCreate = () => {
    setEditingStatus(null);
    setFormData({
      name: "",
      description: "",
      color: "default",
      order: statuses.length + 1,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (status: PropertyStatus) => {
    setEditingStatus(status);
    setFormData({
      name: status.name,
      description: status.description,
      color: status.color,
      order: status.order,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Status name is required");
      return;
    }

    if (editingStatus) {
      // Update existing status
      const updated = statuses.map((s) =>
        s.id === editingStatus.id
          ? { ...s, ...formData, name: formData.name.trim(), description: formData.description.trim() }
          : s
      );
      setStatuses(updated);
      localStorage.setItem("propertyStatuses", JSON.stringify(updated));
      toast.success("Status updated successfully");
    } else {
      // Check if name already exists
      if (statuses.some((s) => s.name.toLowerCase() === formData.name.trim().toLowerCase())) {
        toast.error("Status with this name already exists");
        return;
      }

      // Create new status
      const newStatus: PropertyStatus = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        order: formData.order,
        createdAt: new Date().toISOString(),
      };
      const updated = [...statuses, newStatus];
      setStatuses(updated);
      localStorage.setItem("propertyStatuses", JSON.stringify(updated));
      toast.success("Status created successfully");
    }

    setIsDialogOpen(false);
    setEditingStatus(null);
  };

  const handleDelete = (status: PropertyStatus) => {
    setStatusToDelete(status);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!statusToDelete) return;

    const updated = statuses.filter((s) => s.id !== statusToDelete.id);
    setStatuses(updated);
    localStorage.setItem("propertyStatuses", JSON.stringify(updated));
    toast.success("Status deleted successfully");
    setDeleteDialogOpen(false);
    setStatusToDelete(null);
  };

  const getBadgeVariant = (color: string): "default" | "destructive" | "secondary" | "outline" => {
    return (color as any) || "default";
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Property Status</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage property status options for your listings
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Status
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search statuses..."
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
        </CardContent>
      </Card>

      {/* Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>Property Statuses</CardTitle>
          <CardDescription>
            Configure the status options available for properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStatuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No statuses found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStatuses
                  .sort((a, b) => a.order - b.order)
                  .map((status) => (
                    <TableRow key={status.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          {status.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {status.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(status.color)}>
                          {status.name}
                        </Badge>
                      </TableCell>
                      <TableCell>{status.order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(status)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(status)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingStatus ? "Edit Status" : "Create New Status"}</DialogTitle>
            <DialogDescription>
              {editingStatus
                ? "Update the property status details"
                : "Add a new property status option"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status-name">Status Name *</Label>
              <Input
                id="status-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Available, Sold, Under Construction"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-description">Description</Label>
              <Input
                id="status-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this status"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status-color">Color Variant *</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData({ ...formData, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusColors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-order">Display Order *</Label>
                <Input
                  id="status-order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) || 1 })
                  }
                  min="1"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {editingStatus ? "Update Status" : "Create Status"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Status?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{statusToDelete?.name}&quot;? This action cannot be
              undone. Properties using this status will need to be updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
