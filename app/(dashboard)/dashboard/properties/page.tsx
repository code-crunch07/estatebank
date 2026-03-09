"use client";

import { Button } from "@/components/ui/button";
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
import { Plus, Edit, Trash2, Eye, Share2, Search, CheckSquare, Square, Loader2, Download, Upload } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DataStore, Property } from "@/lib/data-store";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getPropertyUrl } from "@/lib/utils";
import { convertToCSV, downloadCSV, readCSVFile } from "@/lib/csv-utils";

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch properties function
  const fetchProperties = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      // Use lightweight mode for better performance - excludes heavy fields like images, descriptions, etc.
      const params = new URLSearchParams({
        lightweight: 'true', // Exclude heavy fields: images, floorPlans, description, keyDetails, amenities, transport, videoTour, videoLink
        limit: '500', // Fetch up to 500 properties (pagination is handled client-side)
      });
      if (forceRefresh) {
        params.append('t', Date.now().toString());
      }
      const url = `/api/properties?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success && data.data) {
        // Handle both response formats:
        // 1. When lightweight=true: data.data is an array
        // 2. When lightweight=false: data.data is { properties: [...], count: ... }
        let propertiesArray: any[] = [];
        
        if (Array.isArray(data.data)) {
          // Direct array response (lightweight mode)
          propertiesArray = data.data;
        } else if (data.data.properties && Array.isArray(data.data.properties)) {
          // Object with properties key
          propertiesArray = data.data.properties;
        } else if (data.data && typeof data.data === 'object') {
          // Try to extract any array from the response
          const keys = Object.keys(data.data);
          for (const key of keys) {
            if (Array.isArray(data.data[key])) {
              propertiesArray = data.data[key];
              break;
            }
          }
        }
        
        // Normalize properties: ensure both _id and id are available
        const normalizedProperties = propertiesArray.map((p: any) => ({
          ...p,
          id: p._id || p.id, // Use _id as id if id doesn't exist
          _id: p._id || p.id, // Ensure _id exists
        }));
        
        setProperties(normalizedProperties);
        console.log(`[Dashboard] Loaded ${normalizedProperties.length} properties`);
      } else {
        console.warn('[Dashboard] No properties data in response:', data);
        setProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    
    // Refresh when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProperties(true); // Force refresh
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Filter and search properties
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.type.toLowerCase().includes(searchTerm.toLowerCase());

      // Handle both array and string status (backward compatibility)
      const propertyStatuses = Array.isArray(property.status) ? property.status : (property.status ? [property.status] : []);
      const matchesStatus = statusFilter === "all" || propertyStatuses.includes(statusFilter);
      const matchesType = typeFilter === "all" || property.type === typeFilter;
      const matchesLocation = locationFilter === "all" || property.location === locationFilter;

      return matchesSearch && matchesStatus && matchesType && matchesLocation;
    });
  }, [properties, searchTerm, statusFilter, typeFilter, locationFilter]);

  // Paginate filtered properties
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredProperties.slice(startIndex, endIndex);
  }, [filteredProperties, currentPage, pageSize]);

  // Get unique values for filters
  const uniqueStatuses = useMemo(() => {
    const allStatuses = properties.flatMap((p) => {
      // Handle both array and string status (backward compatibility)
      return Array.isArray(p.status) ? p.status : (p.status ? [p.status] : []);
    });
    return Array.from(new Set(allStatuses)).sort();
  }, [properties]);

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(properties.map((p) => p.type)));
  }, [properties]);

  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(properties.map((p) => p.location)));
  }, [properties]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, locationFilter]);

  const handleView = (property: Property) => {
    // Navigate to property detail page
    const url = getPropertyUrl(property);
    router.push(url);
  };

  const handleEdit = (property: Property) => {
    // Navigate to edit page
    // MongoDB returns _id, but we also normalize to id in fetchProperties
    const propertyId = (property as any)._id || (property as any).id || property.id;
    if (!propertyId || propertyId === 'undefined' || propertyId === undefined) {
      console.error('Property ID not found:', property);
      toast.error("Property ID not found. Please refresh the page.");
      return;
    }
    router.push(`/dashboard/properties/edit/${propertyId}`);
  };

  const handleDelete = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete || isDeleting) return;
    
    const propertyId = (propertyToDelete as any)._id || propertyToDelete.id;
    
    // Optimistic update: Remove from UI immediately
    setProperties(prev => prev.filter(p => {
      const pId = (p as any)._id || p.id;
      return pId !== propertyId;
    }));
    setDeleteDialogOpen(false);
    const deletedProperty = propertyToDelete;
    setPropertyToDelete(null);
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Property deleted successfully");
        // Refresh to ensure consistency (cache is cleared on server)
        const fetchResponse = await fetch('/api/properties?t=' + Date.now()); // Add timestamp to bypass cache
        const fetchData = await fetchResponse.json();
        if (fetchData.success && fetchData.data) {
          let propertiesArray: any[] = [];
          if (Array.isArray(fetchData.data)) {
            propertiesArray = fetchData.data;
          } else if (fetchData.data.properties && Array.isArray(fetchData.data.properties)) {
            propertiesArray = fetchData.data.properties;
          }
          
          const normalizedProperties = propertiesArray.map((p: any) => ({
            ...p,
            id: p._id || p.id,
            _id: p._id || p.id,
          }));
          setProperties(normalizedProperties);
        }
      } else {
        // Rollback optimistic update on error
        setProperties(prev => [...prev, deletedProperty].sort((a, b) => {
          const aDate = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
          const bDate = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
          return bDate - aDate;
        }));
        const errorMessage = typeof data.error === 'string' ? data.error : data.error?.message || "Failed to delete property";
        toast.error(errorMessage);
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      // Rollback optimistic update on error
      setProperties(prev => [...prev, deletedProperty].sort((a, b) => {
        const aDate = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
        const bDate = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
        return bDate - aDate;
      }));
      console.error('Error deleting property:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete property";
      toast.error(errorMessage);
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Multi-select handlers
  const togglePropertySelection = (propertyId: string) => {
    setSelectedProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedProperties.size === paginatedProperties.length) {
      setSelectedProperties(new Set());
    } else {
      const allIds = paginatedProperties.map(p => (p as any)._id || p.id).filter(Boolean);
      setSelectedProperties(new Set(allIds));
    }
  };

  const handleBulkDelete = () => {
    if (selectedProperties.size === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedProperties.size === 0 || isBulkDeleting) return;
    
    setIsBulkDeleting(true);
    try {
      const propertyIds = Array.from(selectedProperties);
      
      // Use bulk delete API endpoint
      const response = await fetch(`/api/properties?ids=${encodeURIComponent(JSON.stringify(propertyIds))}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        const deletedCount = data.data?.deletedCount || propertyIds.length;
        toast.success(`${deletedCount} propert${deletedCount === 1 ? 'y' : 'ies'} deleted successfully`);
        
        // Refresh properties list
        const fetchResponse = await fetch('/api/properties');
        const fetchData = await fetchResponse.json();
        if (fetchData.success && fetchData.data) {
          // Handle both response formats
          let propertiesArray: any[] = [];
          if (Array.isArray(fetchData.data)) {
            propertiesArray = fetchData.data;
          } else if (fetchData.data.properties && Array.isArray(fetchData.data.properties)) {
            propertiesArray = fetchData.data.properties;
          }
          
          const normalizedProperties = propertiesArray.map((p: any) => ({
            ...p,
            id: p._id || p.id,
            _id: p._id || p.id,
          }));
          setProperties(normalizedProperties);
        }
        
        setSelectedProperties(new Set());
        setBulkDeleteDialogOpen(false);
      } else {
        const errorMessage = typeof data.error === 'string' ? data.error : data.error?.message || "Failed to delete properties";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting properties:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete properties";
      toast.error(errorMessage);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Clear selection when filters change
  useEffect(() => {
    setSelectedProperties(new Set());
  }, [searchTerm, statusFilter, typeFilter, locationFilter, currentPage]);

  const handleShare = (property: Property) => {
    setSelectedProperty(property);
    setShareDialogOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
  };

  const shareViaWhatsApp = (property: Property) => {
    const message = `Check out this property: ${property.name} - ${property.location} - ${property.price}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Export properties to CSV
  const handleExport = () => {
    try {
      setIsExporting(true);
      const headers = [
        "name", "location", "address", "type", "price", "bedrooms", "bathrooms",
        "area", "status", "description", "capacity", "occupancyType", "deposit",
        "rent", "carpetArea", "dateAvailableFrom", "commencementDate", "videoTour"
      ];
      
      const csvData = properties.map((p) => {
        const statusValue = Array.isArray(p.status) ? p.status.join(", ") : (p.status || "");
        return {
          name: p.name || "",
          location: p.location || "",
          address: p.address || "",
          type: p.type || "",
          price: p.price || "",
          bedrooms: p.bedrooms?.toString() || "",
          bathrooms: p.bathrooms?.toString() || "",
          area: p.area || "",
          status: statusValue,
          description: p.description || "",
          capacity: (p as any).capacity || "",
          occupancyType: (p as any).occupancyType || "",
          deposit: (p as any).deposit || "",
          rent: (p as any).rent || "",
          carpetArea: (p as any).carpetArea || "",
          dateAvailableFrom: (p as any).dateAvailableFrom || "",
          commencementDate: (p as any).commencementDate || "",
          videoTour: p.videoTour || "",
        };
      });

      const csv = convertToCSV(csvData, headers);
      downloadCSV(csv, `properties-export-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success("Properties exported successfully");
    } catch (error) {
      console.error("Error exporting properties:", error);
      toast.error("Failed to export properties");
    } finally {
      setIsExporting(false);
    }
  };

  // Import properties from CSV
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const { rows } = await readCSVFile(file);
      
      if (rows.length === 0) {
        toast.error("CSV file is empty");
        return;
      }

      // Map all rows to property data array for bulk import
      const propertiesData = rows.map((row) => {
        const propertyData: any = {
          name: row.name || "",
          location: row.location || "",
          address: row.address || "",
          type: row.type || "Buy",
          price: row.price || "",
          bedrooms: row.bedrooms ? parseInt(row.bedrooms) : 0,
          bathrooms: row.bathrooms ? parseInt(row.bathrooms) : 0,
          area: row.area || "",
          status: row.status ? (row.status.includes(",") ? row.status.split(",").map((s: string) => s.trim()) : [row.status]) : ["Available"],
          description: row.description || "",
        };

        // Optional fields
        if (row.capacity) propertyData.capacity = row.capacity;
        if (row.occupancyType) propertyData.occupancyType = row.occupancyType;
        if (row.deposit) propertyData.deposit = row.deposit;
        if (row.rent) propertyData.rent = row.rent;
        if (row.carpetArea) propertyData.carpetArea = row.carpetArea;
        if (row.dateAvailableFrom) propertyData.dateAvailableFrom = row.dateAvailableFrom;
        if (row.commencementDate) propertyData.commencementDate = row.commencementDate;
        if (row.videoTour) propertyData.videoTour = row.videoTour;

        return propertyData;
      });

      // Bulk import using array POST
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propertiesData),
      });

      const data = await response.json();
      if (data.success) {
        const successCount = data.data?.successCount || 0;
        const failedCount = data.data?.failedCount || 0;
        toast.success(`Import completed: ${successCount} properties imported, ${failedCount} failed`);
        
        // Refresh properties list
        const fetchResponse = await fetch('/api/properties');
        const fetchData = await fetchResponse.json();
        if (fetchData.success && fetchData.data) {
          // Handle both response formats
          let propertiesArray: any[] = [];
          if (Array.isArray(fetchData.data)) {
            propertiesArray = fetchData.data;
          } else if (fetchData.data.properties && Array.isArray(fetchData.data.properties)) {
            propertiesArray = fetchData.data.properties;
          }
          
          const normalizedProperties = propertiesArray.map((p: any) => ({
            ...p,
            id: p._id || p.id,
            _id: p._id || p.id,
          }));
          setProperties(normalizedProperties);
        }
      } else {
        toast.error(data.error || "Failed to import properties");
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error importing properties:", error);
      toast.error("Failed to import properties");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">All Properties</h1>
          <p className="text-sm text-muted-foreground">Manage your property listings</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || properties.length === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
        <Link href="/dashboard/properties/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, location, address, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
          <CardTitle>Properties</CardTitle>
          <CardDescription>
            {filteredProperties.length} properties found
                {selectedProperties.size > 0 && ` • ${selectedProperties.size} selected`}
          </CardDescription>
            </div>
            {selectedProperties.size > 0 && (
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedProperties.size})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="flex items-center justify-center"
                    title={selectedProperties.size === paginatedProperties.length ? "Deselect all" : "Select all"}
                  >
                    {selectedProperties.size === paginatedProperties.length && paginatedProperties.length > 0 ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Bedrooms</TableHead>
                <TableHead>Bathrooms</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProperties.length === 0 ? (
                <TableRow key="empty-state">
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No properties found. {searchTerm || statusFilter !== "all" || typeFilter !== "all" || locationFilter !== "all" ? "Try adjusting your filters." : "Add your first property to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProperties.map((property) => {
                  const propertyId = (property as any)._id || property.id;
                  const isSelected = selectedProperties.has(propertyId);
                  return (
                    <TableRow key={propertyId || `property-${property.name}`}>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => togglePropertySelection(propertyId)}
                          className="flex items-center justify-center"
                          title={isSelected ? "Deselect" : "Select"}
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </TableCell>
                    <TableCell className="font-medium">{property.name}</TableCell>
                    <TableCell>{property.type}</TableCell>
                    <TableCell>{property.location}</TableCell>
                    <TableCell>{property.price}</TableCell>
                    <TableCell>{property.bedrooms}</TableCell>
                    <TableCell>{property.bathrooms}</TableCell>
                    <TableCell>
                      {(() => {
                        // Handle both array and string status (backward compatibility)
                        const statuses: string[] = Array.isArray(property.status) ? property.status : (property.status ? [property.status] : ["Available"]);
                        return (
                          <div className="flex flex-wrap gap-1">
                            {statuses.slice(0, 2).map((status, idx) => (
                              <Badge
                                key={`${status}-${idx}`}
                                variant={
                                  status === "Available" || status === "Completed"
                                    ? "default"
                                    : status === "Sold"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {status}
                              </Badge>
                            ))}
                            {statuses.length > 2 && (
                              <Badge variant="outline">+{statuses.length - 2}</Badge>
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleShare(property)}
                          title="Share Property"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View"
                          onClick={() => handleView(property)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit"
                          onClick={() => handleEdit(property)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete"
                          onClick={() => handleDelete(property)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          {filteredProperties.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredProperties.length / pageSize)}
              pageSize={pageSize}
              totalItems={filteredProperties.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{propertyToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setPropertyToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Multiple Properties</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedProperties.size} propert{selectedProperties.size === 1 ? 'y' : 'ies'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setBulkDeleteDialogOpen(false);
              }}
              disabled={isBulkDeleting}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={confirmBulkDelete}
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                `Delete ${selectedProperties.size} Propert${selectedProperties.size === 1 ? 'y' : 'ies'}`
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Property</DialogTitle>
            <DialogDescription>
              Share {selectedProperty?.name} with others
            </DialogDescription>
          </DialogHeader>
          {selectedProperty && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Property Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={`${typeof window !== 'undefined' ? window.location.origin : 'https://estatebank.in'}${getPropertyUrl(selectedProperty)}`}
                    readOnly
                    className="text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `${typeof window !== 'undefined' ? window.location.origin : 'https://estatebank.in'}${getPropertyUrl(selectedProperty)}`
                      )
                    }
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Share Via</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => shareViaWhatsApp(selectedProperty)}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      copyToClipboard(
                        `${typeof window !== 'undefined' ? window.location.origin : 'https://estatebank.in'}${getPropertyUrl(selectedProperty)}`
                      )
                    }
                  >
                    Copy Link
                  </Button>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Property: {selectedProperty.name} - {selectedProperty.location}
                </p>
                <p className="text-xs text-muted-foreground">
                  Price: ₹{selectedProperty.price}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PropertyForm({ onSuccess }: { onSuccess: () => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Property Name</Label>
          <Input id="name" placeholder="Enter property name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Property Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="flat">Flat</SelectItem>
              <SelectItem value="penthouse">Penthouse</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" placeholder="Enter location" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input id="price" placeholder="Enter price" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input id="bedrooms" type="number" placeholder="0" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input id="bathrooms" type="number" placeholder="0" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter property description"
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit">Save Property</Button>
      </div>
    </form>
  );
}
