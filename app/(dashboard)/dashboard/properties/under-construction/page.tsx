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
import { Eye, Edit, Trash2, Search, Calendar, Plus } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { DataStore, Property } from "@/lib/data-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import { getPropertyUrl } from "@/lib/utils";

export default function UnderConstructionPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  useEffect(() => {
    // Fetch properties from API
    const loadProperties = async () => {
      try {
        const response = await fetch('/api/properties?status=Under Construction');
        const data = await response.json();
        if (data.success && data.data) {
          const allProperties = Array.isArray(data.data) ? data.data : [];
          // Filter properties with "Under Construction" status (case-insensitive)
          // Handle both array and string status (backward compatibility)
          const underConstructionProperties = allProperties.filter((p: any) => {
            const statuses = Array.isArray(p.status) ? p.status : (p.status ? [p.status] : []);
            return statuses.some((s: string) => {
              const statusLower = s?.toLowerCase() || "";
              return (
                statusLower === "under construction" ||
                statusLower === "under-construction" ||
                s === "Under Construction"
              );
            });
          });
          // Normalize properties: ensure both _id and id are available
          const normalizedProperties = underConstructionProperties.map((p: any) => ({
            ...p,
            id: p._id || p.id, // Use _id as id if id doesn't exist
            _id: p._id || p.id, // Ensure _id exists
          }));
          setProperties(normalizedProperties as Property[]);
        }
      } catch (error) {
        console.error('Error loading properties:', error);
        setProperties([]);
      }
    };

    loadProperties();
    
    // Refresh periodically
    const interval = setInterval(loadProperties, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const filteredProperties = useMemo(() => {
    return properties.filter(
      (property) =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [properties, searchTerm]);

  const handleView = (property: Property) => {
    // Navigate to property detail page on client side
    const url = getPropertyUrl(property);
    window.open(url, "_blank");
  };

  const handleEdit = (property: Property) => {
    // Navigate to edit page
    const propertyId = (property as any)._id || property.id;
    if (!propertyId) {
      toast.error("Property ID not found");
      return;
    }
    router.push(`/dashboard/properties/edit/${propertyId}`);
  };

  const handleDelete = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    
    try {
      const propertyId = (propertyToDelete as any)._id || propertyToDelete.id;
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Property deleted successfully");
        // Reload properties
        const loadResponse = await fetch('/api/properties?status=Under Construction');
        const loadData = await loadResponse.json();
        if (loadData.success && loadData.data) {
          const allProperties = Array.isArray(loadData.data) ? loadData.data : [];
          const underConstructionProperties = allProperties.filter((p: any) => {
            const status = p.status?.toLowerCase() || "";
            return (
              status === "under construction" ||
              status === "under-construction" ||
              p.status === "Under Construction"
            );
          });
          setProperties(underConstructionProperties as Property[]);
        }
        setDeleteDialogOpen(false);
        setPropertyToDelete(null);
      } else {
        toast.error(data.error || "Failed to delete property");
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error("Failed to delete property");
    }
  };

  // Helper function to get expected completion date
  const getExpectedCompletion = (property: Property): string => {
    // Use commencementDate if available, otherwise show "Not set"
    if (property.commencementDate) {
      // If it's a date string, format it
      try {
        const date = new Date(property.commencementDate);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
        }
      } catch (e) {
        // If parsing fails, return as is
        return property.commencementDate;
      }
    }
    return "Not set";
  };

  // Helper function to get construction status
  const getConstructionStatus = (property: Property): string => {
    // You can add a constructionStatus field to Property interface later
    // For now, derive from other fields or use a default
    // Check if property has keyDetails that might contain status info
    const statusKeywords = property.keyDetails?.find((detail) =>
      detail.toLowerCase().includes("foundation") ||
      detail.toLowerCase().includes("progress") ||
      detail.toLowerCase().includes("phase")
    );
    
    if (statusKeywords) {
      return statusKeywords;
    }
    
    // Default status based on commencement date
    if (property.commencementDate) {
      return "In Progress";
    }
    
    return "Planning";
  };

  // Helper function to calculate progress (mock for now, can be added to Property interface)
  const getProgress = (property: Property): number => {
    // You can add a progress field to Property interface later
    // For now, return a default or calculate based on commencement date
    // This is a placeholder - you should add a progress field to the Property interface
    return 50; // Default 50%
  };

  return (
    <>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Under Construction Properties</h1>
            <p className="text-sm text-muted-foreground">Manage properties under construction</p>
          </div>
          <Link href="/dashboard/properties/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </Link>
        </div>

        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Under Construction Properties</CardTitle>
            <CardDescription>
              {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Expected Completion</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm
                        ? "No properties found matching your search."
                        : "No under construction properties found. Add properties with 'Under Construction' status to see them here."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">{property.name}</TableCell>
                      <TableCell>{property.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{getExpectedCompletion(property)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getConstructionStatus(property)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${getProgress(property)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{getProgress(property)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{property.price}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(property)}
                            title="View Property"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(property)}
                            title="Edit Property"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(property)}
                            title="Delete Property"
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
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{propertyToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
