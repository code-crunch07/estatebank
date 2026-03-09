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

interface LeadSource {
  _id: string;
  name: string;
  description?: string;
  leads?: number;
}

export default function LeadSourcesPage() {
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<LeadSource | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<LeadSource | null>(null);

  // Fetch lead sources
  const fetchLeadSources = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/lead-sources');
      const data = await response.json();
      if (data.success && data.data) {
        setLeadSources(Array.isArray(data.data) ? data.data : []);
      } else {
        setLeadSources([]);
      }
    } catch (error) {
      console.error('Error fetching lead sources:', error);
      toast.error('Failed to load lead sources');
      setLeadSources([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeadSources();
  }, []);

  const handleEdit = (source: LeadSource) => {
    setEditingSource(source);
    setIsDialogOpen(true);
  };

  const handleDelete = (source: LeadSource) => {
    setSourceToDelete(source);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!sourceToDelete) return;

    try {
      const response = await fetch(`/api/lead-sources/${sourceToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Lead source deleted successfully");
        fetchLeadSources();
      } else {
        toast.error(data.error || "Failed to delete lead source");
      }
      setDeleteDialogOpen(false);
      setSourceToDelete(null);
    } catch (error) {
      console.error('Error deleting lead source:', error);
      toast.error("Failed to delete lead source");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Lead Sources</h1>
          <p className="text-xs text-muted-foreground">Manage lead sources</p>
        </div>
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingSource(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSource(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Lead Source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSource ? "Edit Lead Source" : "Add Lead Source"}</DialogTitle>
              <DialogDescription>
                {editingSource ? "Update lead source details" : "Create a new lead source"}
              </DialogDescription>
            </DialogHeader>
            <LeadSourceForm 
              source={editingSource}
              onSuccess={async (data) => {
                try {
                  if (editingSource) {
                    const response = await fetch(`/api/lead-sources/${editingSource._id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                    const result = await response.json();
                    if (result.success) {
                      toast.success("Lead source updated successfully");
                      fetchLeadSources();
                    } else {
                      toast.error(result.error || "Failed to update lead source");
                    }
                  } else {
                    const response = await fetch('/api/lead-sources', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                    const result = await response.json();
                    if (result.success) {
                      toast.success("Lead source added successfully");
                      fetchLeadSources();
                    } else {
                      toast.error(result.error || "Failed to add lead source");
                    }
                  }
                  setIsDialogOpen(false);
                  setEditingSource(null);
                } catch (error) {
                  console.error('Error saving lead source:', error);
                  toast.error("Failed to save lead source");
                }
              }}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingSource(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lead Sources</CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : `${leadSources.length} lead sources configured`}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLeadSources}
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
                <TableHead>Source Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Total Leads</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Loading lead sources...
                  </TableCell>
                </TableRow>
              ) : leadSources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No lead sources found. Add a new source to get started.
                  </TableCell>
                </TableRow>
              ) : (
                leadSources.map((source) => (
                  <TableRow key={source._id}>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell>{source.description}</TableCell>
                  <TableCell>{source.leads ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(source)} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(source)} title="Delete">
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
            <AlertDialogTitle>Delete Lead Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{sourceToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setSourceToDelete(null);
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

function LeadSourceForm({ 
  source, 
  onSuccess,
  onCancel
}: { 
  source?: LeadSource | null;
  onSuccess: (data: { name: string; description: string }) => void;
  onCancel?: () => void;
}) {
  const [formData, setFormData] = useState({
    name: source?.name || "",
    description: source?.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a source name");
      return;
    }
    onSuccess(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Source Name *</Label>
        <Input 
          id="name" 
          placeholder="Enter source name" 
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
