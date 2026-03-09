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
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Phone, Mail, Search, Calendar, Upload, RefreshCw, Image as ImageIcon, Download, Loader2 } from "lucide-react";
import { MediaSelector } from "@/components/media-selector";
import { useState, useMemo, useEffect, useRef } from "react";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { convertToCSV, downloadCSV, readCSVFile } from "@/lib/csv-utils";
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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  properties?: number;
  status: "Active" | "Inactive";
  createdAt?: string;
  comments?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      setIsRefreshing(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });
      
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/people/clients?${params}`);
      const data = await response.json();
      
      if (data.success && data.data?.clients) {
        setClients(data.data.clients);
        setTotalPages(data.data.pagination?.pages || 1);
        setTotalItems(data.data.pagination?.total || 0);
      } else {
        setClients([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
      setClients([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [currentPage, pageSize, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchClients();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsDialogOpen(true);
  };

  const handleDelete = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      const response = await fetch(`/api/people/clients/${clientToDelete._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Client deleted successfully");
        setDeleteDialogOpen(false);
        setClientToDelete(null);
        fetchClients();
      } else {
        toast.error(data.message || "Failed to delete client");
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error("Failed to delete client");
    }
  };

  // Get unique values for filters
  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(clients.map((c) => c.status)));
  }, [clients]);

  // Export clients to CSV
  const handleExport = async () => {
    try {
      setIsExporting(true);
      // Fetch all clients (not just current page)
      const response = await fetch("/api/people/clients?limit=10000");
      const data = await response.json();
      const allClients = data.success && data.data?.clients ? data.data.clients : clients;

      const headers = ["name", "email", "phone", "status", "properties", "comments", "createdAt"];
      const csvData = allClients.map((c: Client) => ({
        name: c.name || "",
        email: c.email || "",
        phone: c.phone || "",
        status: c.status || "",
        properties: c.properties?.toString() || "0",
        comments: c.comments || "",
        createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : "",
      }));

      const csv = convertToCSV(csvData, headers);
      downloadCSV(csv, `clients-export-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success("Clients exported successfully");
    } catch (error) {
      console.error("Error exporting clients:", error);
      toast.error("Failed to export clients");
    } finally {
      setIsExporting(false);
    }
  };

  // Import clients from CSV
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

      // Map all rows to client data array for bulk import
      const clientsData = rows.map((row) => ({
        name: row.name || "",
        email: row.email || "",
        phone: row.phone || "",
        status: row.status || "Active",
        properties: row.properties ? parseInt(row.properties) : 0,
        notes: row.comments || row.notes || "",
      }));

      // Bulk import using array POST
      const response = await fetch("/api/people/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientsData),
      });

      const data = await response.json();
      if (data.success) {
        const successCount = data.data?.successCount || 0;
        const failedCount = data.data?.failedCount || 0;
        toast.success(`Import completed: ${successCount} clients imported, ${failedCount} failed`);
        fetchClients();
      } else {
        toast.error(data.error || "Failed to import clients");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error importing clients:", error);
      toast.error("Failed to import clients");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Clients</h1>
          <p className="text-xs text-muted-foreground">Manage your clients</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || clients.length === 0}
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
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingClient(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditingClient(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
              <DialogDescription>
                {editingClient ? "Update client information" : "Enter client information"}
              </DialogDescription>
            </DialogHeader>
            <ClientForm 
              client={editingClient}
              onSuccess={async (data) => {
                try {
                  if (editingClient) {
                    // Update existing client
                    const response = await fetch(`/api/people/clients/${editingClient._id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });

                    const result = await response.json();
                    if (result.success) {
                      toast.success("Client updated successfully");
                      fetchClients();
                    } else {
                      toast.error(result.message || "Failed to update client");
                      return;
                    }
                  } else {
                    // Create new client
                    const response = await fetch('/api/people/clients', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });

                    const result = await response.json();
                    if (result.success) {
                      toast.success("Client added successfully");
                      fetchClients();
                    } else {
                      toast.error(result.message || "Failed to add client");
                      return;
                    }
                  }
                  setIsDialogOpen(false);
                  setEditingClient(null);
                } catch (error) {
                  console.error('Error saving client:', error);
                  toast.error("Failed to save client");
                }
              }}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingClient(null);
              }}
            />
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search clients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Clients</CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : `${totalItems} ${totalItems === 1 ? 'client' : 'clients'} found`}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchClients}
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
                <TableHead>Contact</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading clients...
                  </TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm || statusFilter !== "all" ? "No clients match your filters. Try adjusting your search criteria." : "No clients found. Add a new client to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client._id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span className="text-xs">{client.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{client.properties}</TableCell>
                    <TableCell>
                      <Badge variant={client.status === "Active" ? "default" : "secondary"}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{client.createdAt ? format(new Date(client.createdAt), "MMM dd, yyyy") : "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(client)}
                          title="Edit client"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(client)}
                          title="Delete client"
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
          {!isLoading && clients.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
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
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{clientToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setClientToDelete(null);
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

function ClientForm({ 
  client, 
  onSuccess,
  onCancel
}: { 
  client?: Client | null;
  onSuccess: (data: { name: string; email: string; phone: string; address?: string; notes?: string }) => void;
  onCancel?: () => void;
}) {
  // Extract prefix, first name, and last name from client name
  const extractNameParts = (fullName?: string) => {
    if (!fullName) return { prefix: "", firstName: "", lastName: "" };
    const prefixes = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];
    const parts = fullName.split(" ");
    const possiblePrefix = parts[0];
    if (prefixes.includes(possiblePrefix)) {
      return {
        prefix: possiblePrefix,
        firstName: parts[1] || "",
        lastName: parts.slice(2).join(" ") || "",
      };
    }
    return {
      prefix: "",
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    };
  };

  const nameParts = extractNameParts(client?.name);
  const [formData, setFormData] = useState({
    prefix: nameParts.prefix,
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    countryCode: client?.phone?.match(/^\+\d+/)?.[0] || "+91",
    mobileNumber: client?.phone?.replace(/^\+\d+\s?/, "") || "",
    alternativeMobileNumber: "",
    email: client?.email || "",
    dateOfBirth: "",
    image: null as File | null,
    comments: (client as any)?.address || "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

  const prefixes = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];
  const countryCodes = ["+91", "+1", "+44", "+61", "+971", "+65", "+60"];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.mobileNumber.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const fullName = formData.prefix 
      ? `${formData.prefix} ${formData.firstName} ${formData.lastName}`.trim()
      : `${formData.firstName} ${formData.lastName}`.trim();
    
    const fullPhone = formData.countryCode 
      ? `${formData.countryCode} ${formData.mobileNumber}`.trim()
      : formData.mobileNumber;

    onSuccess({
      name: fullName,
      email: formData.email,
      phone: fullPhone,
      address: formData.alternativeMobileNumber, // Using alternative mobile as address for now
      notes: formData.comments,
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-primary pb-2">
        <h2 className="text-lg font-bold">Add Client</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Prefix, First Name, Last Name */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prefix">Prefix</Label>
            <Select 
              value={formData.prefix} 
              onValueChange={(value) => setFormData({ ...formData, prefix: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {prefixes.map((prefix) => (
                  <SelectItem key={prefix} value={prefix}>
                    {prefix}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input 
              id="firstName" 
              placeholder="First Name" 
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input 
              id="lastName" 
              placeholder="Last Name" 
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required 
            />
          </div>
        </div>

        {/* Row 2: Country Code, Mobile Number, Alternative Mobile Number */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="countryCode">Country Code</Label>
            <Select 
              value={formData.countryCode} 
              onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {countryCodes.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobileNumber">Mobile Number *</Label>
            <Input 
              id="mobileNumber" 
              placeholder="Mobile Number" 
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alternativeMobileNumber">Alternative Mobile Number</Label>
            <Input 
              id="alternativeMobileNumber" 
              placeholder="Alternative Mobile Number" 
              value={formData.alternativeMobileNumber}
              onChange={(e) => setFormData({ ...formData, alternativeMobileNumber: e.target.value })}
            />
          </div>
        </div>

        {/* Row 3: Email, Date of Birth, Select Image */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Email" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <div className="relative">
              <Input 
                id="dateOfBirth" 
                type="text"
                placeholder="dd/mm/yyyy" 
                value={formData.dateOfBirth}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
                  if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
                  setFormData({ ...formData, dateOfBirth: value });
                }}
                maxLength={10}
                className="pr-10"
              />
              <input
                type="date"
                id="dateOfBirth-picker"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const parts = value.split('-');
                    if (parts.length === 3) {
                      const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
                      setFormData({ ...formData, dateOfBirth: formatted });
                    }
                  }
                }}
                style={{ pointerEvents: 'auto', zIndex: 1 }}
              />
              <button
                type="button"
                onClick={() => {
                  const picker = document.getElementById('dateOfBirth-picker') as HTMLInputElement | null;
                  if (picker) {
                    if ('showPicker' in picker && typeof (picker as any).showPicker === 'function') {
                      (picker as any).showPicker();
                    } else {
                      (picker as HTMLInputElement).click();
                    }
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer z-10 pointer-events-none"
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>
            {formData.dateOfBirth && formData.dateOfBirth.length === 10 && (
              <p className="text-xs text-muted-foreground">Selected: {formData.dateOfBirth}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Select Image</Label>
            <div className="flex items-center gap-2 flex-wrap">
              <Input 
                id="image" 
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('image')?.click()}
                className="whitespace-nowrap"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose file
              </Button>
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
                placeholder="Enter image URL"
                className="flex-1 min-w-[200px]"
                onChange={(e) => {
                  const url = e.target.value;
                  if (url) {
                    setImagePreview(url);
                    setFormData({ ...formData, image: null });
                  }
                }}
              />
            </div>
            {imagePreview && (
              <div className="relative w-12 h-12 rounded overflow-hidden border">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <MediaSelector
            open={isMediaSelectorOpen}
            onOpenChange={setIsMediaSelectorOpen}
            onSelect={(url: string) => {
              setImagePreview(url);
              setFormData({ ...formData, image: null });
            }}
            type="image"
          />
        </div>

        {/* Row 4: Comments */}
        <div className="space-y-2">
          <Label htmlFor="comments">Comments</Label>
          <Textarea 
            id="comments" 
            placeholder="Comments" 
            rows={4}
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            className="resize-none"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
